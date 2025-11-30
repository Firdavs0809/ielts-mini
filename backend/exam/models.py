"""
IELTS Exam Platform - Complete Models
Supports all 4 modules: Listening, Reading, Writing, Speaking
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import os


def audio_upload_path(instance, filename):
    """Generate upload path for listening audio files"""
    return f'listening_audio/{instance.section.id}/{filename}'


def writing_upload_path(instance, filename):
    """Generate upload path for writing task submissions"""
    return f'writing_submissions/{instance.test_session.session_id}/{filename}'


def speaking_upload_path(instance, filename):
    """Generate upload path for speaking audio submissions"""
    return f'speaking_submissions/{instance.test_session.session_id}/{filename}'


class Exam(models.Model):
    """
    Main exam container that groups all sections
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    total_duration = models.IntegerField(help_text="Total duration in minutes", default=180)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.total_duration} min)"


class Section(models.Model):
    """
    Represents one of the 4 IELTS modules: Listening, Reading, Writing, Speaking
    """
    SECTION_TYPES = [
        ('LISTENING', 'Listening'),
        ('READING', 'Reading'),
        ('WRITING', 'Writing'),
        ('SPEAKING', 'Speaking'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='sections')
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    duration = models.IntegerField(help_text="Duration in minutes", default=30)
    order = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['exam', 'order']
        unique_together = ['exam', 'section_type']
    
    def __str__(self):
        return f"{self.exam.title} - {self.get_section_type_display()}"


class Passage(models.Model):
    """
    Reading or Listening passage (can be used for both)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='passages')
    title = models.CharField(max_length=255)
    content = models.TextField()
    passage_number = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['section', 'passage_number']
        unique_together = ['section', 'passage_number']
    
    def __str__(self):
        return f"Passage {self.passage_number}: {self.title}"


class ListeningAudio(models.Model):
    """
    Audio file for Listening section with timestamps
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='audio_files')
    title = models.CharField(max_length=255)
    audio_file = models.FileField(upload_to=audio_upload_path)
    duration = models.IntegerField(help_text="Duration in seconds")
    
    # Timestamps for different parts (stored as JSON string or separate model)
    # Format: [{"start": 0, "end": 300, "label": "Part 1"}, ...]
    timestamps = models.JSONField(default=list, blank=True, 
                                  help_text="List of dicts with start, end, label")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['section', 'created_at']
    
    def __str__(self):
        return f"{self.section.get_section_type_display()} - {self.title}"


class Question(models.Model):
    """
    Question model supporting all IELTS question types
    """
    QUESTION_TYPES = [
        ('MCQ', 'Multiple Choice'),
        ('TRUE_FALSE', 'True/False/Not Given'),
        ('FILL_BLANK', 'Fill in the Blanks'),
        ('MATCHING', 'Matching'),
        ('HEADINGS', 'Headings'),
        ('SHORT_TEXT', 'Short Text Answer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='questions')
    passage = models.ForeignKey(Passage, on_delete=models.CASCADE, related_name='questions', 
                                blank=True, null=True, 
                                help_text="Required for Reading, optional for Listening")
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='MCQ')
    question_text = models.TextField()
    question_number = models.IntegerField()
    
    # For MCQ - can have multiple options
    # For Matching - stores matching pairs
    # For Headings - stores heading options
    
    # Correct answer(s) - can be comma-separated for multiple valid answers
    correct_answer = models.CharField(max_length=1000)
    
    # Additional fields
    explanation = models.TextField(blank=True, null=True)
    marks = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    
    # For Listening: timestamp in audio where answer appears
    audio_timestamp = models.FloatField(blank=True, null=True, 
                                        help_text="Timestamp in seconds for Listening questions")
    
    # For Matching/Headings: store options as JSON
    options_data = models.JSONField(default=dict, blank=True,
                                   help_text="Structured data for matching pairs, headings, etc.")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['section', 'question_number']
        unique_together = ['section', 'question_number']
    
    def __str__(self):
        return f"Q{self.question_number} ({self.get_question_type_display()}): {self.question_text[:50]}..."


class Option(models.Model):
    """
    Separate model for MCQ options (more flexible than storing in Question)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_label = models.CharField(max_length=10, help_text="A, B, C, D, etc.")
    option_text = models.TextField()
    order = models.IntegerField(default=1)
    is_correct = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['question', 'order']
        unique_together = ['question', 'option_label']
    
    def __str__(self):
        return f"{self.question.question_number} - {self.option_label}: {self.option_text[:30]}..."


class TestSession(models.Model):
    """
    User test session - tracks one complete exam attempt
    """
    STATUS_CHOICES = [
        ('NOT_STARTED', 'Not Started'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('ABANDONED', 'Abandoned'),
    ]
    
    session_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='sessions')
    
    # User identification (can be extended with User model later)
    user_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Timing
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_remaining = models.IntegerField(help_text="Time remaining in seconds", default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NOT_STARTED')
    
    # Scores (calculated after completion)
    listening_score = models.IntegerField(default=0)
    reading_score = models.IntegerField(default=0)
    writing_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(9.0)])
    speaking_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(9.0)])
    
    # Overall band score
    overall_band_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(9.0)])
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"Session {self.session_id} - {self.exam.title} ({self.status})"
    
    def calculate_overall_band(self):
        """Calculate overall IELTS band score (average of 4 modules)"""
        scores = [
            self.listening_score if self.listening_score > 0 else None,
            self.reading_score if self.reading_score > 0 else None,
            self.writing_score if self.writing_score > 0 else None,
            self.speaking_score if self.speaking_score > 0 else None,
        ]
        valid_scores = [s for s in scores if s is not None]
        if valid_scores:
            avg = sum(valid_scores) / len(valid_scores)
            # Round to nearest 0.5
            return round(avg * 2) / 2
        return 0.0


class UserAnswer(models.Model):
    """
    User's answer to a question (auto-saved)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test_session = models.ForeignKey(TestSession, related_name="answers", on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.TextField(blank=True, null=True)
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['test_session', 'question']
        ordering = ['question__question_number']
    
    def save(self, *args, **kwargs):
        # Auto-calculate if answer is correct (only for Listening/Reading)
        if self.question.section.section_type in ['LISTENING', 'READING']:
            self.is_correct = self.check_answer()
        super().save(*args, **kwargs)
    
    def check_answer(self):
        """Check if answer is correct (for Listening/Reading only)"""
        if not self.answer:
            return False
        
        user_answer = str(self.answer).strip().lower()
        correct_answer = str(self.question.correct_answer).strip().lower()
        
        if self.question.question_type == 'TRUE_FALSE':
            return user_answer == correct_answer
        elif self.question.question_type == 'FILL_BLANK':
            # Allow for multiple correct answers separated by commas
            correct_answers = [ans.strip().lower() for ans in correct_answer.split(',')]
            return user_answer in correct_answers
        elif self.question.question_type == 'MCQ':
            return user_answer == correct_answer
        elif self.question.question_type == 'MATCHING':
            # For matching, compare structured answers
            return user_answer == correct_answer
        elif self.question.question_type == 'HEADINGS':
            return user_answer == correct_answer
        else:
            return user_answer == correct_answer
    
    def __str__(self):
        return f"{self.test_session.session_id} - Q{self.question.question_number}: {self.answer[:30]}..."


class WritingTask(models.Model):
    """
    Writing task submission (Task 1 or Task 2)
    """
    TASK_TYPES = [
        ('TASK_1', 'Task 1'),
        ('TASK_2', 'Task 2'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test_session = models.ForeignKey(TestSession, on_delete=models.CASCADE, related_name='writing_tasks')
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    task_type = models.CharField(max_length=10, choices=TASK_TYPES)
    
    # User's written response
    response_text = models.TextField()
    word_count = models.IntegerField(default=0)
    
    # AI Scoring results
    band_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(9.0)])
    feedback = models.TextField(blank=True, null=True)
    
    # Scoring breakdown (stored as JSON)
    scoring_breakdown = models.JSONField(default=dict, blank=True,
                                        help_text="Task Achievement, Coherence, Lexical Resource, Grammar")
    
    # File upload (optional)
    file_upload = models.FileField(upload_to=writing_upload_path, blank=True, null=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    scored_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['test_session', 'task_type']
        unique_together = ['test_session', 'task_type']
    
    def __str__(self):
        return f"{self.test_session.session_id} - {self.get_task_type_display()} ({self.band_score})"


class SpeakingTask(models.Model):
    """
    Speaking task submission with audio upload
    """
    PART_TYPES = [
        ('PART_1', 'Part 1: Introduction & Interview'),
        ('PART_2', 'Part 2: Long Turn'),
        ('PART_3', 'Part 3: Discussion'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test_session = models.ForeignKey(TestSession, on_delete=models.CASCADE, related_name='speaking_tasks')
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    part_type = models.CharField(max_length=10, choices=PART_TYPES)
    
    # Audio file
    audio_file = models.FileField(upload_to=speaking_upload_path)
    duration = models.FloatField(help_text="Duration in seconds", default=0.0)
    
    # Transcription
    transcript = models.TextField(blank=True, null=True)
    transcribed_at = models.DateTimeField(null=True, blank=True)
    
    # AI Scoring results
    band_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(9.0)])
    feedback = models.TextField(blank=True, null=True)
    
    # Scoring breakdown (stored as JSON)
    scoring_breakdown = models.JSONField(default=dict, blank=True,
                                        help_text="Fluency, Lexical Resource, Grammar, Pronunciation")
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    scored_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['test_session', 'part_type']
        unique_together = ['test_session', 'part_type']
    
    def __str__(self):
        return f"{self.test_session.session_id} - {self.get_part_type_display()} ({self.band_score})"
