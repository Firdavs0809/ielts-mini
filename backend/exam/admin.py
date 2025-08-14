from django.contrib import admin
from .models import ReadingPassage, Question, TestSession, UserAnswer


@admin.register(ReadingPassage)
class ReadingPassageAdmin(admin.ModelAdmin):
    list_display = ("passage_number", "title", "created_at")
    search_fields = ("title", "content")
    ordering = ("passage_number",)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("question_text", "question_type", "created_at")
    list_filter = ("question_type", "created_at")
    search_fields = ("question_text", "option_a", "option_b", "option_c", "option_d")
    ordering = ("-created_at",)


@admin.register(TestSession)
class TestSessionAdmin(admin.ModelAdmin):
    list_display = ("session_id", "score", "total_questions", "completed_at")
    search_fields = ("session_id",)
    ordering = ("-completed_at",)


@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ("test_session", "question", "answer", "is_correct")
    search_fields = ("answer", "test_session__session_id", "question__question_text")
    list_filter = ("test_session__completed_at",)
