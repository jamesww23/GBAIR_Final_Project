const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
const DIM = 1536;

/**
 * Embed one or more texts. Returns array of float arrays.
 * Validates dimension = 1536; throws on mismatch.
 */
async function embed(texts) {
  if (!Array.isArray(texts)) texts = [texts];

  const res = await fetch(`${OPENAI_BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embeddings API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  const embeddings = json.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);

  // Fail fast on dimension mismatch
  if (embeddings[0].length !== DIM) {
    throw new Error(
      `Embedding dimension mismatch: expected ${DIM}, got ${embeddings[0].length}. ` +
      `Check EMBEDDING_MODEL (${EMBEDDING_MODEL}).`
    );
  }

  return embeddings;
}

/**
 * Embed texts in batches to respect API limits.
 */
async function embedBatch(texts, batchSize = 20) {
  const all = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`  Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} (${batch.length} texts)`);
    const results = await embed(batch);
    all.push(...results);
  }
  return all;
}

module.exports = { embed, embedBatch };
