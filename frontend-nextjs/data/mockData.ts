/**
 * Mock data for development and testing
 */

import type { Question, Passage, ListeningAudio, Exam, Section } from '@/types';

export const mockExam: Exam = {
  id: 'mock-exam-1',
  title: 'IELTS Academic Practice Test 1',
  description: 'Full IELTS Academic practice test with all 4 modules',
  total_duration: 180,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockSections: Section[] = [
  {
    id: 'section-listening',
    exam: 'mock-exam-1',
    section_type: 'LISTENING',
    title: 'Listening Section',
    description: 'IELTS Academic Listening Test - 4 parts, 40 questions, 30 minutes',
    duration: 30,
    order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'section-reading',
    exam: 'mock-exam-1',
    section_type: 'READING',
    title: 'Reading Section',
    description: 'IELTS Academic Reading Test - 3 passages, 40 questions, 60 minutes',
    duration: 60,
    order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'section-writing',
    exam: 'mock-exam-1',
    section_type: 'WRITING',
    title: 'Writing Section',
    description: 'IELTS Academic Writing Test - Task 1 and Task 2, 60 minutes',
    duration: 60,
    order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'section-speaking',
    exam: 'mock-exam-1',
    section_type: 'SPEAKING',
    title: 'Speaking Section',
    description: 'IELTS Speaking Test - 3 parts, 11-14 minutes',
    duration: 14,
    order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const mockReadingPassage: Passage = {
  id: 'passage-1',
  section: 'section-reading',
  title: 'The History of Coffee',
  content: `Coffee is one of the world's most popular beverages, with a rich history that spans centuries and continents. The origins of coffee can be traced back to the ancient coffee forests of Ethiopia, where legend has it that a goat herder named Kaldi discovered the energizing effects of coffee beans around 850 AD.

According to the legend, Kaldi noticed that his goats became unusually energetic after eating berries from a certain tree. Curious, he tried the berries himself and experienced a similar boost in energy. He shared his discovery with local monks, who began using the berries to stay awake during long hours of prayer.

From Ethiopia, coffee cultivation spread to the Arabian Peninsula, particularly Yemen, where it was first cultivated on a large scale. By the 15th century, coffee was being grown in the Yemeni district of Arabia and by the 16th century, it had reached Persia, Egypt, Syria, and Turkey.

Coffee houses began to appear in cities across the Near East, becoming centers of social activity and communication. These establishments were known as "Schools of the Wise" because of the intellectual conversations that took place there.

The beverage made its way to Europe in the 17th century, brought by traders and travelers. Initially, coffee was met with suspicion and was even called "the bitter invention of Satan" by some. However, Pope Clement VIII tasted coffee and gave it papal approval, which helped it gain acceptance throughout Europe.

Today, coffee is grown in over 70 countries, primarily in the equatorial regions of the Americas, Southeast Asia, India, and Africa. Brazil is the world's largest coffee producer, followed by Vietnam, Colombia, and Indonesia.`,
  passage_number: 1,
  created_at: new Date().toISOString(),
};

export const mockReadingQuestions: Question[] = [
  {
    id: 'q1',
    section: 'section-reading',
    passage: 'passage-1',
    question_type: 'TRUE_FALSE',
    question_text: 'Kaldi discovered coffee beans in the 9th century.',
    question_number: 1,
    correct_answer: 'TRUE',
    marks: 1,
    explanation: 'The text states that Kaldi discovered coffee around 850 AD, which is the 9th century.',
  },
  {
    id: 'q2',
    section: 'section-reading',
    passage: 'passage-1',
    question_type: 'TRUE_FALSE',
    question_text: 'Coffee was first cultivated in Yemen.',
    question_number: 2,
    correct_answer: 'TRUE',
    marks: 1,
    explanation: 'The text states that coffee was first cultivated on a large scale in Yemen.',
  },
  {
    id: 'q3',
    section: 'section-reading',
    passage: 'passage-1',
    question_type: 'MCQ',
    question_text: 'Which country is the world\'s largest coffee producer?',
    question_number: 3,
    correct_answer: 'Brazil',
    marks: 1,
    explanation: 'The text states that Brazil is the world\'s largest coffee producer.',
    options: [
      {
        id: 'opt1',
        question: 'q3',
        option_label: 'A',
        option_text: 'Vietnam',
        order: 1,
        is_correct: false,
      },
      {
        id: 'opt2',
        question: 'q3',
        option_label: 'B',
        option_text: 'Brazil',
        order: 2,
        is_correct: true,
      },
      {
        id: 'opt3',
        question: 'q3',
        option_label: 'C',
        option_text: 'Colombia',
        order: 3,
        is_correct: false,
      },
      {
        id: 'opt4',
        question: 'q3',
        option_label: 'D',
        option_text: 'Indonesia',
        order: 4,
        is_correct: false,
      },
    ],
  },
  {
    id: 'q4',
    section: 'section-reading',
    passage: 'passage-1',
    question_type: 'FILL_BLANK',
    question_text: 'Coffee houses in the Near East were known as "Schools of the _____".',
    question_number: 4,
    correct_answer: 'Wise',
    marks: 1,
    explanation: 'The text explicitly states that coffee houses were called "Schools of the Wise".',
  },
];

export const mockListeningQuestions: Question[] = [
  {
    id: 'lq1',
    section: 'section-listening',
    question_type: 'MCQ',
    question_text: 'What is the main topic of the conversation?',
    question_number: 1,
    correct_answer: 'A',
    marks: 1,
    audio_timestamp: 15.5,
    options: [
      {
        id: 'lopt1',
        question: 'lq1',
        option_label: 'A',
        option_text: 'University accommodation',
        order: 1,
        is_correct: true,
      },
      {
        id: 'lopt2',
        question: 'lq1',
        option_label: 'B',
        option_text: 'Course registration',
        order: 2,
        is_correct: false,
      },
      {
        id: 'lopt3',
        question: 'lq1',
        option_label: 'C',
        option_text: 'Library facilities',
        order: 3,
        is_correct: false,
      },
    ],
  },
];

export const mockListeningAudio: ListeningAudio = {
  id: 'audio-1',
  section: 'section-listening',
  title: 'Listening Test Audio',
  audio_file: '/audio/listening-test.mp3',
  duration: 1800, // 30 minutes
  timestamps: [
    { start: 0, end: 300, label: 'Part 1' },
    { start: 300, end: 600, label: 'Part 2' },
    { start: 600, end: 1200, label: 'Part 3' },
    { start: 1200, end: 1800, label: 'Part 4' },
  ],
  created_at: new Date().toISOString(),
};

