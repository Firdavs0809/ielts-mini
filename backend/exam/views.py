# exam/views.py
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import ReadingPassage, Question, TestSession, UserAnswer
from .serializers import (
    ReadingTestSerializer, 
    TestSubmissionSerializer, 
    TestResultSerializer,
    QuestionSerializer
)


@api_view(['GET'])
def reading_test(request):
    """
    Get a complete IELTS Reading test with passage and questions
    """
    passage = ReadingPassage.objects.first()
    if not passage:
        return Response({"error": "No reading passages available"}, status=status.HTTP_404_NOT_FOUND)
    serializer = ReadingTestSerializer(passage)
    # Optionally include session_id if passed as query param
    session_id = request.query_params.get('session_id')
    data = serializer.data
    if session_id:
        data['session_id'] = session_id
    return Response(data)
    

@api_view(['POST'])
def submit_reading(request):
    """
    Submit IELTS Reading test answers and get results
    """
    serializer = TestSubmissionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    answers_data = serializer.validated_data['answers']
    session_id = request.data.get('session_id')
    if not session_id:
        return Response({"error": "Session ID required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        test_session = TestSession.objects.get(session_id=session_id)
    except TestSession.DoesNotExist:
        return Response({"error": "Invalid session"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check time validity (max 60 min = 3600 sec)
    time_taken = int((timezone.now() - test_session.started_at).total_seconds())
    if time_taken > 3600:
        return Response({"error": "Test time exceeded"}, status=status.HTTP_400_BAD_REQUEST)
    if test_session.completed_at:
        return Response({"error": "Test already submitted"}, status=status.HTTP_400_BAD_REQUEST)
    
    passage = test_session.reading_passage
    # Process answers and calculate score
    score = 0
    correct_answers = {}
    user_answers = {}
    question_details = []
    
    for question in passage.questions.all():
        user_answer = answers_data.get(str(question.id), "")
        user_answers[str(question.id)] = user_answer
        correct_answers[str(question.id)] = question.correct_answer
        
        # Create user answer record
        user_answer_obj = UserAnswer.objects.create(
            test_session=test_session,
            question=question,
            answer=user_answer
        )
        
        # Check if answer is correct
        if user_answer_obj.is_correct:
            score += question.marks
        
        # Add question details for result breakdown
        question_details.append({
            'question_id': question.id,
            'question_number': question.question_number,
            'question_type': question.question_type,
            'question_text': question.question_text,
            'user_answer': user_answer,
            'correct_answer': question.correct_answer,
            'is_correct': user_answer_obj.is_correct,
            'marks': question.marks
        })
    
    # Mark session as completed
    test_session.time_taken = time_taken
    test_session.completed_at = timezone.now()
    
    # Update test session with final score
    test_session.score = score
    test_session.save()
    
    # Calculate percentage and band score
    total_marks = sum(q.marks for q in passage.questions.all())
    percentage = (score / total_marks * 100) if total_marks > 0 else 0
    
    # IELTS Band Score calculation
    band_score = calculate_band_score(percentage)
    
    # Prepare response
    result_data = {
        'score': score,
        'total': total_marks,
        'percentage': round(percentage, 1),
        'band_score': band_score,
        'time_taken': time_taken,
        'answers': user_answers,
        'correct_answers': correct_answers,
        'question_details': question_details,
        'session_id': str(test_session.session_id)
    }
    
    return Response(result_data, status=status.HTTP_200_OK)


def calculate_band_score(percentage):
    """
    Calculate IELTS Band Score based on percentage
    """
    if percentage >= 90:
        return 9.0
    elif percentage >= 85:
        return 8.5
    elif percentage >= 80:
        return 8.0
    elif percentage >= 75:
        return 7.5
    elif percentage >= 70:
        return 7.0
    elif percentage >= 65:
        return 6.5
    elif percentage >= 60:
        return 6.0
    elif percentage >= 55:
        return 5.5
    elif percentage >= 50:
        return 5.0
    elif percentage >= 45:
        return 4.5
    elif percentage >= 40:
        return 4.0
    else:
        return 3.5


@api_view(['GET'])
def questions_list(request):
    """
    Get all questions (legacy endpoint for compatibility)
    """
    questions = Question.objects.all()
    serializer = QuestionSerializer(questions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def submit_test(request):
    """
    Legacy submit endpoint for compatibility
    """
    try:
        answers = request.data.get('answers', {})
        
        # Create a simple test session
        session = TestSession.objects.create(
            reading_passage=ReadingPassage.objects.first(),
            total_questions=len(answers)
        )
        
        score = 0
        for question_id, answer in answers.items():
            try:
                question = Question.objects.get(id=question_id)
                user_answer = UserAnswer.objects.create(
                    test_session=session,
                    question=question,
                    answer=answer
                )
                if user_answer.is_correct:
                    score += 1
            except Question.DoesNotExist:
                continue
        
        session.score = score
        session.save()
        
        return Response({
            'score': score,
            'total': len(answers)
        })
    
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def start_reading_test(request):
    """
    Start a reading test session and return session_id
    """
    passage = ReadingPassage.objects.first()
    if not passage:
        return Response({"error": "No passage found"}, status=status.HTTP_404_NOT_FOUND)
    count = passage.questions.count()
    if count < 13 or count > 14:
        return Response({"error": "Passage must have 13 or 14 questions"}, status=status.HTTP_400_BAD_REQUEST)
    session = TestSession.objects.create(
        reading_passage=passage,
        total_questions=count
    )
    print("Test session started:", session.session_id)
    return Response({"session_id": str(session.session_id)}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def end_session(request):
    """
    End a reading test session
    """
    session_id = request.data.get('session_id')
    if not session_id:
        return Response({"error": "Session ID required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        session = TestSession.objects.get(session_id=session_id)
    except TestSession.DoesNotExist:
        return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
    if session.completed_at:
        return Response({"error": "Session already ended"}, status=status.HTTP_400_BAD_REQUEST)
    session.completed_at = timezone.now()
    session.time_taken = int((session.completed_at - session.started_at).total_seconds())
    session.save()
    return Response({"message": "Session ended", "time_taken": session.time_taken}, status=status.HTTP_200_OK)
