/**
 * Utility functions for score-based coloring
 */

export type ScoreColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'gray';

/**
 * Get color based on percentage score
 * @param percentage - The percentage score (0-100)
 * @returns Mantine color string
 */
export function getScoreColor(percentage: number): ScoreColor {
  if (percentage >= 90) {
    return 'green';
  }
  if (percentage >= 80) {
    return 'blue';
  }
  if (percentage >= 70) {
    return 'yellow';
  }
  if (percentage >= 60) {
    return 'orange';
  }
  return 'red';
}

/**
 * Get color based on score and max score
 * @param score - Current score
 * @param maxScore - Maximum possible score
 * @returns Mantine color string
 */
export function getScoreColorFromValues(score: number | null, maxScore: number | null): ScoreColor {
  if (score === null || maxScore === null || maxScore === 0) {
    return 'gray';
  }

  const percentage = (score / maxScore) * 100;
  return getScoreColor(percentage);
}

/**
 * Get color for individual question score
 * @param score - Question score
 * @param maxScore - Maximum possible score for the question (default: 100)
 * @returns Mantine color string
 */
export function getQuestionScoreColor(score: number, maxScore: number = 100): ScoreColor {
  if (score === 0 && maxScore === 0) {
    return 'gray';
  }
  const percentage = (score / maxScore) * 100;
  return getScoreColor(percentage);
}
