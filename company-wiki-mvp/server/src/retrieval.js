const pool = require('./db');

/**
 * Full-text search with ACL enforcement.
 * Uses OR-based tsquery for broad matching, with ILIKE fallback.
 */
async function searchChunks(queryText, accessLevels, { topK = 8, docType = null } = {}) {
  // Extract meaningful words (3+ chars, skip common question words)
  const stopWords = new Set(['what', 'which', 'where', 'when', 'how', 'who', 'why', 'does', 'the', 'and', 'for', 'are', 'this', 'that', 'with', 'from', 'have', 'has', 'can', 'will', 'about', 'tell', 'please']);
  const words = queryText.trim().toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^\w]/g, ''))
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (words.length === 0) {
    // No meaningful words — return empty
    return [];
  }

  // Build OR-based tsquery for broad matching
  const tsQuery = words.join(' | ');

  const params = [tsQuery, accessLevels];
  let paramIdx = 3;

  let sql = `
    SELECT
      dc.doc_id,
      dc.chunk_id,
      d.title,
      d.source_ref,
      dc.content AS chunk_content,
      d.access_level,
      d.doc_type,
      d.owner,
      d.status,
      ts_rank(dc.tsv, to_tsquery('english', $1)) AS similarity
    FROM document_chunks dc
    JOIN documents d ON dc.doc_id = d.id
    WHERE d.access_level = ANY($2)
      AND dc.tsv @@ to_tsquery('english', $1)
  `;

  if (docType) {
    sql += ` AND d.doc_type = $${paramIdx}`;
    params.push(docType);
    paramIdx++;
  }

  sql += `
    ORDER BY similarity DESC
    LIMIT $${paramIdx}
  `;
  params.push(topK);

  let result = await pool.query(sql, params);

  // Fallback: if full-text search returns nothing, use ILIKE keyword matching
  if (result.rows.length === 0) {
    const likeConditions = words.map((_, i) => `dc.content ILIKE $${i + 3}`);
    const likeParams = words.map(w => `%${w}%`);

    let fallbackSql = `
      SELECT
        dc.doc_id,
        dc.chunk_id,
        d.title,
        d.source_ref,
        dc.content AS chunk_content,
        d.access_level,
        d.doc_type,
        d.owner,
        d.status,
        1.0 AS similarity
      FROM document_chunks dc
      JOIN documents d ON dc.doc_id = d.id
      WHERE d.access_level = ANY($1)
        AND (${likeConditions.join(' OR ')})
    `;

    const fallbackParams = [accessLevels, topK, ...likeParams];

    if (docType) {
      fallbackSql += ` AND d.doc_type = $${words.length + 3}`;
      fallbackParams.push(docType);
    }

    fallbackSql += ` LIMIT $2`;

    result = await pool.query(fallbackSql, fallbackParams);
  }

  return result.rows;
}

module.exports = { searchChunks };
