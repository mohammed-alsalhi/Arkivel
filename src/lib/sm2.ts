/**
 * SM-2 Spaced Repetition Algorithm
 * Grade: 0 = complete blackout, 5 = perfect recall
 */
export interface SM2Card {
  interval: number;    // days until next review
  easeFactor: number;  // difficulty factor (≥1.3)
  repetitions: number; // consecutive correct reviews
  nextDue: Date;
}

export function sm2(card: SM2Card, grade: number): SM2Card {
  const g = Math.max(0, Math.min(5, Math.round(grade)));

  let { interval, easeFactor, repetitions } = card;

  if (g >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    // Incorrect — reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - g) * (0.08 + (5 - g) * 0.02));

  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + interval);

  return { interval, easeFactor, repetitions, nextDue };
}
