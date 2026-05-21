/**
 * Computes Flesch Reading Ease score and maps it to a grade label.
 * Works on plain text extracted from article HTML.
 *
 * Flesch Reading Ease:
 *   90-100: Very Easy (5th grade)
 *   80-90:  Easy
 *   70-80:  Fairly Easy
 *   60-70:  Standard
 *   50-60:  Fairly Difficult
 *   30-50:  Difficult
 *   0-30:   Very Confusing
 */

const SYLLABLE_RE = /[aeiouy]{1,2}/gi;

function countSyllables(word: string): number {
  const w = word.replace(/e$/, "").replace(/[^a-z]/gi, "").toLowerCase();
  const m = w.match(SYLLABLE_RE);
  return Math.max(1, m ? m.length : 1);
}

function fleschScore(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = Math.max(1, text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length);
  if (words.length === 0) return 100;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length);
}

type Level = { label: string; color: string };
function scoreToLevel(score: number): Level {
  if (score >= 80) return { label: score >= 90 ? "Very Easy" : "Easy", color: "ui-chip-success" };
  if (score >= 60) return { label: score >= 70 ? "Fairly Easy" : "Standard", color: "ui-chip-info" };
  if (score >= 30) return { label: score >= 50 ? "Fairly Difficult" : "Difficult", color: "ui-chip-warning" };
  return { label: "Very Complex", color: "ui-chip-danger" };
}

interface Props {
  /** Plain-text content of the article (tags already stripped) */
  text: string;
}

export default function ReadingLevelBadge({ text }: Props) {
  if (!text || text.trim().length < 50) return null;
  const score = fleschScore(text);
  const { label, color } = scoreToLevel(score);

  return (
    <span
      title={`Flesch Reading Ease: ${Math.round(score)} — ${label}`}
      className={`ui-chip font-medium ${color}`}
    >
      {label}
    </span>
  );
}
