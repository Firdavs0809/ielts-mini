"""
AI Speaking Scorer
Uses OpenAI or Anthropic to transcribe and score Speaking tasks
"""
import os
from typing import Dict, Optional


def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribe audio file to text using AI
    
    Args:
        audio_file_path: Path to audio file
    
    Returns:
        Transcribed text
    """
    ai_provider = os.getenv('AI_PROVIDER', 'openai').lower()
    
    if ai_provider == 'anthropic':
        return _transcribe_with_anthropic(audio_file_path)
    else:
        return _transcribe_with_openai(audio_file_path)


def _transcribe_with_openai(audio_file_path: str) -> str:
    """
    Transcribe audio using OpenAI Whisper API
    """
    try:
        from openai import OpenAI
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return ""
        
        client = OpenAI(api_key=api_key)
        
        with open(audio_file_path, 'rb') as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        
        return transcript.text
    
    except Exception as e:
        print(f"Error transcribing with OpenAI: {e}")
        return ""


def _transcribe_with_anthropic(audio_file_path: str) -> str:
    """
    Transcribe audio using Anthropic (if supported) or fallback to OpenAI
    """
    # Anthropic doesn't have direct audio transcription
    # Fallback to OpenAI or use external service
    try:
        from openai import OpenAI
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return ""
        
        client = OpenAI(api_key=api_key)
        
        with open(audio_file_path, 'rb') as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        
        return transcript.text
    
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return ""


def score_speaking_task(transcript: str, part_type: str) -> Dict:
    """
    Score a speaking task using AI based on IELTS rubric
    
    IELTS Speaking Rubric Criteria:
    - Fluency and Coherence
    - Lexical Resource
    - Grammatical Range and Accuracy
    - Pronunciation
    
    Each criterion scored 0-9, then averaged
    
    Args:
        transcript: The transcribed speech
        part_type: 'PART_1', 'PART_2', or 'PART_3'
    
    Returns:
        {
            'band_score': float (0.0-9.0),
            'breakdown': {
                'fluency': float,
                'lexical_resource': float,
                'grammar': float,
                'pronunciation': float
            },
            'feedback': str
        }
    """
    if not transcript:
        return {
            'band_score': 0.0,
            'breakdown': {
                'fluency': 0.0,
                'lexical_resource': 0.0,
                'grammar': 0.0,
                'pronunciation': 0.0
            },
            'feedback': 'No transcript available'
        }
    
    ai_provider = os.getenv('AI_PROVIDER', 'openai').lower()
    
    if ai_provider == 'anthropic':
        return _score_speaking_with_anthropic(transcript, part_type)
    else:
        return _score_speaking_with_openai(transcript, part_type)


def _score_speaking_with_openai(transcript: str, part_type: str) -> Dict:
    """
    Score speaking using OpenAI API
    """
    try:
        from openai import OpenAI
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return _fallback_speaking_score(transcript, part_type)
        
        client = OpenAI(api_key=api_key)
        
        rubric = _get_speaking_rubric()
        
        prompt = f"""You are an expert IELTS examiner. Score this speaking transcript based on the IELTS rubric.

Part Type: {part_type}
Transcript:
{transcript}

IELTS Speaking Rubric:
{rubric}

Provide a detailed scoring breakdown:
1. Fluency and Coherence (0-9)
2. Lexical Resource (0-9)
3. Grammatical Range and Accuracy (0-9)
4. Pronunciation (0-9)

Calculate the average band score (rounded to nearest 0.5).

Respond in JSON format:
{{
    "fluency": <float>,
    "lexical_resource": <float>,
    "grammar": <float>,
    "pronunciation": <float>,
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
                'fluency': float(result.get('fluency', 0.0)),
                'lexical_resource': float(result.get('lexical_resource', 0.0)),
                'grammar': float(result.get('grammar', 0.0)),
                'pronunciation': float(result.get('pronunciation', 0.0))
            },
            'feedback': result.get('feedback', '')
        }
    
    except Exception as e:
        print(f"Error scoring speaking with OpenAI: {e}")
        return _fallback_speaking_score(transcript, part_type)


def _score_speaking_with_anthropic(transcript: str, part_type: str) -> Dict:
    """
    Score speaking using Anthropic API
    """
    try:
        from anthropic import Anthropic
        
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            return _fallback_speaking_score(transcript, part_type)
        
        client = Anthropic(api_key=api_key)
        
        rubric = _get_speaking_rubric()
        
        prompt = f"""You are an expert IELTS examiner. Score this speaking transcript based on the IELTS rubric.

Part Type: {part_type}
Transcript:
{transcript}

IELTS Speaking Rubric:
{rubric}

Provide a detailed scoring breakdown in JSON format:
{{
    "fluency": <float 0-9>,
    "lexical_resource": <float 0-9>,
    "grammar": <float 0-9>,
    "pronunciation": <float 0-9>,
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
        
        content = message.content[0].text
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        
        if json_match:
            result = json.loads(json_match.group())
        else:
            return _fallback_speaking_score(transcript, part_type)
        
        return {
            'band_score': float(result.get('band_score', 0.0)),
            'breakdown': {
                'fluency': float(result.get('fluency', 0.0)),
                'lexical_resource': float(result.get('lexical_resource', 0.0)),
                'grammar': float(result.get('grammar', 0.0)),
                'pronunciation': float(result.get('pronunciation', 0.0))
            },
            'feedback': result.get('feedback', '')
        }
    
    except Exception as e:
        print(f"Error scoring speaking with Anthropic: {e}")
        return _fallback_speaking_score(transcript, part_type)


def _get_speaking_rubric() -> str:
    """Get IELTS speaking rubric description"""
    return """
Fluency and Coherence:
- Band 9: Speaks fluently; uses discourse markers naturally
- Band 7: Speaks at length; uses connectives and discourse markers
- Band 5: Usually maintains flow; uses basic connectives
- Band 3: Cannot respond without noticeable pauses

Lexical Resource:
- Band 9: Uses vocabulary with full flexibility and precision
- Band 7: Uses vocabulary resource effectively; some less common items
- Band 5: Manages to talk about familiar topics; vocabulary limited
- Band 3: Uses simple vocabulary; frequent errors

Grammatical Range and Accuracy:
- Band 9: Uses wide range of structures naturally; error-free
- Band 7: Uses range of structures; some errors but meaning clear
- Band 5: Uses basic structures; errors common but meaning clear
- Band 3: Produces basic sentence forms; frequent errors

Pronunciation:
- Band 9: Easy to understand; accent doesn't impede communication
- Band 7: Easy to understand; occasional mispronunciations
- Band 5: Generally clear; mispronunciations cause some difficulty
- Band 3: Many mispronunciations; difficult to understand
"""


def _fallback_speaking_score(transcript: str, part_type: str) -> Dict:
    """
    Fallback scoring when AI is unavailable
    """
    if not transcript:
        return {
            'band_score': 0.0,
            'breakdown': {
                'fluency': 0.0,
                'lexical_resource': 0.0,
                'grammar': 0.0,
                'pronunciation': 0.0
            },
            'feedback': 'No transcript available'
        }
    
    word_count = len(transcript.split())
    
    # Basic heuristics
    base_score = 5.0
    
    if word_count > 100:
        base_score += 0.5
    if word_count > 200:
        base_score += 0.5
    
    # Check for basic grammar indicators
    sentences = transcript.count('.') + transcript.count('!') + transcript.count('?')
    if sentences > 5:
        base_score += 0.5
    
    band_score = min(9.0, base_score)
    band_score = round(band_score * 2) / 2
    
    return {
        'band_score': band_score,
        'breakdown': {
            'fluency': band_score,
            'lexical_resource': band_score,
            'grammar': band_score,
            'pronunciation': band_score
        },
        'feedback': 'AI scoring unavailable. Using fallback scoring. Please configure AI provider for accurate scoring.'
    }

