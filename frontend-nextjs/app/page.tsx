'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { startExam } from '@/lib/api';
import { useExamStore } from '@/store/examStore';
import { BookOpen, Headphones, FileText, Mic } from 'lucide-react';

/**
 * Home page - Choose exam and module
 */
export default function HomePage() {
  const router = useRouter();
  const { setExam, setSession, setCurrentSection } = useExamStore();
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  // Mock exam ID - in production, fetch from API
  const examId = 'your-exam-id-here'; // Replace with actual exam ID

  const { mutate: handleStartExam, isPending } = useMutation({
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
    },
  });

  const handleModuleSelect = async (sectionType: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING') => {
    setCurrentSection(sectionType);
    
    // Navigate to the module page - it will handle starting the exam
    router.push(`/exam/${examId}/${sectionType.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
            IELTS Exam Platform
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Choose a module to begin your practice test
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Listening Module */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-blue-500 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Listening</h2>
                  <p className="text-sm text-gray-600">30 minutes • 40 questions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Listen to audio recordings and answer questions. Four parts with different topics.
              </p>
              <Button
                onClick={() => handleModuleSelect('LISTENING')}
                className="w-full"
                disabled={isPending}
              >
                Start Listening Test
              </Button>
            </div>

            {/* Reading Module */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-green-500 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Reading</h2>
                  <p className="text-sm text-gray-600">60 minutes • 40 questions</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Read three passages and answer questions. Various question types including MCQ, T/F/NG, and matching.
              </p>
              <Button
                onClick={() => handleModuleSelect('READING')}
                className="w-full"
                variant="outline"
                disabled={isPending}
              >
                Start Reading Test
              </Button>
            </div>

            {/* Writing Module */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-purple-500 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Writing</h2>
                  <p className="text-sm text-gray-600">60 minutes • 2 tasks</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Complete two writing tasks. Task 1 (150 words) and Task 2 (250 words).
              </p>
              <Button
                onClick={() => handleModuleSelect('WRITING')}
                className="w-full"
                variant="outline"
                disabled={isPending}
              >
                Start Writing Test
              </Button>
            </div>

            {/* Speaking Module */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-orange-500 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Mic className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Speaking</h2>
                  <p className="text-sm text-gray-600">11-14 minutes • 3 parts</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Record your responses to speaking prompts. Three parts with different formats.
              </p>
              <Button
                onClick={() => handleModuleSelect('SPEAKING')}
                className="w-full"
                variant="outline"
                disabled={isPending}
              >
                Start Speaking Test
              </Button>
            </div>
          </div>

          {/* Practice Mode Toggle */}
          <div className="mt-8 text-center">
            <label className="flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4"
                onChange={(e) => {
                  useExamStore.setState({ isPracticeMode: e.target.checked });
                }}
              />
              <span className="text-sm text-gray-600">
                Enable Practice Mode (Show correct answers)
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

