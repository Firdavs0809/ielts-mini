# IELTS Exam Platform - Backend Documentation

## Overview

A comprehensive Django backend for a full IELTS exam simulation system supporting all 4 modules:
- **Listening**: Audio player with 40 questions, automatic scoring
- **Reading**: 3 passages with MCQ, matching, fill-in-the-blanks, T/F/NG, headings
- **Writing**: Task 1 and 2 with AI scoring
- **Speaking**: Audio upload, transcription, AI scoring

## Architecture

```
backend/
├── exam/
│   ├── models/          # Django models (Exam, Section, Passage, Question, etc.)
│   ├── services/       # Business logic layer
│   │   └── exam_service.py
│   ├── scoring/         # Scoring services
│   │   ├── reading_scoring.py
│   │   ├── listening_scoring.py
│   │   ├── writing_ai_scorer.py
│   │   └── speaking_ai_scorer.py
│   ├── ai/              # AI integration
│   │   ├── writing_scorer.py
│   │   └── speaking_scorer.py
│   ├── utils/           # Utilities
│   │   └── band_score.py
│   ├── views.py         # API endpoints
│   ├── urls.py          # URL routing
│   ├── admin.py         # Django admin configuration
│   └── management/      # Management commands
│       └── commands/
│           ├── seed_ielts_data.py
│           └── create_exam_example.py
```

## Models

### Core Models

1. **Exam**: Main exam container
   - `id` (UUID)
   - `title`, `description`
   - `total_duration` (minutes)
   - `is_active`

2. **Section**: One of 4 IELTS modules
   - `section_type`: LISTENING, READING, WRITING, SPEAKING
   - `duration` (minutes)
   - `order`

3. **Passage**: Reading/Listening passages
   - `title`, `content`
   - `passage_number`

4. **Question**: Questions for all modules
   - `question_type`: MCQ, TRUE_FALSE, FILL_BLANK, MATCHING, HEADINGS, SHORT_TEXT
   - `question_text`, `correct_answer`
   - `marks`, `explanation`
   - `audio_timestamp` (for Listening)

5. **Option**: MCQ options
   - `option_label` (A, B, C, D)
   - `option_text`
   - `is_correct`

6. **TestSession**: User's exam attempt
   - `session_id` (UUID)
   - `exam`, `user_id`
   - `status`: NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED
   - Scores: `listening_score`, `reading_score`, `writing_score`, `speaking_score`
   - `overall_band_score`

7. **UserAnswer**: User's answers (auto-saved)
   - `test_session`, `question`
   - `answer`, `is_correct`

8. **WritingTask**: Writing submission
   - `task_type`: TASK_1, TASK_2
   - `response_text`, `word_count`
   - `band_score`, `feedback`, `scoring_breakdown`

9. **SpeakingTask**: Speaking submission
   - `part_type`: PART_1, PART_2, PART_3
   - `audio_file`, `transcript`
   - `band_score`, `feedback`, `scoring_breakdown`

10. **ListeningAudio**: Audio files for Listening section
    - `audio_file`, `duration`
    - `timestamps` (JSON)

## API Endpoints

### Exam Session Endpoints

#### `POST /api/exam/start`
Start a new exam session.

**Request:**
```json
{
  "exam_id": "uuid",
  "user_id": "optional"
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "exam": {...},
  "sections": [...],
  "started_at": "ISO datetime",
  "time_remaining": 10800
}
```

#### `POST /api/exam/submit-answer`
Submit or update an answer (auto-save).

**Request:**
```json
{
  "session_id": "uuid",
  "question_id": "uuid",
  "answer": "user answer"
}
```

**Response:**
```json
{
  "success": true,
  "is_correct": true,
  "message": "Answer saved successfully"
}
```

#### `POST /api/exam/finish`
Finish an exam session and calculate all scores.

**Request:**
```json
{
  "session_id": "uuid"
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "scores": {
    "listening": {"band_score": 7.5, "raw_score": 35, "total_questions": 40},
    "reading": {"band_score": 8.0, "raw_score": 37, "total_questions": 40},
    "writing": {"band_score": 7.0, "task_1_score": 6.5, "task_2_score": 7.5},
    "speaking": {"band_score": 7.5},
    "overall": {"band_score": 7.5}
  },
  "breakdown": {...}
}
```

#### `GET /api/exam/result/<session_id>`
Get exam result.

#### `GET /api/exam/listening/audio/<audio_id>`
Serve listening audio file.

#### `POST /api/exam/submit-writing`
Submit a writing task.

**Request:**
```json
{
  "session_id": "uuid",
  "task_type": "TASK_1|TASK_2",
  "response_text": "User's written response"
}
```

#### `POST /api/exam/submit-speaking`
Submit a speaking task with audio upload.

**Request:** FormData
- `session_id`: "uuid"
- `part_type`: "PART_1|PART_2|PART_3"
- `audio_file`: File

### Admin Endpoints

#### `POST /api/admin/upload-passage`
Create a new passage.

**Request:**
```json
{
  "section_id": "uuid",
  "title": "Passage Title",
  "content": "Passage content...",
  "passage_number": 1
}
```

#### `POST /api/admin/create-question`
Create a new question.

**Request:**
```json
{
  "section_id": "uuid",
  "passage_id": "uuid (optional)",
  "question_type": "MCQ|TRUE_FALSE|FILL_BLANK|MATCHING|HEADINGS|SHORT_TEXT",
  "question_text": "Question text",
  "question_number": 1,
  "correct_answer": "Correct answer",
  "marks": 1,
  "options": [
    {"label": "A", "text": "Option A", "is_correct": false}
  ]
}
```

## Scoring System

### Reading & Listening
- Automatic scoring based on correct answers
- Raw score (0-40) converted to band score (0.0-9.0)
- Conversion tables in `utils/band_score.py`

### Writing
- AI-powered scoring using OpenAI or Anthropic
- Rubric-based: Task Achievement, Coherence, Lexical Resource, Grammar
- Each criterion scored 0-9, then averaged

### Speaking
- Audio transcription using Whisper API
- AI scoring based on: Fluency, Lexical Resource, Grammar, Pronunciation
- Each criterion scored 0-9, then averaged

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file:

```env
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

POSTGRES_DB=ielts_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# AI Provider (openai or anthropic)
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# Or use Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 3. Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Seed Data

```bash
python manage.py seed_ielts_data
```

Or create from JSON:

```bash
python manage.py create_exam_example exam/example_exam.json
```

### 5. Run Server

```bash
python manage.py runserver
```

## Band Score Conversion

### Listening (Raw Score → Band Score)
- 39-40: 9.0
- 37-38: 8.5
- 35-36: 8.0
- 33-34: 7.5
- 30-32: 7.0
- 27-29: 6.5
- 23-26: 6.0
- 20-22: 5.5
- 16-19: 5.0
- ... (see `utils/band_score.py`)

### Reading (Academic)
- 39-40: 9.0
- 37-38: 8.5
- 35-36: 8.0
- 33-34: 7.5
- 30-32: 7.0
- 27-29: 6.5
- 23-26: 6.0
- 19-22: 5.5
- ... (see `utils/band_score.py`)

## AI Integration

### Writing Scoring

The system uses AI to score writing tasks based on IELTS rubric:

1. **Task Achievement/Response** (0-9)
2. **Coherence and Cohesion** (0-9)
3. **Lexical Resource** (0-9)
4. **Grammatical Range and Accuracy** (0-9)

Average is calculated and rounded to nearest 0.5.

### Speaking Scoring

1. Audio is transcribed using Whisper API
2. Transcript is scored based on:
   - **Fluency and Coherence** (0-9)
   - **Lexical Resource** (0-9)
   - **Grammatical Range and Accuracy** (0-9)
   - **Pronunciation** (0-9)

### Fallback Scoring

If AI is unavailable, the system uses heuristic-based fallback scoring.

## Django Admin

Access at `/admin/` with full CRUD for:
- Exams
- Sections
- Passages
- Questions & Options
- Test Sessions
- User Answers
- Writing Tasks
- Speaking Tasks
- Listening Audio

## Example Usage

### Start Exam Session

```python
import requests

response = requests.post('http://localhost:8000/api/exam/start', json={
    'exam_id': 'exam-uuid',
    'user_id': 'user123'
})

session_id = response.json()['session_id']
```

### Submit Answer

```python
requests.post('http://localhost:8000/api/exam/submit-answer', json={
    'session_id': session_id,
    'question_id': 'question-uuid',
    'answer': 'TRUE'
})
```

### Finish Exam

```python
result = requests.post('http://localhost:8000/api/exam/finish', json={
    'session_id': session_id
})

print(result.json()['scores']['overall']['band_score'])
```

## Testing

Run tests:

```bash
python manage.py test exam
```

## Production Considerations

1. **File Storage**: Use S3 or similar for media files
2. **AI Scoring**: Consider async task queues (Celery) for AI scoring
3. **Caching**: Cache exam data and results
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **Security**: Add authentication/authorization
6. **Monitoring**: Add logging and monitoring for AI API calls

## License

MIT

