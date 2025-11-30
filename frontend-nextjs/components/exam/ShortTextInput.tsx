'use client';

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ShortTextInputProps {
  answer: string;
  onAnswerChange: (answer: string) => void;
  showCorrectAnswer?: boolean;
  correctAnswer?: string;
}

/**
 * Short text answer input component
 * For questions requiring longer text responses
 */
export default function ShortTextInput({
  answer,
  onAnswerChange,
  showCorrectAnswer = false,
  correctAnswer = '',
}: ShortTextInputProps) {
  const isCorrect = showCorrectAnswer && 
    answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

  return (
    <div className="space-y-2">
      <Textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer here..."
        rows={4}
        className={cn(
          'w-full',
          {
            'border-green-500 bg-green-50': isCorrect && showCorrectAnswer,
          }
        )}
      />
      {showCorrectAnswer && (
        <div className="text-sm">
          {isCorrect ? (
            <span className="text-green-600 font-medium">✓ Correct</span>
          ) : (
            <div>
              <span className="text-gray-600">
                Correct answer: {correctAnswer}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

