/**
 * TypeScript interfaces for IELTS Exam Platform
 */

export type SectionType = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MATCHING' | 'HEADINGS' | 'SHORT_TEXT';
export type SessionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type TaskType = 'TASK_1' | 'TASK_2';
export type PartType = 'PART_1' | 'PART_2' | 'PART_3';

export interface Exam {
  id: string;
  title: string;
  description?: string;
  total_duration: number; // minutes
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  exam: string;
  section_type: SectionType;
  title: string;
  description?: string;
  duration: number; // minutes
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface Passage {
  id: string;
  section: string;
  title: string;
  content: string;
  passage_number: number;
  created_at: string;
}

export interface Option {
  id: string;
  question: string;
  option_label: string; // A, B, C, D
  option_text: string;
  order: number;
  is_correct: boolean;
}

export interface Question {
  id: string;
  section: string;
  passage?: string;
  question_type: QuestionType;
  question_text: string;
  question_number: number;
  correct_answer: string;
  explanation?: string;
  marks: number;
  audio_timestamp?: number; // for Listening
  options_data?: Record<string, any>; // for Matching/Headings
  options?: Option[]; // populated options for MCQ
}

export interface TestSession {
  session_id: string;
  exam: string;
  user_id?: string;
  started_at: string;
  completed_at?: string;
  time_remaining: number; // seconds
  status: SessionStatus;
  listening_score: number;
  reading_score: number;
  writing_score: number;
  speaking_score: number;
  overall_band_score: number;
  created_at: string;
  updated_at: string;
}

export interface UserAnswer {
  id?: string;
  test_session: string;
  question: string;
  answer: string;
  is_correct?: boolean;
  answered_at?: string;
  updated_at?: string;
}

export interface WritingTask {
  id: string;
  test_session: string;
  section: string;
  task_type: TaskType;
  response_text: string;
  word_count: number;
  band_score: number;
  feedback?: string;
  scoring_breakdown?: Record<string, number>;
  submitted_at: string;
  scored_at?: string;
}

export interface SpeakingTask {
  id: string;
  test_session: string;
  section: string;
  part_type: PartType;
  audio_file?: string;
  duration: number;
  transcript?: string;
  band_score: number;
  feedback?: string;
  scoring_breakdown?: Record<string, number>;
  submitted_at: string;
  scored_at?: string;
}

export interface ListeningAudio {
  id: string;
  section: string;
  title: string;
  audio_file: string;
  duration: number; // seconds
  timestamps?: Array<{
    start: number;
    end: number;
    label: string;
  }>;
  created_at: string;
}

export interface ExamResult {
  session_id: string;
  exam: {
    id: string;
    title: string;
  };
  status: SessionStatus;
  started_at: string;
  completed_at?: string;
  time_remaining: number;
  scores: {
    listening: {
      band_score: number;
      raw_score: number;
      total_questions: number;
    };
    reading: {
      band_score: number;
      raw_score: number;
      total_questions: number;
    };
    writing: {
      band_score: number;
      task_1_score: number;
      task_2_score: number;
    };
    speaking: {
      band_score: number;
    };
    overall: {
      band_score: number;
    };
  };
  breakdown: {
    listening?: Array<{
      question_id: string;
      question_number: number;
      question_type: QuestionType;
      user_answer: string;
      correct_answer: string;
      is_correct: boolean;
      marks: number;
    }>;
    reading?: Array<{
      question_id: string;
      question_number: number;
      question_type: QuestionType;
      user_answer: string;
      correct_answer: string;
      is_correct: boolean;
      marks: number;
    }>;
    writing?: Array<{
      task_type: TaskType;
      band_score: number;
      word_count: number;
      feedback: string;
    }>;
    speaking?: Array<{
      part_type: PartType;
      band_score: number;
      duration: number;
      feedback: string;
    }>;
  };
}

export interface StartExamResponse {
  session_id: string;
  exam: Exam;
  sections: Section[];
  started_at: string;
  time_remaining: number;
}

export interface SubmitAnswerResponse {
  success: boolean;
  is_correct: boolean;
  message: string;
}

