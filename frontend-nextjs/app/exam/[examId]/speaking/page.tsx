'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useExamStore } from '@/store/examStore';
import Timer from '@/components/exam/Timer';
import AudioRecorder from '@/components/exam/AudioRecorder';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { submitSpeakingTask, finishExam } from '@/lib/api';

/**
 * Speaking module page
 * Three parts with audio recording
 */
export default function SpeakingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const { sessionId } = useExamStore();
  const [currentPart, setCurrentPart] = useState<'PART_1' | 'PART_2' | 'PART_3'>('PART_1');
  const [recordings, setRecordings] = useState<Record<string, Blob>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const partInstructions = {
    PART_1: {
      title: 'Part 1: Introduction & Interview',
      description: 'Answer questions about yourself, your family, work, studies, and interests.',
      duration: 300, // 5 minutes
    },
    PART_2: {
      title: 'Part 2: Long Turn',
      description: 'Speak for 1-2 minutes on a given topic. You have 1 minute to prepare.',
      duration: 180, // 3 minutes
    },
    PART_3: {
      title: 'Part 3: Discussion',
      description: 'Discuss abstract ideas and issues related to the topic in Part 2.',
      duration: 300, // 5 minutes
    },
  };

  const handleRecordingComplete = (audioBlob: Blob) => {
    setRecordings({ ...recordings, [currentPart]: audioBlob });
  };

  const handleSubmitPart = async () => {
    if (!sessionId) return;
    const recording = recordings[currentPart];
    if (!recording) {
      alert('Please record your response first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const audioFile = new File([recording], `${currentPart}.webm`, { type: 'audio/webm' });
      await submitSpeakingTask(sessionId, currentPart, audioFile);
      
      if (currentPart === 'PART_1') {
        setCurrentPart('PART_2');
      } else if (currentPart === 'PART_2') {
        setCurrentPart('PART_3');
      } else {
        // All parts done, finish exam
        await finishExam(sessionId);
        router.push(`/exam/${examId}/result`);
      }
    } catch (error) {
      console.error('Error submitting speaking task:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
      // Submit all recorded parts
      for (const [part, recording] of Object.entries(recordings)) {
        const audioFile = new File([recording], `${part}.webm`, { type: 'audio/webm' });
        await submitSpeakingTask(sessionId, part as any, audioFile);
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

  const currentInstructions = partInstructions[currentPart];
  const hasRecording = !!recordings[currentPart];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Speaking Test</h1>
            <Timer />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Part Selector */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex gap-2">
              {(['PART_1', 'PART_2', 'PART_3'] as const).map((part) => (
                <Button
                  key={part}
                  variant={currentPart === part ? 'default' : 'outline'}
                  onClick={() => setCurrentPart(part)}
                >
                  Part {part.split('_')[1]}
                </Button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">{currentInstructions.title}</h2>
            <p className="text-gray-700 mb-4">{currentInstructions.description}</p>
            <div className="text-sm text-gray-600">
              Maximum duration: {Math.floor(currentInstructions.duration / 60)} minutes
            </div>
          </div>

          {/* Audio Recorder */}
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={currentInstructions.duration}
          />

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {hasRecording ? '✓ Recording complete' : 'Record your response above'}
            </div>
            <Button
              onClick={handleSubmitPart}
              disabled={isSubmitting || !hasRecording}
            >
              {currentPart === 'PART_3' ? 'Submit & Finish' : `Submit Part ${currentPart.split('_')[1]}`}
            </Button>
          </div>

          {/* Finish Button (if all parts recorded) */}
          {Object.keys(recordings).length === 3 && (
            <div className="flex justify-end">
              <Button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finish Speaking Test
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

