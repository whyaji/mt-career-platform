<?php

namespace App\Services;

use App\Models\Question;
use App\Models\BatchQuestion;

class ScoringService
{
    /**
     * Calculate scores for all answers
     */
    public function calculateScores(array $answers, string $batchId): array
    {
        $batchQuestions = BatchQuestion::where('batch_id', $batchId)
            ->where('is_active', true)
            ->with('question')
            ->get();

        $scoring = [];
        $totalScore = 0;
        $maxScore = 0;

        foreach ($answers as $answer) {
            $questionCode = $answer['question_code'];
            $answerValue = $answer['answer'];

            // Find the corresponding batch question
            $batchQuestion = $batchQuestions->first(function ($bq) use ($questionCode) {
                return $bq->question && $bq->question->code === $questionCode;
            });

            if (!$batchQuestion || !$batchQuestion->question) {
                continue;
            }

            $question = $batchQuestion->question;
            $score = $this->calculateQuestionScore($question, $answerValue);
            $maxQuestionScore = $this->getMaxQuestionScore($question);

            $scoring[] = [
                'question_id' => $question->id,
                'question_code' => $questionCode,
                'answer' => $answerValue,
                'score' => $score,
                'max_score' => $maxQuestionScore,
                'scoring_rules' => $question->scoring_rules,
            ];

            $totalScore += $score;
            $maxScore += $maxQuestionScore;
        }

        return [
            'scoring' => $scoring,
            'total_score' => $totalScore,
            'max_score' => $maxScore,
        ];
    }

    /**
     * Calculate score for a single question
     */
    private function calculateQuestionScore(Question $question, $answer): int
    {
        $scoring = $question->scoring_rules;

        if (!$scoring || !($scoring['enabled'] ?? false)) {
            return 0;
        }

        $score = 0;
        $conditions = $scoring['conditions'] ?? [];

        foreach ($conditions as $condition) {
            if ($this->evaluateScoringCondition($condition, $answer)) {
                $score += $condition['points'] ?? 0;
            }
        }

        return min($score, $scoring['max_score'] ?? 0);
    }

    /**
     * Get maximum possible score for a question
     */
    private function getMaxQuestionScore(Question $question): int
    {
        $scoring = $question->scoring_rules;

        if (!$scoring || !($scoring['enabled'] ?? false)) {
            return 0;
        }

        return $scoring['max_score'] ?? 0;
    }

    /**
     * Evaluate a scoring condition
     */
    private function evaluateScoringCondition(array $condition, $answer): bool
    {
        $operator = $condition['operator'] ?? 'equals';
        $expectedValue = $condition['value'] ?? null;

        switch ($operator) {
            case 'equals':
                return is_string($answer) && is_string($expectedValue)
                    ? strcasecmp($answer, $expectedValue) === 0
                    : $answer == $expectedValue;
            case 'not_equals':
                return is_string($answer) && is_string($expectedValue)
                    ? strcasecmp($answer, $expectedValue) !== 0
                    : $answer != $expectedValue;
            case 'contains':
                return is_string($answer) && is_string($expectedValue)
                    ? stripos($answer, $expectedValue) !== false
                    : (is_string($answer) && strpos($answer, $expectedValue) !== false);
            case 'greater_than':
                return is_numeric($answer) && is_numeric($expectedValue) && $answer > $expectedValue;
            case 'less_than':
                return is_numeric($answer) && is_numeric($expectedValue) && $answer < $expectedValue;
            case 'greater_equal':
                return is_numeric($answer) && is_numeric($expectedValue) && $answer >= $expectedValue;
            case 'less_equal':
                return is_numeric($answer) && is_numeric($expectedValue) && $answer <= $expectedValue;
            case 'in':
                if (is_array($expectedValue)) {
                    if (is_string($answer)) {
                        // Case-insensitive comparison for string values in array
                        return in_array($answer, array_map('strtolower', $expectedValue)) ||
                            in_array($answer, $expectedValue);
                    }
                    return in_array($answer, $expectedValue);
                }
                return false;
            case 'not_in':
                if (is_array($expectedValue)) {
                    if (is_string($answer)) {
                        // Case-insensitive comparison for string values in array
                        return !in_array($answer, array_map('strtolower', $expectedValue)) &&
                            !in_array($answer, $expectedValue);
                    }
                    return !in_array($answer, $expectedValue);
                }
                return false;
            default:
                return false;
        }
    }

    /**
     * Get scoring summary for a batch
     */
    public function getScoringSummary(string $batchId): array
    {
        $batchQuestions = BatchQuestion::where('batch_id', $batchId)
            ->where('is_active', true)
            ->with('question')
            ->get();

        $totalMaxScore = 0;
        $scoringQuestions = 0;

        foreach ($batchQuestions as $batchQuestion) {
            if ($batchQuestion->question && $batchQuestion->question->scoring_rules) {
                $scoring = $batchQuestion->question->scoring_rules;
                if ($scoring['enabled'] ?? false) {
                    $totalMaxScore += $scoring['max_score'] ?? 0;
                    $scoringQuestions++;
                }
            }
        }

        return [
            'total_max_score' => $totalMaxScore,
            'scoring_questions' => $scoringQuestions,
            'total_questions' => $batchQuestions->count(),
        ];
    }
}
