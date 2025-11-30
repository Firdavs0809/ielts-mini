"""
IELTS Band Score Conversion Tables
Converts raw scores (out of 40) to IELTS band scores (0.0-9.0)
"""


def listening_score_to_band(raw_score: int) -> float:
    """
    Convert Listening raw score (0-40) to IELTS band score
    
    IELTS Listening Band Score Conversion:
    39-40: 9.0
    37-38: 8.5
    35-36: 8.0
    33-34: 7.5
    30-32: 7.0
    27-29: 6.5
    23-26: 6.0
    20-22: 5.5
    16-19: 5.0
    13-15: 4.5
    10-12: 4.0
    7-9: 3.5
    5-6: 3.0
    3-4: 2.5
    2: 2.0
    1: 1.0
    0: 0.0
    """
    if raw_score >= 39:
        return 9.0
    elif raw_score >= 37:
        return 8.5
    elif raw_score >= 35:
        return 8.0
    elif raw_score >= 33:
        return 7.5
    elif raw_score >= 30:
        return 7.0
    elif raw_score >= 27:
        return 6.5
    elif raw_score >= 23:
        return 6.0
    elif raw_score >= 20:
        return 5.5
    elif raw_score >= 16:
        return 5.0
    elif raw_score >= 13:
        return 4.5
    elif raw_score >= 10:
        return 4.0
    elif raw_score >= 7:
        return 3.5
    elif raw_score >= 5:
        return 3.0
    elif raw_score >= 3:
        return 2.5
    elif raw_score >= 2:
        return 2.0
    elif raw_score >= 1:
        return 1.0
    else:
        return 0.0


def reading_score_to_band(raw_score: int, is_academic: bool = True) -> float:
    """
    Convert Reading raw score (0-40) to IELTS band score
    
    Academic Reading:
    39-40: 9.0
    37-38: 8.5
    35-36: 8.0
    33-34: 7.5
    30-32: 7.0
    27-29: 6.5
    23-26: 6.0
    19-22: 5.5
    15-18: 5.0
    13-14: 4.5
    10-12: 4.0
    8-9: 3.5
    6-7: 3.0
    4-5: 2.5
    3: 2.0
    2: 1.5
    1: 1.0
    0: 0.0
    
    General Training Reading (slightly different):
    40: 9.0
    39: 8.5
    37-38: 8.0
    36: 7.5
    34-35: 7.0
    32-33: 6.5
    30-31: 6.0
    27-29: 5.5
    23-26: 5.0
    19-22: 4.5
    15-18: 4.0
    12-14: 3.5
    9-11: 3.0
    6-8: 2.5
    4-5: 2.0
    3: 1.5
    2: 1.0
    1: 0.5
    0: 0.0
    """
    if is_academic:
        # Academic Reading
        if raw_score >= 39:
            return 9.0
        elif raw_score >= 37:
            return 8.5
        elif raw_score >= 35:
            return 8.0
        elif raw_score >= 33:
            return 7.5
        elif raw_score >= 30:
            return 7.0
        elif raw_score >= 27:
            return 6.5
        elif raw_score >= 23:
            return 6.0
        elif raw_score >= 19:
            return 5.5
        elif raw_score >= 15:
            return 5.0
        elif raw_score >= 13:
            return 4.5
        elif raw_score >= 10:
            return 4.0
        elif raw_score >= 8:
            return 3.5
        elif raw_score >= 6:
            return 3.0
        elif raw_score >= 4:
            return 2.5
        elif raw_score >= 3:
            return 2.0
        elif raw_score >= 2:
            return 1.5
        elif raw_score >= 1:
            return 1.0
        else:
            return 0.0
    else:
        # General Training Reading
        if raw_score >= 40:
            return 9.0
        elif raw_score >= 39:
            return 8.5
        elif raw_score >= 37:
            return 8.0
        elif raw_score >= 36:
            return 7.5
        elif raw_score >= 34:
            return 7.0
        elif raw_score >= 32:
            return 6.5
        elif raw_score >= 30:
            return 6.0
        elif raw_score >= 27:
            return 5.5
        elif raw_score >= 23:
            return 5.0
        elif raw_score >= 19:
            return 4.5
        elif raw_score >= 15:
            return 4.0
        elif raw_score >= 12:
            return 3.5
        elif raw_score >= 9:
            return 3.0
        elif raw_score >= 6:
            return 2.5
        elif raw_score >= 4:
            return 2.0
        elif raw_score >= 3:
            return 1.5
        elif raw_score >= 2:
            return 1.0
        elif raw_score >= 1:
            return 0.5
        else:
            return 0.0


def calculate_overall_band(listening: float, reading: float, writing: float, speaking: float) -> float:
    """
    Calculate overall IELTS band score from 4 module scores
    Average is rounded to nearest 0.5
    """
    scores = [listening, reading, writing, speaking]
    valid_scores = [s for s in scores if s > 0]
    
    if not valid_scores:
        return 0.0
    
    average = sum(valid_scores) / len(valid_scores)
    # Round to nearest 0.5
    return round(average * 2) / 2

