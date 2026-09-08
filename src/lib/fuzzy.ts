/**
 * Compute the Levenshtein (edit) distance between two strings.
 * Returns the minimum number of single-character edits (insertions,
 * deletions, or substitutions) required to change one string into the other.
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  const aLen = aLower.length;
  const bLen = bLower.length;

  // Edge cases
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  // Use two rows instead of full matrix for memory efficiency
  let prevRow = new Array<number>(bLen + 1);
  let currRow = new Array<number>(bLen + 1);

  for (let j = 0; j <= bLen; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= aLen; i++) {
    currRow[0] = i;
    for (let j = 1; j <= bLen; j++) {
      const cost = aLower[i - 1] === bLower[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,       // deletion
        currRow[j - 1] + 1,   // insertion
        prevRow[j - 1] + cost  // substitution
      );
    }
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[bLen];
}

/**
 * Compute the trigram similarity between two strings.
 * Returns a value between 0 and 1, where 1 means identical trigram sets.
 *
 * Trigrams are sequences of 3 consecutive characters. This mirrors the
 * approach used by PostgreSQL's pg_trgm extension.
 */
export function trigramSimilarity(a: string, b: string): number {
  const trigramsA = getTrigrams(a.toLowerCase());
  const trigramsB = getTrigrams(b.toLowerCase());

  if (trigramsA.size === 0 && trigramsB.size === 0) return 1;
  if (trigramsA.size === 0 || trigramsB.size === 0) return 0;

  let intersection = 0;
  for (const trigram of trigramsA) {
    if (trigramsB.has(trigram)) {
      intersection++;
    }
  }

  // Jaccard-style similarity: |A ∩ B| / |A ∪ B|
  const union = trigramsA.size + trigramsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Extract the set of trigrams from a string.
 * Pads the string with spaces at the start and end (like pg_trgm).
 */
function getTrigrams(s: string): Set<string> {
  const padded = `  ${s} `;
  const trigrams = new Set<string>();
  for (let i = 0; i <= padded.length - 3; i++) {
    trigrams.add(padded.substring(i, i + 3));
  }
  return trigrams;
}

export type FuzzyMatch = {
  title: string;
  score: number;
};

/**
 * Find titles that fuzzy-match the query within the given threshold.
 * Uses a combination of trigram similarity and Levenshtein distance
 * to rank results.
 *
 * @param query - The search query
 * @param titles - Array of candidate titles to match against
 * @param threshold - Minimum trigram similarity (0-1) to include in results. Default 0.2.
 * @returns Array of matching titles sorted by score (highest first)
 */
export function findFuzzyMatches(
  query: string,
  titles: string[],
  threshold: number = 0.2
): FuzzyMatch[] {
  if (!query || titles.length === 0) return [];

  const queryLower = query.toLowerCase();

  const matches: FuzzyMatch[] = [];

  for (const title of titles) {
    const titleLower = title.toLowerCase();

    // Calculate trigram similarity
    const similarity = trigramSimilarity(queryLower, titleLower);

    if (similarity >= threshold) {
      // Combine trigram similarity with a normalized Levenshtein bonus
      // so titles with fewer edits rank higher
      const maxLen = Math.max(queryLower.length, titleLower.length);
      const editDist = levenshteinDistance(queryLower, titleLower);
      const normalizedDist = maxLen > 0 ? 1 - editDist / maxLen : 1;

      // Weighted score: 70% trigram, 30% Levenshtein
      const score = similarity * 0.7 + normalizedDist * 0.3;

      matches.push({ title, score });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  return matches;
}
