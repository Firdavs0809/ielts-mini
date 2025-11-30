"""
Listening Module Scoring Service
Auto-calculates scores for Listening section questions
"""
from typing import Dict, List
from exam.models import TestSession, UserAnswer, Question
from exam.utils.band_score import listening_score_to_band


def calculate_listening_score(test_session: TestSession) -> Dict:
    """
    Calculate listening score for a test session
    
    Returns:
        {
            'raw_score': int,
            'total_questions': int,
            'band_score': float,
            'correct_count': int,
            'incorrect_count': int,
            'question_breakdown': List[Dict]
        }
    """
    # Get all listening answers for this session
    listening_section = test_session.exam.sections.filter(section_type='LISTENING').first()
    if not listening_section:
        return {
            'raw_score': 0,
            'total_questions': 0,
            'band_score': 0.0,
            'correct_count': 0,
            'incorrect_count': 0,
            'question_breakdown': []
        }
    
    # Get all questions for listening section
    questions = Question.objects.filter(section=listening_section)
    total_questions = questions.count()
    
    # Get all user answers
    user_answers = UserAnswer.objects.filter(
        test_session=test_session,
        question__section=listening_section
    )
    
    raw_score = 0
    correct_count = 0
    incorrect_count = 0
    question_breakdown = []
    
    for question in questions:
        user_answer_obj = user_answers.filter(question=question).first()
        
        is_correct = False
        user_answer_text = ""
        
        if user_answer_obj:
            user_answer_text = user_answer_obj.answer or ""
            is_correct = user_answer_obj.is_correct
        
        if is_correct:
            raw_score += question.marks
            correct_count += 1
        else:
            incorrect_count += 1
        
        question_breakdown.append({
            'question_id': str(question.id),
            'question_number': question.question_number,
            'question_type': question.question_type,
            'user_answer': user_answer_text,
            'correct_answer': question.correct_answer,
            'is_correct': is_correct,
            'marks': question.marks,
            'audio_timestamp': question.audio_timestamp
        })
    
    # Convert to band score
    band_score = listening_score_to_band(raw_score)
    
    return {
        'raw_score': raw_score,
        'total_questions': total_questions,
        'band_score': band_score,
        'correct_count': correct_count,
        'incorrect_count': incorrect_count,
        'question_breakdown': question_breakdown
    }


def update_listening_score(test_session: TestSession) -> None:
    """
    Update test session with calculated listening score
    """
    result = calculate_listening_score(test_session)
    test_session.listening_score = result['band_score']
    test_session.save()

