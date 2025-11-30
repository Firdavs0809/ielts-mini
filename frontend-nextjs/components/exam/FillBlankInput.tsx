'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FillBlankInputProps {
  answer: string;
  onAnswerChange: (answer: string) => void;
  showCorrectAnswer?: boolean;
  correctAnswer?: string;
}

/**
 * Fill in the blank input component
 * For questions requiring text input
 */
export default function FillBlankInput({
  answer,
  onAnswerChange,
  showCorrectAnswer = false,
  correctAnswer = '',
}: FillBlankInputProps) {
  const isCorrect = showCorrectAnswer && answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  const isIncorrect = showCorrectAnswer && answer.trim() !== '' && !isCorrect;

  // Check if multiple correct answers (comma-separated)
  const correctAnswers = correctAnswer
    .split(',')
    .map(a => a.trim().toLowerCase());
  const isCorrectMultiple = showCorrectAnswer && 
    answer.trim() !== '' &&
    correctAnswers.includes(answer.trim().toLowerCase());

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer here..."
        className={cn(
          'w-full text-lg',
          {
            'border-green-500 bg-green-50': isCorrect || isCorrectMultiple,
            'border-red-500 bg-red-50': isIncorrect,
          }
        )}
      />
      {showCorrectAnswer && (
        <div className="text-sm">
          {isCorrect || isCorrectMultiple ? (
            <span className="text-green-600 font-medium">✓ Correct</span>
          ) : isIncorrect ? (
            <div>
              <span className="text-red-600 font-medium">✗ Incorrect</span>
              <span className="text-gray-600 ml-2">
                Correct answer: {correctAnswer}
              </span>
            </div>
          ) : (
            <span className="text-gray-600">
              Correct answer: {correctAnswer}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

