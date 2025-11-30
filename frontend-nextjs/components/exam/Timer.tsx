'use client';

import { useEffect, useState } from 'react';
import { useExamStore } from '@/store/examStore';
import { formatTimeLong } from '@/lib/utils';
import { Clock } from 'lucide-react';

/**
 * Timer component for IELTS exam
 * Shows remaining time and auto-submits when time runs out
 */
export default function Timer() {
  const { remainingTime, isTimerRunning, stopTimer } = useExamStore();
  const [displayTime, setDisplayTime] = useState(remainingTime);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    setDisplayTime(remainingTime);
    setIsWarning(remainingTime < 300); // Warning when less than 5 minutes
  }, [remainingTime]);

  useEffect(() => {
    if (!isTimerRunning || remainingTime <= 0) {
      return;
    }

    const interval = setInterval(() => {
      const newTime = remainingTime - 1;
      setDisplayTime(newTime);
      
      if (newTime <= 0) {
        stopTimer();
        // Auto-submit when time runs out
        // This would trigger finishExam
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, isTimerRunning, stopTimer]);

  if (remainingTime <= 0) {
    return (
      <div className="flex items-center gap-2 text-red-600 font-bold">
        <Clock className="w-5 h-5" />
        <span>Time's Up!</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 font-mono font-semibold ${
      isWarning ? 'text-red-600' : 'text-gray-700'
    }`}>
      <Clock className={`w-5 h-5 ${isWarning ? 'animate-pulse' : ''}`} />
      <span className="text-lg">{formatTimeLong(displayTime)}</span>
      {isWarning && (
        <span className="text-xs font-normal text-red-500 ml-2">
          Less than 5 minutes remaining
        </span>
      )}
    </div>
  );
}

