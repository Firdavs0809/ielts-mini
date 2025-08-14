from django.db import models
import uuid


class ReadingPassage(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    passage_number = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['passage_number']
    
    def __str__(self):
        return f"Passage {self.passage_number}: {self.title}"


class Question(models.Model):
    QUESTION_TYPES = [
        ('MCQ', 'Multiple Choice'),
        ('TRUE_FALSE', 'True/False/Not Given'),
        ('FILL_BLANK', 'Fill in the Blanks'),
        ('MATCHING', 'Matching'),
        ('TEXT', 'Written Answer'),
    ]

    reading_passage = models.ForeignKey(ReadingPassage, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=15, choices=QUESTION_TYPES, default='MCQ')
    question_text = models.TextField()
    question_number = models.IntegerField()

    # For MCQ
    option_a = models.CharField(max_length=500, blank=True, null=True)
    option_b = models.CharField(max_length=500, blank=True, null=True)
    option_c = models.CharField(max_length=500, blank=True, null=True)
    option_d = models.CharField(max_length=500, blank=True, null=True)

    # For all question types
    correct_answer = models.CharField(max_length=500)
    
    # Additional fields for different question types
    explanation = models.TextField(blank=True, null=True)
    marks = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['reading_passage', 'question_number']

    def __str__(self):
        return f"Q{self.question_number}: {self.question_text[:50]}..."


class TestSession(models.Model):
    session_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    reading_passage = models.ForeignKey(ReadingPassage, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    time_taken = models.IntegerField(default=0)  # in seconds
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"Session {self.session_id} - {self.score}/{self.total_questions}"


class UserAnswer(models.Model):
    test_session = models.ForeignKey(TestSession, related_name="answers", on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['test_session', 'question']

    def save(self, *args, **kwargs):
        # Auto-calculate if answer is correct
        self.is_correct = self.check_answer()
        super().save(*args, **kwargs)

    def check_answer(self):
        user_answer = str(self.answer).strip().lower()
        correct_answer = str(self.question.correct_answer).strip().lower()
        
        if self.question.question_type == 'TRUE_FALSE':
            return user_answer == correct_answer
        elif self.question.question_type == 'FILL_BLANK':
            # Allow for multiple correct answers separated by commas
            correct_answers = [ans.strip().lower() for ans in correct_answer.split(',')]
            return user_answer in correct_answers
        else:
            return user_answer == correct_answer

    def __str__(self):
        return f"{self.test_session.session_id} - Q{self.question.question_number}: {self.answer}"
