const { Router } = require('express');
const pool = require('../db');
const { resolveRole, accessLevelsForRole } = require('../acl');
const { embed } = require('../embeddings');
const { searchChunks } = require('../retrieval');
const { chatCompletion } = require('../llm');
const { getStockMock, getNewsMock } = require('./external');

const router = Router();

const STOCK_RE = /\b(stock|share|price|ticker|market|trading|066570|krx)\b/i;
const NEWS_RE = /\b(news|headline|article|press|announcement)\b/i;

router.post('/', async (req, res) => {
  try {
    const role = resolveRole(req.headers['x-user-role']);
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    // Audit log
    await pool.query(
      'INSERT INTO audit_logs (role, endpoint, query_text) VALUES ($1, $2, $3)',
      [role, '/api/chat', message]
    );

    const accessLevels = accessLevelsForRole(role);

    // External context blocks
    const contextBlocks = [];
    if (STOCK_RE.test(message)) {
      const stock = getStockMock();
      contextBlocks.push(
        `[EXTERNAL:stock]\nTicker: ${stock.ticker}, Last Price: $${stock.last_price}, 90-day Change: ${stock.change_90d_pct}%`
      );
    }
    if (NEWS_RE.test(message)) {
      const news = getNewsMock();
      for (const item of news) {
        contextBlocks.push(
          `[EXTERNAL:news:${item.id}]\nTitle: ${item.title}\nDate: ${item.date}\nSource: ${item.source}\nSummary: ${item.summary}`
        );
      }
    }

    // Vector search with ACL
    const [queryEmbedding] = await embed(message);
    const chunks = await searchChunks(queryEmbedding, accessLevels);

    // Build internal context
    for (const c of chunks) {
      contextBlocks.push(
        `[${c.doc_id}:${c.chunk_id}] (title: "${c.title}", source: ${c.source_ref}, access: ${c.access_level})\n${c.chunk_content}`
      );
    }

    const usedAccessLevels = [...new Set(chunks.map((c) => c.access_level))];

    // System prompt
    const systemPrompt = `You are the LG Electronics company knowledge assistant. Your job is to help employees find information from company documents.

IMPORTANT: The CONTEXT BLOCKS below were retrieved by semantic search and ARE relevant to the user's question. You MUST use them to construct a helpful answer. Read all context blocks carefully and extract any information that could help answer the question.

RULES:
1. ALWAYS answer based on the CONTEXT BLOCKS below. Synthesize and combine information from multiple blocks to give comprehensive answers. Even if no single block perfectly answers the question, piece together relevant details from across all blocks.
2. Cite every fact from internal docs inline as [doc_id:chunk_id].
3. Cite external data as [EXTERNAL:stock] or [EXTERNAL:news:<id>].
4. ONLY reply "Not found in accessible knowledge base." if the context blocks are completely empty OR contain absolutely nothing even tangentially related to the question (e.g., user asks about cooking recipes but context is about electronics).
5. If the user asks about information that would require a higher access level: reply "Access restricted for your role."
6. Be concise and professional. For broad questions (e.g., "what is LG's strategy?", "tell me about the company"), summarize key themes and highlights from across all available context blocks.
7. When the question is broad or general, treat it as an invitation to summarize what you know from the context. Do NOT say "not found" for broad questions when context blocks contain company information.

The user's role is: ${role}
Allowed access levels: ${accessLevels.join(', ')}

CONTEXT BLOCKS:
---
${contextBlocks.join('\n---\n')}
---`;

    const answer = await chatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ]);

    // Extract citations from answer text
    const citationSet = new Map();
    const citationRe = /\[([0-9a-f-]{36}):([0-9a-f-]{36})\]/g;
    let match;
    while ((match = citationRe.exec(answer)) !== null) {
      const [, docId, chunkId] = match;
      const key = `${docId}:${chunkId}`;
      if (!citationSet.has(key)) {
        const chunk = chunks.find((c) => c.doc_id === docId && c.chunk_id === chunkId);
        if (chunk) {
          citationSet.set(key, {
            doc_id: docId,
            chunk_id: chunkId,
            title: chunk.title,
            source_ref: chunk.source_ref,
          });
        }
      }
    }

    res.json({
      answer,
      citations: Array.from(citationSet.values()),
      used_access_levels: usedAccessLevels,
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
