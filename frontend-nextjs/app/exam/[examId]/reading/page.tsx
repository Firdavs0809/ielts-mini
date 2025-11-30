'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useExamStore } from '@/store/examStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import Timer from '@/components/exam/Timer';
import PaginationBar from '@/components/exam/PaginationBar';
import QuestionRenderer from '@/components/exam/QuestionRenderer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { finishExam, startExam } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { mockReadingQuestions, mockReadingPassage } from '@/data/mockData';
import type { Question, Passage } from '@/types';

/**
 * Reading module page
 * Displays passages and questions with navigation
 */
export default function ReadingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const {
    sessionId,
    questions,
    currentQuestionIndex,
    setCurrentQuestion,
    setQuestions,
    setExam,
    setSession,
    startTimer,
    isPracticeMode,
  } = useExamStore();

  const [passages, setPassages] = useState<Passage[]>([]);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Start exam mutation
  const startExamMutation = useMutation({
    mutationFn: () => startExam(examId),
    onSuccess: (response) => {
      setExam(response.exam, response.sections);
      setSession(response.session_id, {
        session_id: response.session_id,
        exam: response.exam.id,
        started_at: response.started_at,
        time_remaining: response.time_remaining,
        status: 'IN_PROGRESS',
        listening_score: 0,
        reading_score: 0,
        writing_score: 0,
        speaking_score: 0,
        overall_band_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      startTimer();
      loadQuestions(); // Load questions after successful start
      setHasStarted(true);
      setIsStarting(false);
    },
    onError: (error: any) => {
      console.error('Error starting exam:', error);
      const errorMessage = error?.message || error?.response?.data?.error || 'Failed to start test. Please try again.';
      alert(errorMessage);
      setIsStarting(false);
    },
  });

  // Load questions and passages
  const loadQuestions = () => {
    // Use mock data for now - in production, fetch from API
    setQuestions(mockReadingQuestions);
    setPassages([mockReadingPassage]);
    setCurrentPassage(mockReadingPassage);
  };

  // Check if exam is already started
  useEffect(() => {
    if (sessionId) {
      setHasStarted(true);
      // Load questions if session exists
      loadQuestions();
    }
  }, [sessionId]);

  useAutoSave(); // Enable auto-save

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
      // Update current passage if needed
      if (currentQuestion?.passage) {
        const passage = passages.find(p => p.id === currentQuestion.passage);
        if (passage) setCurrentPassage(passage);
      }
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

  const handleStartTest = async () => {
    setIsStarting(true);
    try {
      startExamMutation.mutate();
      // Questions will be loaded after successful start in onSuccess callback
    } catch (error) {
      // Error is handled in onError callback
    }
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

  // Show start screen if exam hasn't started
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-blue-600 mb-4">IELTS Academic Reading</h1>
            <p className="text-lg text-gray-700 mb-2">Reading Passage 1 of 3</p>
            <div className="my-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-sm text-gray-600">Progress: 0 of 0 questions answered</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Welcome to the IELTS Academic Reading Test</h2>
              <p className="text-gray-700 leading-relaxed">
                You will have 60 minutes to complete 13-14 questions for this passage. 
                Once you start, the timer will begin and you cannot pause or restart. 
                Please ensure you are ready before starting.
              </p>
            </div>
            <Button
              onClick={handleStartTest}
              disabled={isStarting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              size="lg"
            >
              {isStarting ? 'Starting...' : 'START TEST'}
            </Button>
            {startExamMutation.isError && (
              <p className="text-red-600 mt-4 text-sm">
                Failed to start test. Please try again.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Reading Test</h1>
            <Timer />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Passage */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-6 sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">
                {currentPassage?.title || 'Passage'}
              </h2>
              <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-wrap">
                {currentPassage?.content || 'Select a question to view the passage.'}
              </div>
            </div>
          </div>

          {/* Right: Questions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Navigation */}
            <div className="flex items-center justify-between">
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
                {isSubmitting ? 'Submitting...' : 'Finish Reading Test'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

