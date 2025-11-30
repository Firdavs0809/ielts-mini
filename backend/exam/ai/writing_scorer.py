"""
AI Writing Scorer
Uses OpenAI or Anthropic to score Writing tasks based on IELTS rubric
"""
import os
from typing import Dict, Optional
from django.conf import settings


def score_writing_task(text: str, task_type: str) -> Dict:
    """
    Score a writing task using AI based on IELTS rubric
    
    IELTS Writing Rubric Criteria:
    - Task Achievement (Task 1) / Task Response (Task 2)
    - Coherence and Cohesion
    - Lexical Resource
    - Grammatical Range and Accuracy
    
    Each criterion scored 0-9, then averaged
    
    Args:
        text: The written response
        task_type: 'TASK_1' or 'TASK_2'
    
    Returns:
        {
            'band_score': float (0.0-9.0),
            'breakdown': {
                'task_achievement': float,
                'coherence': float,
                'lexical_resource': float,
                'grammar': float
            },
            'feedback': str
        }
    """
    # Check which AI provider to use
    ai_provider = os.getenv('AI_PROVIDER', 'openai').lower()
    
    if ai_provider == 'anthropic':
        return _score_with_anthropic(text, task_type)
    else:
        return _score_with_openai(text, task_type)


def _score_with_openai(text: str, task_type: str) -> Dict:
    """
    Score writing using OpenAI API
    """
    try:
        from openai import OpenAI
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return _fallback_score(text, task_type)
        
        client = OpenAI(api_key=api_key)
        
        # Construct prompt for IELTS scoring
        rubric = _get_writing_rubric(task_type)
        
        prompt = f"""You are an expert IELTS examiner. Score this writing task based on the IELTS rubric.

Task Type: {task_type}
Writing Response:
{text}

IELTS Writing Rubric:
{rubric}

Provide a detailed scoring breakdown:
1. Task Achievement/Response (0-9)
2. Coherence and Cohesion (0-9)
3. Lexical Resource (0-9)
4. Grammatical Range and Accuracy (0-9)

Calculate the average band score (rounded to nearest 0.5).

Respond in JSON format:
{{
    "task_achievement": <float>,
    "coherence": <float>,
    "lexical_resource": <float>,
    "grammar": <float>,
    "band_score": <float>,
    "feedback": "<detailed feedback>"
}}"""
        
        response = client.chat.completions.create(
            model=os.getenv('OPENAI_MODEL', 'gpt-4'),
            messages=[
                {"role": "system", "content": "You are an expert IELTS examiner. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        
        return {
            'band_score': float(result.get('band_score', 0.0)),
            'breakdown': {
                'task_achievement': float(result.get('task_achievement', 0.0)),
                'coherence': float(result.get('coherence', 0.0)),
                'lexical_resource': float(result.get('lexical_resource', 0.0)),
                'grammar': float(result.get('grammar', 0.0))
            },
            'feedback': result.get('feedback', '')
        }
    
    except Exception as e:
        print(f"Error scoring with OpenAI: {e}")
        return _fallback_score(text, task_type)


def _score_with_anthropic(text: str, task_type: str) -> Dict:
    """
    Score writing using Anthropic API
    """
    try:
        from anthropic import Anthropic
        
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            return _fallback_score(text, task_type)
        
        client = Anthropic(api_key=api_key)
        
        rubric = _get_writing_rubric(task_type)
        
        prompt = f"""You are an expert IELTS examiner. Score this writing task based on the IELTS rubric.

Task Type: {task_type}
Writing Response:
{text}

IELTS Writing Rubric:
{rubric}

Provide a detailed scoring breakdown in JSON format:
{{
    "task_achievement": <float 0-9>,
    "coherence": <float 0-9>,
    "lexical_resource": <float 0-9>,
    "grammar": <float 0-9>,
    "band_score": <float 0-9, rounded to 0.5>,
    "feedback": "<detailed feedback>"
}}"""
        
        message = client.messages.create(
            model=os.getenv('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022'),
            max_tokens=2000,
            temperature=0.3,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        import json
        import re
        
        # Extract JSON from response
        content = message.content[0].text
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        
        if json_match:
            result = json.loads(json_match.group())
        else:
            return _fallback_score(text, task_type)
        
        return {
            'band_score': float(result.get('band_score', 0.0)),
            'breakdown': {
                'task_achievement': float(result.get('task_achievement', 0.0)),
                'coherence': float(result.get('coherence', 0.0)),
                'lexical_resource': float(result.get('lexical_resource', 0.0)),
                'grammar': float(result.get('grammar', 0.0))
            },
            'feedback': result.get('feedback', '')
        }
    
    except Exception as e:
        print(f"Error scoring with Anthropic: {e}")
        return _fallback_score(text, task_type)


def _get_writing_rubric(task_type: str) -> str:
    """Get IELTS writing rubric description"""
    if task_type == 'TASK_1':
        return """
Task Achievement (Task 1):
- Band 9: Fully satisfies all requirements; clear overview; key features clearly presented
- Band 7: Covers requirements; clear overview; key features presented
- Band 5: Generally addresses task; format may be inappropriate; mechanical details
- Band 3: Fails to address task; may misunderstand data
"""
    else:
        return """
Task Response (Task 2):
- Band 9: Fully addresses all parts; presents fully developed position
- Band 7: Addresses all parts; presents clear position; develops main ideas
- Band 5: Addresses task only partially; presents position but development limited
- Band 3: Does not adequately address any part; position unclear
"""


def _fallback_score(text: str, task_type: str) -> Dict:
    """
    Fallback scoring when AI is unavailable
    Simple heuristic-based scoring
    """
    word_count = len(text.split())
    
    # Basic heuristics
    if task_type == 'TASK_1':
        min_words = 150
        ideal_words = 200
    else:
        min_words = 250
        ideal_words = 300
    
    # Word count penalty
    if word_count < min_words:
        base_score = 4.0
    elif word_count < ideal_words:
        base_score = 5.5
    else:
        base_score = 6.0
    
    # Simple adjustments based on text length and structure
    sentences = text.count('.') + text.count('!') + text.count('?')
    if sentences > 10:
        base_score += 0.5
    if len(text) > 500:
        base_score += 0.5
    
    # Cap at 9.0
    band_score = min(9.0, base_score)
    band_score = round(band_score * 2) / 2  # Round to 0.5
    
    return {
        'band_score': band_score,
        'breakdown': {
            'task_achievement': band_score,
            'coherence': band_score,
            'lexical_resource': band_score,
            'grammar': band_score
        },
        'feedback': 'AI scoring unavailable. Using fallback scoring. Please configure AI provider for accurate scoring.'
    }


def generate_writing_feedback(text: str, task_type: str, scoring_result: Optional[Dict] = None) -> str:
    """
    Generate detailed feedback for writing task
    
    Args:
        text: The written response
        task_type: 'TASK_1' or 'TASK_2'
        scoring_result: Optional scoring result from score_writing_task
    
    Returns:
        Detailed feedback string
    """
    if scoring_result and scoring_result.get('feedback'):
        return scoring_result['feedback']
    
    # Generate basic feedback
    word_count = len(text.split())
    min_words = 150 if task_type == 'TASK_1' else 250
    
    feedback = f"Word count: {word_count} (minimum: {min_words})\n\n"
    
    if word_count < min_words:
        feedback += "⚠️ Your response is below the minimum word count. Try to expand your ideas.\n\n"
    
    feedback += "For more detailed feedback, please configure AI provider (OpenAI or Anthropic)."
    
    return feedback

