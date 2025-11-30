"""
Speaking Module AI Scoring Service
Uses AI to score Speaking tasks based on IELTS rubric
"""
from typing import Dict, Optional
from exam.models import SpeakingTask, TestSession
from exam.ai.speaking_scorer import transcribe_audio, score_speaking_task


def calculate_speaking_score(speaking_task: SpeakingTask) -> Dict:
    """
    Calculate speaking score using AI
    
    Process:
    1. Transcribe audio file
    2. Score based on transcript using AI
    
    Returns:
        {
            'band_score': float,
            'feedback': str,
            'scoring_breakdown': Dict,
            'transcript': str,
            'duration': float
        }
    """
    # Transcribe audio if not already transcribed
    if not speaking_task.transcript and speaking_task.audio_file:
        transcript = transcribe_audio(speaking_task.audio_file.path)
        speaking_task.transcript = transcript
        from django.utils import timezone
        speaking_task.transcribed_at = timezone.now()
        speaking_task.save()
    else:
        transcript = speaking_task.transcript or ""
    
    # Score using AI
    scoring_result = score_speaking_task(transcript, speaking_task.part_type)
    
    # Extract feedback from scoring result
    feedback = scoring_result.get('feedback', '')
    
    return {
        'band_score': scoring_result.get('band_score', 0.0),
        'feedback': feedback,
        'scoring_breakdown': scoring_result.get('breakdown', {}),
        'transcript': transcript,
        'duration': speaking_task.duration
    }


def update_speaking_score(speaking_task: SpeakingTask) -> None:
    """
    Update speaking task with AI-calculated score
    """
    from django.utils import timezone
    
    result = calculate_speaking_score(speaking_task)
    
    speaking_task.band_score = result['band_score']
    speaking_task.feedback = result['feedback']
    speaking_task.scoring_breakdown = result['scoring_breakdown']
    speaking_task.transcript = result['transcript']
    speaking_task.scored_at = timezone.now()
    speaking_task.save()
    
    # Update test session speaking score (average of all parts)
    test_session = speaking_task.test_session
    speaking_tasks = test_session.speaking_tasks.all()
    
    if speaking_tasks.exists():
        avg_score = sum(task.band_score for task in speaking_tasks) / speaking_tasks.count()
        test_session.speaking_score = round(avg_score * 2) / 2  # Round to nearest 0.5
        test_session.save()


def calculate_speaking_section_score(test_session: TestSession) -> Dict:
    """
    Calculate overall speaking section score from all speaking tasks
    """
    speaking_tasks = test_session.speaking_tasks.all()
    
    if not speaking_tasks.exists():
        return {
            'band_score': 0.0,
            'parts': []
        }
    
    # Average of all parts
    avg_score = sum(task.band_score for task in speaking_tasks) / speaking_tasks.count()
    avg_score = round(avg_score * 2) / 2
    
    return {
        'band_score': avg_score,
        'parts': [
            {
                'part_type': task.part_type,
                'band_score': task.band_score,
                'duration': task.duration,
                'feedback': task.feedback
            }
            for task in speaking_tasks
        ]
    }

