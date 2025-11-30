/**
 * Auto-save hook for exam answers
 * Saves answers every 3 seconds for questions in the queue
 */

import { useEffect, useRef } from 'react';
import { useExamStore } from '@/store/examStore';
import { submitAnswer } from '@/lib/api';

export function useAutoSave() {
  const { sessionId, autoSaveQueue, userAnswers, clearAutoSaveQueue } = useExamStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!sessionId || autoSaveQueue.size === 0 || isSavingRef.current) {
      return;
    }

    // Auto-save every 3 seconds
    intervalRef.current = setInterval(async () => {
      const queue = Array.from(autoSaveQueue);
      
      if (queue.length === 0 || isSavingRef.current) {
        return;
      }

      isSavingRef.current = true;

      // Save all queued answers
      const savePromises = queue.map(async (questionId) => {
        const answer = userAnswers.get(questionId);
        if (answer && answer.answer.trim() !== '') {
          try {
            await submitAnswer(sessionId, questionId, answer.answer);
            console.log(`Auto-saved answer for question ${questionId}`);
          } catch (error) {
            console.error(`Failed to auto-save question ${questionId}:`, error);
          }
        }
      });

      await Promise.all(savePromises);
      clearAutoSaveQueue();
      isSavingRef.current = false;
    }, 3000); // 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionId, autoSaveQueue, userAnswers, clearAutoSaveQueue]);

  return null;
}

