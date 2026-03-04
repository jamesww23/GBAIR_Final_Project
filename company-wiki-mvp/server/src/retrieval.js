const pool = require('./db');

/**
 * Vector similarity search with ACL enforcement.
 *
 * @param {number[]} queryEmbedding  - 1536-dim float array
 * @param {string[]} accessLevels    - allowed access levels for the user's role
 * @param {object}   opts
 * @param {number}   opts.topK       - number of results (default 8)
 * @param {string}   opts.docType    - optional filter (PROJECT, POLICY, COMM)
 * @returns {Promise<Array>}
 */
async function searchChunks(queryEmbedding, accessLevels, { topK = 8, docType = null } = {}) {
  const client = await pool.connect();
  try {
    const vectorStr = `[${queryEmbedding.join(',')}]`;
    const params = [vectorStr, accessLevels];
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
        1 - (dc.embedding <=> $1::vector) AS similarity
      FROM document_chunks dc
      JOIN documents d ON dc.doc_id = d.id
      WHERE d.access_level = ANY($2)
    `;

    if (docType) {
      sql += ` AND d.doc_type = $${paramIdx}`;
      params.push(docType);
      paramIdx++;
    }

    sql += `
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $${paramIdx}
    `;
    params.push(topK);

    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

module.exports = { searchChunks };
