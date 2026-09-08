/**
 * Pure-JS writing analysis — no external deps.
 * Works on plain text extracted from HTML.
 */

/** Strip HTML tags from content. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Count syllables in an English word (heuristic). */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const matches = w.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;
  if (w.endsWith("e") && count > 1) count--;
  return Math.max(1, count);
}

/** Split text into sentences (basic). */
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Split text into words. */
function splitWords(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0);
}

export interface ReadabilityScore {
  fleschScore: number;       // 0–100; higher = easier to read
  grade: string;             // e.g. "Grade 8"
  avgSentenceLength: number; // words per sentence
  avgSyllablesPerWord: number;
  readingTimeMinutes: number;
  wordCount: number;
}

/**
 * Compute Flesch Reading Ease score and related metrics.
 */
export function computeReadability(html: string): ReadabilityScore {
  const text = stripHtml(html);
  const sentences = splitSentences(text);
  const words = splitWords(text);

  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);

  const totalSyllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / Math.max(1, wordCount);

  // Flesch Reading Ease
  const fleschScore = Math.max(
    0,
    Math.min(
      100,
      206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
    )
  );

  // Approximate Flesch-Kincaid grade level
  const gradeLevel = Math.round(
    0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59
  );
  const grade = gradeLevel <= 0 ? "Elementary" : `Grade ${Math.min(gradeLevel, 16)}`;

  // Average adult reading speed: ~238 words/min
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 238));

  return {
    fleschScore: Math.round(fleschScore),
    grade,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
    readingTimeMinutes,
    wordCount,
  };
}

export interface WritingIssue {
  type: "passive_voice" | "long_sentence" | "readability" | "no_excerpt";
  message: string;
  severity: "info" | "warning" | "error";
}

/**
 * Analyse HTML content and return a list of writing issues.
 */
export function analyzeWriting(html: string, hasExcerpt: boolean): WritingIssue[] {
  const text = stripHtml(html);
  const issues: WritingIssue[] = [];

  const readability = computeReadability(html);

  // Passive voice detection (simple heuristic: "was/were/is/are/been + past participle")
  const passivePattern = /\b(was|were|is|are|been|being|be)\s+\w+ed\b/gi;
  const passiveMatches = text.match(passivePattern) || [];
  if (passiveMatches.length > 3) {
    issues.push({
      type: "passive_voice",
      message: `Found ${passiveMatches.length} possible passive-voice constructions. Consider using active voice.`,
      severity: "info",
    });
  }

  // Long sentences
  const sentences = splitSentences(text);
  const longSentences = sentences.filter((s) => splitWords(s).length > 35);
  if (longSentences.length > 0) {
    issues.push({
      type: "long_sentence",
      message: `${longSentences.length} sentence${longSentences.length > 1 ? "s are" : " is"} over 35 words. Consider splitting them.`,
      severity: "warning",
    });
  }

  // Readability
  if (readability.fleschScore < 40) {
    issues.push({
      type: "readability",
      message: `Readability score is ${readability.fleschScore}/100 (${readability.grade}). This article may be hard to read.`,
      severity: "warning",
    });
  }

  // Missing excerpt
  if (!hasExcerpt && readability.wordCount > 50) {
    issues.push({
      type: "no_excerpt",
      message: "This article has no excerpt. Add one to improve search snippets and link previews.",
      severity: "info",
    });
  }

  return issues;
}
