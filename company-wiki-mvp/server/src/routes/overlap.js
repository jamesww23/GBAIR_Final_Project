const { Router } = require('express');
const pool = require('../db');
const { resolveRole, accessLevelsForRole } = require('../acl');
const { embed } = require('../embeddings');
const { searchChunks } = require('../retrieval');
const { chatCompletion } = require('../llm');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const role = resolveRole(req.headers['x-user-role']);
    const { idea } = req.body;

    if (!idea || typeof idea !== 'string') {
      return res.status(400).json({ error: 'idea is required' });
    }

    // Audit log
    await pool.query(
      'INSERT INTO audit_logs (role, endpoint, query_text) VALUES ($1, $2, $3)',
      [role, '/api/overlap', idea]
    );

    const accessLevels = accessLevelsForRole(role);

    // Embed the idea and search project docs only
    const [queryEmbedding] = await embed(idea);
    const chunks = await searchChunks(queryEmbedding, accessLevels, {
      topK: 20,
      docType: 'PROJECT',
    });

    // Group by project (doc_id), keep best similarity per project
    const projectMap = new Map();
    for (const c of chunks) {
      if (!projectMap.has(c.doc_id)) {
        projectMap.set(c.doc_id, {
          doc_id: c.doc_id,
          title: c.title,
          owner: c.owner,
          status: c.status,
          similarity: c.similarity,
          chunks: [c],
        });
      } else {
        const existing = projectMap.get(c.doc_id);
        existing.chunks.push(c);
        if (c.similarity > existing.similarity) {
          existing.similarity = c.similarity;
        }
      }
    }

    // Sort by best similarity, take top 3
    const topProjects = Array.from(projectMap.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    if (topProjects.length === 0) {
      return res.json([]);
    }

    // Generate why_similar for each project via LLM
    const projectContexts = topProjects
      .map((p, i) => {
        const chunkTexts = p.chunks
          .slice(0, 3)
          .map((c) => `[${c.doc_id}:${c.chunk_id}] ${c.chunk_content}`)
          .join('\n');
        return `PROJECT ${i + 1}: "${p.title}" (owner: ${p.owner}, status: ${p.status}, similarity: ${p.similarity.toFixed(3)})\n${chunkTexts}`;
      })
      .join('\n\n');

    const systemPrompt = `You are an analyst at Nexus Dynamics. The user has proposed a new project idea. Below are existing projects that may overlap.

For each project, write one sentence explaining WHY it is similar to the proposed idea. Focus on concrete overlaps in technology, goals, or domain.

Return a JSON array of objects with the format:
[{"project_index": 1, "why_similar": "..."}, ...]

Return ONLY the JSON array, no other text.

EXISTING PROJECTS:
${projectContexts}`;

    const llmResponse = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `New project idea: ${idea}` },
    ]);

    // Parse LLM response
    let whySimilarMap = {};
    try {
      const jsonMatch = llmResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        for (const item of parsed) {
          whySimilarMap[item.project_index] = item.why_similar;
        }
      }
    } catch {
      // Fallback: use generic explanation
    }

    const results = topProjects.map((p, i) => ({
      similarity: parseFloat(p.similarity.toFixed(4)),
      title: p.title,
      owner: p.owner,
      status: p.status,
      why_similar: whySimilarMap[i + 1] || 'Similar technology or domain overlap detected.',
      citations: p.chunks.slice(0, 3).map((c) => ({
        doc_id: c.doc_id,
        chunk_id: c.chunk_id,
        title: c.title,
        source_ref: c.source_ref,
      })),
    }));

    res.json(results);
  } catch (err) {
    console.error('Overlap error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
