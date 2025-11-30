# IELTS Exam Platform - Next.js Frontend

A complete Next.js 14 frontend for the IELTS exam simulation system.

## Features

- ✅ **4 Modules**: Listening, Reading, Writing, Speaking
- ✅ **Real IELTS UI**: Authentic exam interface
- ✅ **Auto-save**: Answers saved every 3 seconds
- ✅ **Timer**: Countdown timer with warnings
- ✅ **Audio Player**: Full-featured player for Listening
- ✅ **Question Types**: MCQ, True/False/Not Given, Fill Blank, Matching, Headings
- ✅ **Drag & Drop**: For matching and headings questions
- ✅ **Writing Editor**: With word count tracking
- ✅ **Audio Recorder**: For Speaking module
- ✅ **Results Page**: Detailed score breakdown

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Zustand** (State management)
- **React Query** (API calls)
- **React DnD** (Drag & drop)
- **shadcn/ui** (UI components)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
frontend-nextjs/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── providers.tsx           # React Query & DnD providers
│   ├── globals.css             # Global styles
│   └── exam/
│       └── [examId]/
│           ├── listening/      # Listening module
│           ├── reading/         # Reading module
│           ├── writing/         # Writing module
│           ├── speaking/        # Speaking module
│           └── result/          # Results page
├── components/
│   ├── exam/                    # Exam components
│   │   ├── Timer.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── AudioRecorder.tsx
│   │   ├── PaginationBar.tsx
│   │   ├── QuestionRenderer.tsx
│   │   ├── MCQOptions.tsx
│   │   ├── TFNGSelector.tsx
│   │   ├── FillBlankInput.tsx
│   │   ├── ShortTextInput.tsx
│   │   └── DragDropMatching.tsx
│   └── ui/                      # shadcn components
│       ├── button.tsx
│       ├── input.tsx
│       └── textarea.tsx
├── lib/
│   ├── api.ts                   # API client
│   └── utils.ts                 # Utilities
├── store/
│   └── examStore.ts             # Zustand store
├── hooks/
│   └── useAutoSave.ts           # Auto-save hook
└── types/
    └── index.ts                  # TypeScript types
```

## Pages

### `/` - Home
Choose exam module (Listening, Reading, Writing, Speaking)

### `/exam/[examId]/listening` - Listening Test
- Audio player with speed control
- 40 questions
- Timestamp navigation

### `/exam/[examId]/reading` - Reading Test
- 3 passages
- 40 questions
- Side-by-side passage and questions

### `/exam/[examId]/writing` - Writing Test
- Task 1 (150 words minimum)
- Task 2 (250 words minimum)
- Word count tracking

### `/exam/[examId]/speaking` - Speaking Test
- Part 1, 2, 3
- Audio recording
- Playback before submission

### `/exam/[examId]/result` - Results
- Overall band score
- Module scores
- Question breakdown
- Correct/incorrect answers

## State Management

Zustand store (`store/examStore.ts`) manages:
- Current exam and session
- Questions and answers
- Timer state
- Auto-save queue
- Practice mode

## API Integration

All API calls use React Query:
- `startExam()` - Start exam session
- `submitAnswer()` - Save answer
- `finishExam()` - Submit exam
- `getExamResult()` - Get results
- `submitWritingTask()` - Submit writing
- `submitSpeakingTask()` - Submit speaking

## Auto-Save

Answers are automatically saved every 3 seconds using the `useAutoSave` hook.

## Practice Mode

Enable practice mode on the home page to see correct answers after submission.

## Development

- TypeScript for type safety
- TailwindCSS for styling
- ESLint for code quality
- React Query for data fetching
- Zustand for state management

## Production Considerations

1. **Environment Variables**: Set `NEXT_PUBLIC_API_URL`
2. **Error Handling**: Add error boundaries
3. **Loading States**: Improve loading UX
4. **Offline Support**: Add service worker
5. **Analytics**: Track user behavior
6. **Accessibility**: Improve a11y

## License

MIT

