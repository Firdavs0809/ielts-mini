from rest_framework import serializers
from .models import ReadingPassage, Question, TestSession, UserAnswer


class ReadingPassageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingPassage
        fields = ['id', 'title', 'content', 'passage_number', 'created_at']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            'id', 'question_type', 'question_text', 'question_number',
            'option_a', 'option_b', 'option_c', 'option_d',
            'marks'
        ]


class ReadingTestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = ReadingPassage
        fields = ['id', 'title', 'content', 'passage_number', 'questions']


class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = ['question', 'answer']


class TestSubmissionSerializer(serializers.Serializer):
    answers = serializers.DictField(
        child=serializers.CharField(max_length=500),
        help_text="Dictionary of question_id: answer pairs"
    )


class TestSessionSerializer(serializers.ModelSerializer):
    answers = UserAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = TestSession
        fields = [
            'session_id', 'reading_passage', 'score', 'total_questions',
            'time_taken', 'started_at', 'completed_at', 'answers'
        ]


class TestResultSerializer(serializers.Serializer):
    score = serializers.IntegerField()
    total = serializers.IntegerField()
    percentage = serializers.FloatField()
    band_score = serializers.FloatField()
    time_taken = serializers.IntegerField()
    answers = serializers.DictField()
    correct_answers = serializers.DictField()
    question_details = serializers.ListField()
