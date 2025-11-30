'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExamResult } from '@/lib/api';
import { useExamStore } from '@/store/examStore';
import { Button } from '@/components/ui/button';
import { Home, Download } from 'lucide-react';
import type { ExamResult } from '@/types';

/**
 * Result page showing exam scores and breakdown
 */
export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const { sessionId } = useExamStore();
  const [result, setResult] = useState<ExamResult | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['examResult', sessionId],
    queryFn: () => getExamResult(sessionId || ''),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (data) {
      setResult(data);
    }
  }, [data]);

  if (isLoading || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

  const { scores, breakdown } = result;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Exam Results</h1>
            <p className="text-gray-600">{result.exam.title}</p>
          </div>

          {/* Overall Band Score */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-8 mb-8 text-center">
            <p className="text-lg mb-2">Overall Band Score</p>
            <p className="text-6xl font-bold">{scores.overall.band_score.toFixed(1)}</p>
          </div>

          {/* Module Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Listening */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Listening</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {scores.listening.band_score.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">
                {scores.listening.raw_score} / {scores.listening.total_questions} correct
              </p>
            </div>

            {/* Reading */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Reading</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {scores.reading.band_score.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">
                {scores.reading.raw_score} / {scores.reading.total_questions} correct
              </p>
            </div>

            {/* Writing */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Writing</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {scores.writing.band_score.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Task 1: {scores.writing.task_1_score.toFixed(1)}</p>
                <p>Task 2: {scores.writing.task_2_score.toFixed(1)}</p>
              </div>
            </div>

            {/* Speaking */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Speaking</h3>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {scores.speaking.band_score.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          {(breakdown.reading || breakdown.listening) && (
            <div className="bg-white border rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Question Breakdown</h3>
              <div className="space-y-4">
                {breakdown.reading?.map((q) => (
                  <div
                    key={q.question_id}
                    className={`p-3 rounded ${
                      q.is_correct ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Q{q.question_number}</span>
                      <span className={q.is_correct ? 'text-green-600' : 'text-red-600'}>
                        {q.is_correct ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Your answer: {q.user_answer || '(not answered)'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Correct: {q.correct_answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/')} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

