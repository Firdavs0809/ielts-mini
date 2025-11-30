"""
Exam Service
Handles exam session management and orchestration
"""
from typing import Dict, Optional
from django.utils import timezone
from django.db import transaction
from exam.models import Exam, TestSession, Section
from exam.utils.band_score import calculate_overall_band


def start_exam_session(exam_id: str, user_id: Optional[str] = None) -> Dict:
    """
    Start a new exam session
    
    Args:
        exam_id: UUID of the exam
        user_id: Optional user identifier
    
    Returns:
        {
            'session_id': str,
            'exam': Dict,
            'sections': List[Dict],
            'started_at': str,
            'time_remaining': int
        }
    """
    try:
        exam = Exam.objects.get(id=exam_id, is_active=True)
    except Exam.DoesNotExist:
        raise ValueError(f"Exam {exam_id} not found or inactive")
    
    # Create test session
    test_session = TestSession.objects.create(
        exam=exam,
        user_id=user_id,
        status='IN_PROGRESS',
        time_remaining=exam.total_duration * 60  # Convert minutes to seconds
    )
    
    # Get sections
    sections = exam.sections.filter(is_active=True).order_by('order')
    
    return {
        'session_id': str(test_session.session_id),
        'exam': {
            'id': str(exam.id),
            'title': exam.title,
            'description': exam.description,
            'total_duration': exam.total_duration
        },
        'sections': [
            {
                'id': str(section.id),
                'section_type': section.section_type,
                'title': section.title,
                'duration': section.duration,
                'order': section.order
            }
            for section in sections
        ],
        'started_at': test_session.started_at.isoformat(),
        'time_remaining': test_session.time_remaining
    }


def submit_answer(session_id: str, question_id: str, answer: str) -> Dict:
    """
    Submit or update an answer (auto-save)
    
    Args:
        session_id: Test session UUID
        question_id: Question UUID
        answer: User's answer
    
    Returns:
        {
            'success': bool,
            'is_correct': bool,
            'message': str
        }
    """
    try:
        test_session = TestSession.objects.get(session_id=session_id)
    except TestSession.DoesNotExist:
        raise ValueError(f"Session {session_id} not found")
    
    if test_session.status == 'COMPLETED':
        raise ValueError("Cannot submit answer to completed session")
    
    from exam.models import Question, UserAnswer
    
    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        raise ValueError(f"Question {question_id} not found")
    
    # Create or update answer
    user_answer, created = UserAnswer.objects.update_or_create(
        test_session=test_session,
        question=question,
        defaults={'answer': answer}
    )
    
    return {
        'success': True,
        'is_correct': user_answer.is_correct,
        'message': 'Answer saved successfully'
    }


def finish_exam_session(session_id: str) -> Dict:
    """
    Finish an exam session and calculate all scores
    
    Args:
        session_id: Test session UUID
    
    Returns:
        Complete result with all scores
    """
    try:
        test_session = TestSession.objects.get(session_id=session_id)
    except TestSession.DoesNotExist:
        raise ValueError(f"Session {session_id} not found")
    
    if test_session.status == 'COMPLETED':
        # Return existing results
        return get_exam_result(session_id)
    
    with transaction.atomic():
        # Mark as completed
        test_session.status = 'COMPLETED'
        test_session.completed_at = timezone.now()
        
        # Calculate time taken
        time_taken = (test_session.completed_at - test_session.started_at).total_seconds()
        test_session.time_remaining = max(0, test_session.time_remaining - int(time_taken))
        
        # Calculate scores for each section
        from exam.scoring.reading_scoring import update_reading_score
        from exam.scoring.listening_scoring import update_listening_score
        from exam.scoring.writing_ai_scorer import calculate_writing_section_score
        from exam.scoring.speaking_ai_scorer import calculate_speaking_section_score
        
        # Reading and Listening (auto-scored)
        reading_section = test_session.exam.sections.filter(section_type='READING').first()
        if reading_section:
            update_reading_score(test_session)
        
        listening_section = test_session.exam.sections.filter(section_type='LISTENING').first()
        if listening_section:
            update_listening_score(test_session)
        
        # Writing (AI-scored, may need async processing)
        writing_section = test_session.exam.sections.filter(section_type='WRITING').first()
        if writing_section:
            writing_result = calculate_writing_section_score(test_session)
            test_session.writing_score = writing_result['band_score']
        
        # Speaking (AI-scored, may need async processing)
        speaking_section = test_session.exam.sections.filter(section_type='SPEAKING').first()
        if speaking_section:
            speaking_result = calculate_speaking_section_score(test_session)
            test_session.speaking_score = speaking_result['band_score']
        
        # Calculate overall band score
        test_session.overall_band_score = calculate_overall_band(
            test_session.listening_score,
            test_session.reading_score,
            test_session.writing_score,
            test_session.speaking_score
        )
        
        test_session.save()
    
    return get_exam_result(session_id)


def get_exam_result(session_id: str) -> Dict:
    """
    Get complete exam result
    
    Args:
        session_id: Test session UUID
    
    Returns:
        Complete result dictionary
    """
    try:
        test_session = TestSession.objects.get(session_id=session_id)
    except TestSession.DoesNotExist:
        raise ValueError(f"Session {session_id} not found")
    
    from exam.scoring.reading_scoring import calculate_reading_score
    from exam.scoring.listening_scoring import calculate_listening_score
    from exam.scoring.writing_ai_scorer import calculate_writing_section_score
    from exam.scoring.speaking_ai_scorer import calculate_speaking_section_score
    
    result = {
        'session_id': str(test_session.session_id),
        'exam': {
            'id': str(test_session.exam.id),
            'title': test_session.exam.title
        },
        'status': test_session.status,
        'started_at': test_session.started_at.isoformat(),
        'completed_at': test_session.completed_at.isoformat() if test_session.completed_at else None,
        'time_remaining': test_session.time_remaining,
        'scores': {
            'listening': {
                'band_score': float(test_session.listening_score),
                'raw_score': 0,
                'total_questions': 0
            },
            'reading': {
                'band_score': float(test_session.reading_score),
                'raw_score': 0,
                'total_questions': 0
            },
            'writing': {
                'band_score': float(test_session.writing_score),
                'task_1_score': 0.0,
                'task_2_score': 0.0
            },
            'speaking': {
                'band_score': float(test_session.speaking_score)
            },
            'overall': {
                'band_score': float(test_session.overall_band_score)
            }
        },
        'breakdown': {}
    }
    
    # Get detailed breakdowns
    reading_section = test_session.exam.sections.filter(section_type='READING').first()
    if reading_section:
        reading_result = calculate_reading_score(test_session)
        result['scores']['reading'].update({
            'raw_score': reading_result['raw_score'],
            'total_questions': reading_result['total_questions']
        })
        result['breakdown']['reading'] = reading_result['question_breakdown']
    
    listening_section = test_session.exam.sections.filter(section_type='LISTENING').first()
    if listening_section:
        listening_result = calculate_listening_score(test_session)
        result['scores']['listening'].update({
            'raw_score': listening_result['raw_score'],
            'total_questions': listening_result['total_questions']
        })
        result['breakdown']['listening'] = listening_result['question_breakdown']
    
    writing_section = test_session.exam.sections.filter(section_type='WRITING').first()
    if writing_section:
        writing_result = calculate_writing_section_score(test_session)
        result['scores']['writing'].update({
            'task_1_score': writing_result['task_1_score'],
            'task_2_score': writing_result['task_2_score']
        })
        result['breakdown']['writing'] = writing_result['tasks']
    
    speaking_section = test_session.exam.sections.filter(section_type='SPEAKING').first()
    if speaking_section:
        speaking_result = calculate_speaking_section_score(test_session)
        result['breakdown']['speaking'] = speaking_result['parts']
    
    return result

