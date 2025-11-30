# Quick Start Guide

## 1. Setup Environment

```bash
cd backend
pip install -r requirements.txt
```

## 2. Configure Environment Variables

Create `.env` file:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
POSTGRES_DB=ielts_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# AI Configuration (optional - fallback scoring available)
AI_PROVIDER=openai
OPENAI_API_KEY=your-key-here
```

## 3. Database Setup

```bash
python manage.py makemigrations
python manage.py migrate
```

## 4. Seed Sample Data

```bash
python manage.py seed_ielts_data
```

This creates:
- 1 Exam with all 4 sections
- 1 Reading passage with 13 questions
- Sample questions (MCQ, True/False, Fill Blank, etc.)

## 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

## 6. Run Server

```bash
python manage.py runserver
```

## 7. Test API

### Start Exam Session

```bash
curl -X POST http://localhost:8000/api/exam/start \
  -H "Content-Type: application/json" \
  -d '{
    "exam_id": "your-exam-id"
  }'
```

### Submit Answer

```bash
curl -X POST http://localhost:8000/api/exam/submit-answer \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id",
    "question_id": "your-question-id",
    "answer": "TRUE"
  }'
```

### Finish Exam

```bash
curl -X POST http://localhost:8000/api/exam/finish \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "your-session-id"
  }'
```

## 8. Access Admin Panel

Visit: http://localhost:8000/admin/

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exam/start` | Start exam session |
| POST | `/api/exam/submit-answer` | Submit/update answer |
| POST | `/api/exam/finish` | Finish exam and get scores |
| GET | `/api/exam/result/<session_id>` | Get exam result |
| GET | `/api/exam/listening/audio/<audio_id>` | Get audio file |
| POST | `/api/exam/submit-writing` | Submit writing task |
| POST | `/api/exam/submit-speaking` | Submit speaking task |
| POST | `/api/admin/upload-passage` | Create passage (admin) |
| POST | `/api/admin/create-question` | Create question (admin) |

## Next Steps

1. Configure AI provider for Writing/Speaking scoring
2. Add more exam content via admin or API
3. Integrate with frontend
4. Set up production environment

See `BACKEND_README.md` for detailed documentation.

