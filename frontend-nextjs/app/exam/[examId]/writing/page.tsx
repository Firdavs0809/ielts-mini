'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useExamStore } from '@/store/examStore';
import Timer from '@/components/exam/Timer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { submitWritingTask, finishExam } from '@/lib/api';
import { countWords } from '@/lib/utils';

/**
 * Writing module page
 * Task 1 and Task 2 with word count
 */
export default function WritingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const { sessionId } = useExamStore();
  const [currentTask, setCurrentTask] = useState<'TASK_1' | 'TASK_2'>('TASK_1');
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentText = currentTask === 'TASK_1' ? task1Text : task2Text;
  const setCurrentText = currentTask === 'TASK_1' ? setTask1Text : setTask2Text;
  const wordCount = countWords(currentText);
  const minWords = currentTask === 'TASK_1' ? 150 : 250;

  const handleSubmitTask = async () => {
    if (!sessionId) return;
    if (wordCount < minWords) {
      alert(`Task ${currentTask === 'TASK_1' ? '1' : '2'} requires at least ${minWords} words.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitWritingTask(sessionId, currentTask, currentText);
      if (currentTask === 'TASK_1') {
        setCurrentTask('TASK_2');
      } else {
        // Both tasks done, finish exam
        await finishExam(sessionId);
        router.push(`/exam/${examId}/result`);
      }
    } catch (error) {
      console.error('Error submitting writing task:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      // Submit remaining task if not submitted
      if (task1Text && countWords(task1Text) >= 150) {
        await submitWritingTask(sessionId, 'TASK_1', task1Text);
      }
      if (task2Text && countWords(task2Text) >= 250) {
        await submitWritingTask(sessionId, 'TASK_2', task2Text);
      }
      await finishExam(sessionId);
      router.push(`/exam/${examId}/result`);
    } catch (error) {
      console.error('Error finishing exam:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Writing Test</h1>
            <Timer />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Task Selector */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex gap-2">
              <Button
                variant={currentTask === 'TASK_1' ? 'default' : 'outline'}
                onClick={() => setCurrentTask('TASK_1')}
              >
                Task 1
              </Button>
              <Button
                variant={currentTask === 'TASK_2' ? 'default' : 'outline'}
                onClick={() => setCurrentTask('TASK_2')}
              >
                Task 2
              </Button>
            </div>
          </div>

          {/* Task Instructions */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">
              Writing Task {currentTask === 'TASK_1' ? '1' : '2'}
            </h2>
            <p className="text-gray-700 mb-4">
              {currentTask === 'TASK_1' ? (
                <>
                  You should spend about 20 minutes on this task. Write at least 150 words.
                  Describe the information shown in the chart/graph/diagram.
                </>
              ) : (
                <>
                  You should spend about 40 minutes on this task. Write at least 250 words.
                  Give reasons for your answer and include any relevant examples from your own knowledge or experience.
                </>
              )}
            </p>
          </div>

          {/* Writing Area */}
          <div className="bg-white border rounded-lg p-6">
            <Textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder={`Start writing your response for Task ${currentTask === 'TASK_1' ? '1' : '2'}...`}
              rows={20}
              className="w-full text-base font-mono"
            />
            
            {/* Word Count */}
            <div className="mt-4 flex items-center justify-between">
              <div className={`text-sm font-medium ${
                wordCount < minWords ? 'text-red-600' : 'text-green-600'
              }`}>
                Words: {wordCount} / {minWords} minimum
              </div>
              <Button
                onClick={handleSubmitTask}
                disabled={isSubmitting || wordCount < minWords}
              >
                {currentTask === 'TASK_1' ? 'Submit Task 1' : 'Submit Task 2'}
              </Button>
            </div>
          </div>

          {/* Finish Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Finish Writing Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

