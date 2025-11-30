'use client';

import { cn } from '@/lib/utils';
import type { Question } from '@/types';

interface MCQOptionsProps {
  question: Question;
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
  showCorrectAnswer?: boolean;
}

/**
 * Multiple Choice Question component
 * Renders options A, B, C, D (or more)
 */
export default function MCQOptions({
  question,
  selectedAnswer,
  onAnswerChange,
  showCorrectAnswer = false,
}: MCQOptionsProps) {
  const options = question.options || [];

  const handleOptionClick = (optionLabel: string) => {
    onAnswerChange(optionLabel);
  };

  const isCorrect = (optionLabel: string) => {
    return showCorrectAnswer && optionLabel === question.correct_answer;
  };

  const isIncorrect = (optionLabel: string) => {
    return (
      showCorrectAnswer &&
      optionLabel === selectedAnswer &&
      optionLabel !== question.correct_answer
    );
  };

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = selectedAnswer === option.option_label;
        const correct = isCorrect(option.option_label);
        const incorrect = isIncorrect(option.option_label);

        return (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.option_label)}
            className={cn(
              'w-full text-left p-4 border-2 rounded-lg transition-all',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
              {
                'border-blue-500 bg-blue-50': isSelected && !showCorrectAnswer,
                'border-green-500 bg-green-50': correct,
                'border-red-500 bg-red-50': incorrect,
                'border-gray-300 bg-white': !isSelected && !correct && !incorrect,
              }
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold',
                  {
                    'border-blue-500 bg-blue-500 text-white': isSelected && !showCorrectAnswer,
                    'border-green-500 bg-green-500 text-white': correct,
                    'border-red-500 bg-red-500 text-white': incorrect,
                    'border-gray-300 bg-white text-gray-700': !isSelected && !correct && !incorrect,
                  }
                )}
              >
                {option.option_label}
              </div>
              <div className="flex-1">
                <p className="text-gray-800">{option.option_text}</p>
                {correct && (
                  <span className="text-xs text-green-600 font-medium mt-1 block">
                    ✓ Correct Answer
                  </span>
                )}
                {incorrect && (
                  <span className="text-xs text-red-600 font-medium mt-1 block">
                    ✗ Your Answer (Incorrect)
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

