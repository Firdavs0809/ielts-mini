'use client';

import { useExamStore } from '@/store/examStore';
import type { Question } from '@/types';
import MCQOptions from './MCQOptions';
import TFNGSelector from './TFNGSelector';
import FillBlankInput from './FillBlankInput';
import DragDropMatching from './DragDropMatching';
import ShortTextInput from './ShortTextInput';

interface QuestionRendererProps {
  question: Question;
  showCorrectAnswer?: boolean; // For practice mode
}

/**
 * Main question renderer component
 * Renders different question types based on question.question_type
 */
export default function QuestionRenderer({
  question,
  showCorrectAnswer = false,
}: QuestionRendererProps) {
  const { userAnswers, setAnswer } = useExamStore();
  const currentAnswer = userAnswers.get(question.id)?.answer || '';

  const handleAnswerChange = (answer: string) => {
    setAnswer(question.id, answer);
  };

  return (
    <div className="bg-white border rounded-lg p-6 mb-4">
      {/* Question Number and Type */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-700">
            Question {question.question_number}
          </span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
            {question.question_type}
          </span>
        </div>
        {showCorrectAnswer && (
          <div className="text-sm text-green-600 font-medium">
            Correct: {question.correct_answer}
          </div>
        )}
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {question.question_text}
        </p>
      </div>

      {/* Render based on question type */}
      {question.question_type === 'MCQ' && (
        <MCQOptions
          question={question}
          selectedAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          showCorrectAnswer={showCorrectAnswer}
        />
      )}

      {question.question_type === 'TRUE_FALSE' && (
        <TFNGSelector
          selectedAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          showCorrectAnswer={showCorrectAnswer}
          correctAnswer={question.correct_answer}
        />
      )}

      {question.question_type === 'FILL_BLANK' && (
        <FillBlankInput
          answer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          showCorrectAnswer={showCorrectAnswer}
          correctAnswer={question.correct_answer}
        />
      )}

      {question.question_type === 'MATCHING' && (
        <DragDropMatching
          question={question}
          selectedAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          showCorrectAnswer={showCorrectAnswer}
        />
      )}

      {question.question_type === 'HEADINGS' && (
        <DragDropMatching
          question={question}
          selectedAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          showCorrectAnswer={showCorrectAnswer}
        />
      )}

      {question.question_type === 'SHORT_TEXT' && (
        <ShortTextInput
          answer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          showCorrectAnswer={showCorrectAnswer}
          correctAnswer={question.correct_answer}
        />
      )}

      {/* Explanation (shown in practice mode) */}
      {showCorrectAnswer && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Explanation:</strong> {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

