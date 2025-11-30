'use client';

import { cn } from '@/lib/utils';

interface TFNGSelectorProps {
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
  showCorrectAnswer?: boolean;
  correctAnswer?: string;
}

/**
 * True/False/Not Given selector component
 * Grid layout similar to real IELTS exam
 */
export default function TFNGSelector({
  selectedAnswer,
  onAnswerChange,
  showCorrectAnswer = false,
  correctAnswer = '',
}: TFNGSelectorProps) {
  const options = ['TRUE', 'FALSE', 'NOT GIVEN'];

  const handleSelect = (option: string) => {
    onAnswerChange(option);
  };

  const isCorrect = (option: string) => {
    return showCorrectAnswer && option === correctAnswer;
  };

  const isIncorrect = (option: string) => {
    return (
      showCorrectAnswer &&
      option === selectedAnswer &&
      option !== correctAnswer
    );
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {options.map((option) => {
        const isSelected = selectedAnswer === option;
        const correct = isCorrect(option);
        const incorrect = isIncorrect(option);

        return (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={cn(
              'p-4 border-2 rounded-lg font-medium transition-all',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
              {
                'border-blue-500 bg-blue-50 text-blue-700': isSelected && !showCorrectAnswer,
                'border-green-500 bg-green-50 text-green-700': correct,
                'border-red-500 bg-red-50 text-red-700': incorrect,
                'border-gray-300 bg-white text-gray-700': !isSelected && !correct && !incorrect,
              }
            )}
          >
            {option}
            {correct && (
              <span className="block text-xs text-green-600 mt-1">✓ Correct</span>
            )}
            {incorrect && (
              <span className="block text-xs text-red-600 mt-1">✗ Incorrect</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

