const pool = require('./db');

/**
 * Full-text search with ACL enforcement.
 *
 * @param {string}   queryText      - user's search query
 * @param {string[]} accessLevels   - allowed access levels for the user's role
 * @param {object}   opts
 * @param {number}   opts.topK      - number of results (default 8)
 * @param {string}   opts.docType   - optional filter (PROJECT, POLICY, COMM)
 * @returns {Promise<Array>}
 */
async function searchChunks(queryText, accessLevels, { topK = 8, docType = null } = {}) {
  // Convert query to tsquery: split words and join with &
  const words = queryText.trim().split(/\s+/).filter(Boolean);
  const tsQuery = words.map(w => w.replace(/[^\w]/g, '')).filter(Boolean).join(' | ');

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

  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = { searchChunks };
