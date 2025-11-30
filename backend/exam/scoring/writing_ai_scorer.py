"""
Writing Module AI Scoring Service
Uses AI to score Writing tasks based on IELTS rubric
"""
from typing import Dict, Optional
from exam.models import WritingTask, TestSession
from exam.ai.writing_scorer import score_writing_task, generate_writing_feedback


def calculate_writing_score(writing_task: WritingTask) -> Dict:
    """
    Calculate writing score using AI
    
    Returns:
        {
            'band_score': float,
            'feedback': str,
            'scoring_breakdown': Dict,
            'word_count': int
        }
    """
    response_text = writing_task.response_text
    task_type = writing_task.task_type
    
    # Count words
    word_count = len(response_text.split())
    
    # Score using AI
    scoring_result = score_writing_task(response_text, task_type)
    
    # Generate feedback
    feedback = generate_writing_feedback(response_text, task_type, scoring_result)
    
    return {
        'band_score': scoring_result.get('band_score', 0.0),
        'feedback': feedback,
        'scoring_breakdown': scoring_result.get('breakdown', {}),
        'word_count': word_count
    }


def update_writing_score(writing_task: WritingTask) -> None:
    """
    Update writing task with AI-calculated score
    """
    from django.utils import timezone
    
    result = calculate_writing_score(writing_task)
    
    writing_task.band_score = result['band_score']
    writing_task.feedback = result['feedback']
    writing_task.scoring_breakdown = result['scoring_breakdown']
    writing_task.word_count = result['word_count']
    writing_task.scored_at = timezone.now()
    writing_task.save()
    
    # Update test session writing score (average of Task 1 and Task 2)
    test_session = writing_task.test_session
    writing_tasks = test_session.writing_tasks.all()
    
    if writing_tasks.count() == 2:
        # Both tasks completed, calculate average
        avg_score = sum(task.band_score for task in writing_tasks) / 2
        test_session.writing_score = round(avg_score * 2) / 2  # Round to nearest 0.5
    elif writing_tasks.count() == 1:
        # Only one task completed
        test_session.writing_score = writing_task.band_score
    
    test_session.save()


def calculate_writing_section_score(test_session: TestSession) -> Dict:
    """
    Calculate overall writing section score from all writing tasks
    """
    writing_tasks = test_session.writing_tasks.all()
    
    if not writing_tasks.exists():
        return {
            'band_score': 0.0,
            'task_1_score': 0.0,
            'task_2_score': 0.0,
            'tasks': []
        }
    
    task_1 = writing_tasks.filter(task_type='TASK_1').first()
    task_2 = writing_tasks.filter(task_type='TASK_2').first()
    
    task_1_score = task_1.band_score if task_1 else 0.0
    task_2_score = task_2.band_score if task_2 else 0.0
    
    # Overall writing score is weighted: Task 1 (33%) + Task 2 (67%)
    if task_1_score > 0 and task_2_score > 0:
        overall_score = (task_1_score * 0.33) + (task_2_score * 0.67)
        overall_score = round(overall_score * 2) / 2
    elif task_2_score > 0:
        overall_score = task_2_score
    elif task_1_score > 0:
        overall_score = task_1_score
    else:
        overall_score = 0.0
    
    return {
        'band_score': overall_score,
        'task_1_score': task_1_score,
        'task_2_score': task_2_score,
        'tasks': [
            {
                'task_type': task.task_type,
                'band_score': task.band_score,
                'word_count': task.word_count,
                'feedback': task.feedback
            }
            for task in writing_tasks
        ]
    }

