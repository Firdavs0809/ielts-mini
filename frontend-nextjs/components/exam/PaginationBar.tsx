'use client';

import { useExamStore } from '@/store/examStore';
import { getQuestionStatusClass } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PaginationBarProps {
  totalQuestions: number;
  onQuestionClick: (index: number) => void;
  showReviewMode?: boolean;
}

/**
 * Pagination bar showing question numbers (1-40 style)
 * Similar to real IELTS exam interface
 */
export default function PaginationBar({
  totalQuestions,
  onQuestionClick,
  showReviewMode = false,
}: PaginationBarProps) {
  const { currentQuestionIndex, userAnswers, questions } = useExamStore();

  const isAnswered = (index: number) => {
    if (index >= questions.length) return false;
    const question = questions[index];
    return userAnswers.has(question.id) && 
           userAnswers.get(question.id)?.answer?.trim() !== '';
  };

  const isReview = (index: number) => {
    // Implement review marking logic if needed
    return false;
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const index = i;
          const answered = isAnswered(index);
          const active = index === currentQuestionIndex;
          const review = isReview(index);
          
          return (
            <button
              key={index}
              onClick={() => onQuestionClick(index)}
              className={cn(
                'ielts-question-number',
                getQuestionStatusClass(answered, active, review)
              )}
              title={`Question ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded"></div>
          <span>Not answered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100 rounded"></div>
          <span>Current</span>
        </div>
        {showReviewMode && (
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-yellow-500 bg-yellow-50 rounded"></div>
            <span>Review</span>
          </div>
        )}
      </div>
    </div>
  );
}

