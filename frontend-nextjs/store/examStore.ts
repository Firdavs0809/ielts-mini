/**
 * Zustand store for IELTS exam state management
 * Manages current exam session, answers, timing, and auto-save queue
 */

import { create } from 'zustand';
import type {
  TestSession,
  Question,
  UserAnswer,
  Section,
  Exam,
  SectionType,
} from '@/types';

interface ExamState {
  // Exam data
  exam: Exam | null;
  sections: Section[];
  currentSection: SectionType | null;
  
  // Session
  sessionId: string | null;
  session: TestSession | null;
  
  // Questions and answers
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Map<string, UserAnswer>; // questionId -> answer
  
  // Timing
  examStartedAt: Date | null;
  remainingTime: number; // seconds
  isTimerRunning: boolean;
  
  // Auto-save
  autoSaveQueue: Set<string>; // questionIds pending save
  lastAutoSave: Date | null;
  
  // UI state
  isPracticeMode: boolean; // Show correct answers
  showReviewMode: boolean; // Mark questions for review
  
  // Actions
  setExam: (exam: Exam, sections: Section[]) => void;
  setSession: (sessionId: string, session: TestSession) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentSection: (section: SectionType) => void;
  setCurrentQuestion: (index: number) => void;
  setAnswer: (questionId: string, answer: string) => void;
  markForReview: (questionId: string) => void;
  startTimer: () => void;
  stopTimer: () => void;
  updateRemainingTime: (seconds: number) => void;
  addToAutoSaveQueue: (questionId: string) => void;
  clearAutoSaveQueue: () => void;
  reset: () => void;
}

const initialState = {
  exam: null,
  sections: [],
  currentSection: null,
  sessionId: null,
  session: null,
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: new Map(),
  examStartedAt: null,
  remainingTime: 0,
  isTimerRunning: false,
  autoSaveQueue: new Set(),
  lastAutoSave: null,
  isPracticeMode: false,
  showReviewMode: false,
};

export const useExamStore = create<ExamState>((set, get) => ({
  ...initialState,

  setExam: (exam, sections) => {
    set({ exam, sections });
  },

  setSession: (sessionId, session) => {
    set({ 
      sessionId, 
      session,
      examStartedAt: new Date(session.started_at),
      remainingTime: session.time_remaining,
    });
  },

  setQuestions: (questions) => {
    set({ questions, currentQuestionIndex: 0 });
  },

  setCurrentSection: (section) => {
    set({ currentSection: section });
  },

  setCurrentQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  setAnswer: (questionId, answer) => {
    const { userAnswers, sessionId } = get();
    const newAnswers = new Map(userAnswers);
    
    newAnswers.set(questionId, {
      test_session: sessionId || '',
      question: questionId,
      answer,
    });
    
    set({ 
      userAnswers: newAnswers,
      lastAutoSave: new Date(),
    });
    
    // Add to auto-save queue
    get().addToAutoSaveQueue(questionId);
  },

  markForReview: (questionId) => {
    // Implementation for review marking
    // Could add a separate Map for review questions
  },

  startTimer: () => {
    set({ isTimerRunning: true });
    
    const interval = setInterval(() => {
      const { remainingTime, isTimerRunning } = get();
      if (!isTimerRunning || remainingTime <= 0) {
        clearInterval(interval);
        get().stopTimer();
        return;
      }
      get().updateRemainingTime(remainingTime - 1);
    }, 1000);
  },

  stopTimer: () => {
    set({ isTimerRunning: false });
  },

  updateRemainingTime: (seconds) => {
    set({ remainingTime: Math.max(0, seconds) });
  },

  addToAutoSaveQueue: (questionId) => {
    const { autoSaveQueue } = get();
    const newQueue = new Set(autoSaveQueue);
    newQueue.add(questionId);
    set({ autoSaveQueue: newQueue });
  },

  clearAutoSaveQueue: () => {
    set({ autoSaveQueue: new Set() });
  },

  reset: () => {
    set(initialState);
  },
}));

