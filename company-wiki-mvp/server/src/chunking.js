/**
 * Chunk text into segments of 600–900 chars with ~100 char overlap.
 * Tries to split on sentence boundaries when possible.
 */
function chunkText(text, minSize = 600, maxSize = 900, overlap = 100) {
  const trimmed = text.trim();
  if (trimmed.length <= maxSize) return [trimmed];

  // Split on sentence-ending punctuation followed by whitespace
  const sentences = trimmed.match(/[^.!?]*[.!?]+[\s]*/g);
  // Fallback: if regex fails, treat entire text as one "sentence"
  const parts = sentences && sentences.length > 0 ? sentences : [trimmed];

  const chunks = [];
  let current = '';

  for (const sentence of parts) {
    // If adding this sentence keeps us under max, accumulate
    if (current.length + sentence.length <= maxSize) {
      current += sentence;
      continue;
    }

    // If we have enough, push chunk and start a new one with overlap
    if (current.length >= minSize) {
      chunks.push(current.trim());
      const overlapText = current.slice(-overlap);
      current = overlapText + sentence;
    } else if (sentence.length > maxSize) {
      // Very long sentence: flush current, then force-split the sentence
      if (current.length > 0) chunks.push(current.trim());
      for (let i = 0; i < sentence.length; i += maxSize - overlap) {
        chunks.push(sentence.slice(i, i + maxSize).trim());
      }
      current = '';
    } else {
      current += sentence;
    }
  }

  if (current.trim().length > 0) {
    // Merge tiny trailing chunk with previous if possible
    if (chunks.length > 0 && current.trim().length < minSize / 3) {
      chunks[chunks.length - 1] += ' ' + current.trim();
    } else {
      chunks.push(current.trim());
    }
  }

  return chunks;
}

module.exports = { chunkText };
