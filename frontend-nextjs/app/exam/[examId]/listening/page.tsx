'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useExamStore } from '@/store/examStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import Timer from '@/components/exam/Timer';
import AudioPlayer from '@/components/exam/AudioPlayer';
import PaginationBar from '@/components/exam/PaginationBar';
import QuestionRenderer from '@/components/exam/QuestionRenderer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { finishExam, getListeningAudioUrl } from '@/lib/api';
import type { Question, ListeningAudio } from '@/types';

/**
 * Listening module page
 * Displays audio player and questions
 */
export default function ListeningPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const {
    sessionId,
    questions,
    currentQuestionIndex,
    setCurrentQuestion,
    setQuestions,
    isPracticeMode,
  } = useExamStore();

  const [audio, setAudio] = useState<ListeningAudio | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAutoSave();

  useEffect(() => {
    // Load questions and audio (mock data for now)
    const mockQuestions: Question[] = [];
    setQuestions(mockQuestions);
    
    // Load audio
    // In production: fetch from API
  }, [setQuestions]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
    }
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestion(index);
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      await finishExam(sessionId);
      router.push(`/exam/${examId}/result`);
    } catch (error) {
      console.error('Error finishing exam:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Listening Test</h1>
            <Timer />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Audio Player */}
          {audio && (
            <AudioPlayer
              audioUrl={getListeningAudioUrl(audio.id)}
              timestamps={audio.timestamps}
              onTimeUpdate={(time) => {
                // Could highlight current question based on timestamp
              }}
            />
          )}

          {/* Question Navigation */}
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Current Question */}
          {currentQuestion && (
            <QuestionRenderer
              question={currentQuestion}
              showCorrectAnswer={isPracticeMode}
            />
          )}

          {/* Pagination Bar */}
          <PaginationBar
            totalQuestions={questions.length}
            onQuestionClick={handleQuestionClick}
          />

          {/* Finish Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Finish Listening Test'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

