"""
IELTS Exam Platform Views
Django views (not DRF) for exam endpoints
"""
import json
from django.http import JsonResponse, HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from exam.models import (
    Exam, Section, Passage, Question, Option, TestSession, UserAnswer,
    WritingTask, SpeakingTask, ListeningAudio
)
from exam.services.exam_service import (
    start_exam_session, submit_answer, finish_exam_session, get_exam_result
)
from exam.scoring.writing_ai_scorer import update_writing_score
from exam.scoring.speaking_ai_scorer import update_speaking_score


@csrf_exempt
@require_http_methods(["POST"])
def start_exam(request):
    """
    POST /api/exam/start
    Start a new exam session
    
    Body: {
        "exam_id": "uuid",
        "user_id": "optional"
    }
    """
    try:
        data = json.loads(request.body)
        exam_id = data.get('exam_id')
        
        if not exam_id:
            return JsonResponse({'error': 'exam_id is required'}, status=400)
        
        result = start_exam_session(exam_id, data.get('user_id'))
        return JsonResponse(result, status=201)
    
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def submit_answer_view(request):
    """
    POST /api/exam/submit-answer
    Submit or update an answer (auto-save)
    
    Body: {
        "session_id": "uuid",
        "question_id": "uuid",
        "answer": "user answer text"
    }
    """
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')
        question_id = data.get('question_id')
        answer = data.get('answer', '')
        
        if not session_id or not question_id:
            return JsonResponse({'error': 'session_id and question_id are required'}, status=400)
        
        result = submit_answer(session_id, question_id, answer)
        return JsonResponse(result, status=200)
    
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def finish_exam(request):
    """
    POST /api/exam/finish
    Finish an exam session and calculate scores
    
    Body: {
        "session_id": "uuid"
    }
    """
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')
        
        if not session_id:
            return JsonResponse({'error': 'session_id is required'}, status=400)
        
        result = finish_exam_session(session_id)
        return JsonResponse(result, status=200)
    
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def exam_result(request, session_id):
    """
    GET /api/exam/result/<session_id>
    Get exam result
    """
    try:
        result = get_exam_result(session_id)
        return JsonResponse(result, status=200)
    
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def listening_audio(request, audio_id):
    """
    GET /api/exam/listening/audio/<audio_id>
    Serve listening audio file
    """
    try:
        audio = ListeningAudio.objects.get(id=audio_id)
        
        if not audio.audio_file:
            return JsonResponse({'error': 'Audio file not found'}, status=404)
        
        # Serve the file
        response = HttpResponse(audio.audio_file.read(), content_type='audio/mpeg')
        response['Content-Disposition'] = f'inline; filename="{audio.title}"'
        return response
    
    except ListeningAudio.DoesNotExist:
        return JsonResponse({'error': 'Audio not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Admin endpoints
@csrf_exempt
@require_http_methods(["POST"])
def admin_upload_passage(request):
    """
    POST /api/admin/upload-passage
    Create a new passage
    
    Body: {
        "section_id": "uuid",
        "title": "Passage Title",
        "content": "Passage content...",
        "passage_number": 1
    }
    """
    try:
        data = json.loads(request.body)
        section_id = data.get('section_id')
        title = data.get('title')
        content = data.get('content')
        passage_number = data.get('passage_number', 1)
        
        if not section_id or not title or not content:
            return JsonResponse({'error': 'section_id, title, and content are required'}, status=400)
        
        section = Section.objects.get(id=section_id)
        passage = Passage.objects.create(
            section=section,
            title=title,
            content=content,
            passage_number=passage_number
        )
        
        return JsonResponse({
            'id': str(passage.id),
            'title': passage.title,
            'passage_number': passage.passage_number,
            'section_id': str(section.id)
        }, status=201)
    
    except Section.DoesNotExist:
        return JsonResponse({'error': 'Section not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def admin_create_question(request):
    """
    POST /api/admin/create-question
    Create a new question
    
    Body: {
        "section_id": "uuid",
        "passage_id": "uuid (optional)",
        "question_type": "MCQ|TRUE_FALSE|FILL_BLANK|MATCHING|HEADINGS|SHORT_TEXT",
        "question_text": "Question text",
        "question_number": 1,
        "correct_answer": "Correct answer",
        "marks": 1,
        "options": [
            {"label": "A", "text": "Option A", "is_correct": false},
            ...
        ],
        "explanation": "Optional explanation",
        "audio_timestamp": 0.0 (optional, for listening)
    }
    """
    try:
        data = json.loads(request.body)
        section_id = data.get('section_id')
        question_type = data.get('question_type', 'MCQ')
        question_text = data.get('question_text')
        question_number = data.get('question_number')
        correct_answer = data.get('correct_answer')
        marks = data.get('marks', 1)
        
        if not section_id or not question_text or question_number is None or not correct_answer:
            return JsonResponse({
                'error': 'section_id, question_text, question_number, and correct_answer are required'
            }, status=400)
        
        section = Section.objects.get(id=section_id)
        passage = None
        if data.get('passage_id'):
            passage = Passage.objects.get(id=data.get('passage_id'))
        
        question = Question.objects.create(
            section=section,
            passage=passage,
            question_type=question_type,
            question_text=question_text,
            question_number=question_number,
            correct_answer=correct_answer,
            marks=marks,
            explanation=data.get('explanation'),
            audio_timestamp=data.get('audio_timestamp')
        )
        
        # Create options for MCQ
        if question_type == 'MCQ' and data.get('options'):
            for opt_data in data.get('options', []):
                Option.objects.create(
                    question=question,
                    option_label=opt_data.get('label'),
                    option_text=opt_data.get('text'),
                    is_correct=opt_data.get('is_correct', False),
                    order=ord(opt_data.get('label', 'A')) - ord('A') + 1
                )
        
        return JsonResponse({
            'id': str(question.id),
            'question_number': question.question_number,
            'question_type': question.question_type,
            'section_id': str(section.id)
        }, status=201)
    
    except Section.DoesNotExist:
        return JsonResponse({'error': 'Section not found'}, status=404)
    except Passage.DoesNotExist:
        return JsonResponse({'error': 'Passage not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def submit_writing_task(request):
    """
    POST /api/exam/submit-writing
    Submit a writing task (Task 1 or Task 2)
    
    Body: {
        "session_id": "uuid",
        "task_type": "TASK_1|TASK_2",
        "response_text": "User's written response"
    }
    """
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')
        task_type = data.get('task_type')
        response_text = data.get('response_text')
        
        if not session_id or not task_type or not response_text:
            return JsonResponse({
                'error': 'session_id, task_type, and response_text are required'
            }, status=400)
        
        test_session = TestSession.objects.get(session_id=session_id)
        writing_section = test_session.exam.sections.filter(section_type='WRITING').first()
        
        if not writing_section:
            return JsonResponse({'error': 'Writing section not found in exam'}, status=404)
        
        writing_task, created = WritingTask.objects.update_or_create(
            test_session=test_session,
            task_type=task_type,
            defaults={
                'section': writing_section,
                'response_text': response_text
            }
        )
        
        # Score using AI (async in production)
        update_writing_score(writing_task)
        
        return JsonResponse({
            'id': str(writing_task.id),
            'task_type': writing_task.task_type,
            'band_score': float(writing_task.band_score),
            'word_count': writing_task.word_count
        }, status=200)
    
    except TestSession.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def submit_speaking_task(request):
    """
    POST /api/exam/submit-speaking
    Submit a speaking task with audio upload
    
    Body: FormData with:
        - session_id: "uuid"
        - part_type: "PART_1|PART_2|PART_3"
        - audio_file: File
    """
    try:
        session_id = request.POST.get('session_id')
        part_type = request.POST.get('part_type')
        audio_file = request.FILES.get('audio_file')
        
        if not session_id or not part_type or not audio_file:
            return JsonResponse({
                'error': 'session_id, part_type, and audio_file are required'
            }, status=400)
        
        test_session = TestSession.objects.get(session_id=session_id)
        speaking_section = test_session.exam.sections.filter(section_type='SPEAKING').first()
        
        if not speaking_section:
            return JsonResponse({'error': 'Speaking section not found in exam'}, status=404)
        
        speaking_task, created = SpeakingTask.objects.update_or_create(
            test_session=test_session,
            part_type=part_type,
            defaults={
                'section': speaking_section,
                'audio_file': audio_file
            }
        )
        
        # Score using AI (async in production)
        update_speaking_score(speaking_task)
        
        return JsonResponse({
            'id': str(speaking_task.id),
            'part_type': speaking_task.part_type,
            'band_score': float(speaking_task.band_score),
            'transcript': speaking_task.transcript or ''
        }, status=200)
    
    except TestSession.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
