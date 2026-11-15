import { store } from '../db/store.js';

/**
 * Tokenizes text into normalized words and terms for search.
 */
function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Calculates BM25 / TF-IDF hybrid relevance score for a chunk against a query.
 */
function scoreChunk(chunk, queryTerms, totalDocs, docFreqs) {
  const content = `${chunk.heading || ''} ${chunk.content || ''}`;
  const chunkTerms = tokenize(content);
  if (chunkTerms.length === 0) return 0;

  const termCounts = {};
  for (const t of chunkTerms) {
    termCounts[t] = (termCounts[t] || 0) + 1;
  }

  let score = 0;
  const k1 = 1.5;
  const b = 0.75;
  const avgDocLength = 150;
  const docLen = chunkTerms.length;

  for (const term of queryTerms) {
    const tf = termCounts[term] || 0;
    if (tf > 0) {
      const df = docFreqs[term] || 1;
      const idf = Math.log((totalDocs - df + 0.5) / (df + 0.5) + 1);
      const tfWeight = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgDocLength)));
      score += idf * tfWeight;

      // Heavy bonus if the heading matches the query term
      if ((chunk.heading || '').toLowerCase().includes(term)) {
        score += 3.0;
      }
    }
  }

  return score;
}

export class RagService {
  /**
   * Retrieves top relevant chunks strictly grounded within the user's selected scope.
   */
  static retrieveChunks({
    query,
    subjectId = null,
    fileId = null,
    slideNumber = null,
    slideRange = null,
    pageNumber = null,
    limit = 6
  }) {
    let chunks = store.get('chunks');

    // 1. Strict Subject boundary filter
    if (subjectId) {
      chunks = chunks.filter((c) => c.subjectId === subjectId);
    }

    // 2. Document boundary filter
    if (fileId) {
      chunks = chunks.filter((c) => c.fileId === fileId);
    }

    // 3. Slide filter
    if (slideNumber !== null && slideNumber !== undefined) {
      const targetSlide = parseInt(slideNumber, 10);
      chunks = chunks.filter((c) => c.slideNumber === targetSlide);
    } else if (slideRange && typeof slideRange === 'object') {
      const { start, end } = slideRange;
      if (start !== undefined && end !== undefined) {
        chunks = chunks.filter(
          (c) => c.slideNumber && c.slideNumber >= parseInt(start, 10) && c.slideNumber <= parseInt(end, 10)
        );
      }
    }

    // 4. Page filter
    if (pageNumber !== null && pageNumber !== undefined) {
      const targetPage = parseInt(pageNumber, 10);
      chunks = chunks.filter((c) => c.pageNumber === targetPage);
    }

    if (chunks.length === 0) {
      return [];
    }

    // If query is blank or broad, return chunks in document order
    if (!query || query.trim().length === 0) {
      return chunks.slice(0, limit);
    }

    const queryTerms = tokenize(query);
    if (queryTerms.length === 0) {
      return chunks.slice(0, limit);
    }

    // Compute document frequencies
    const docFreqs = {};
    for (const chunk of chunks) {
      const text = `${chunk.heading || ''} ${chunk.content || ''}`;
      const uniqueChunkTerms = new Set(tokenize(text));
      for (const term of queryTerms) {
        if (uniqueChunkTerms.has(term)) {
          docFreqs[term] = (docFreqs[term] || 0) + 1;
        }
      }
    }

    // Score all chunks
    const scored = chunks.map((chunk) => {
      const score = scoreChunk(chunk, queryTerms, chunks.length, docFreqs);
      return { chunk, score };
    });

    // Filter chunks with positive match, or take top chunks if all are zero but within scope
    let matches = scored.filter((s) => s.score > 0);
    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
      // Fallback: return first few chunks in scope so AI has at least the relevant document context
      return chunks.slice(0, Math.min(limit, 3)).map((c) => ({
        ...c,
        relevanceScore: 0.1
      }));
    }

    return matches.slice(0, limit).map((m) => ({
      ...m.chunk,
      relevanceScore: Math.round(m.score * 100) / 100
    }));
  }

  /**
   * Formats retrieved chunks into clean context text with exact citations.
   */
  static formatContextForPrompt(chunks) {
    if (!chunks || chunks.length === 0) {
      return 'NO_UPLOADED_CONTENT_AVAILABLE';
    }

    return chunks
      .map((c, index) => {
        const citationParts = [`Document: "${c.fileName}"`];
        if (c.slideNumber) citationParts.push(`Slide ${c.slideNumber}`);
        if (c.pageNumber) citationParts.push(`Page ${c.pageNumber}`);
        if (c.heading) citationParts.push(`Heading: "${c.heading}"`);

        return `--- SOURCE CHUNK [${index + 1}] (${citationParts.join(' | ')}) ---\n${c.content}\n`;
      })
      .join('\n');
  }

  /**
   * Extracts clean source references from chunks to return in API response.
   */
  static extractCitations(chunks) {
    const seen = new Set();
    const citations = [];

    for (const c of chunks) {
      const key = `${c.fileId}_${c.slideNumber || '0'}_${c.pageNumber || '0'}`;
      if (!seen.has(key)) {
        seen.add(key);
        citations.push({
          fileId: c.fileId,
          fileName: c.fileName,
          slideNumber: c.slideNumber,
          pageNumber: c.pageNumber,
          heading: c.heading
        });
      }
    }

    return citations;
  }
}
