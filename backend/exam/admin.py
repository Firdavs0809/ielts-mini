"""
Django Admin Configuration for IELTS Exam Platform
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Exam, Section, Passage, Question, Option, TestSession, UserAnswer,
    WritingTask, SpeakingTask, ListeningAudio
)


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('title', 'total_duration', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'exam', 'section_type', 'duration', 'order', 'is_active')
    list_filter = ('section_type', 'is_active', 'exam')
    search_fields = ('title', 'description')
    ordering = ('exam', 'order')
    readonly_fields = ('id', 'created_at')


@admin.register(Passage)
class PassageAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'passage_number', 'created_at')
    list_filter = ('section', 'section__section_type', 'created_at')
    search_fields = ('title', 'content')
    ordering = ('section', 'passage_number')
    readonly_fields = ('id', 'created_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'section', 'title', 'passage_number')
        }),
        ('Content', {
            'fields': ('content',)
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_number', 'question_type', 'section', 'passage', 'marks', 'created_at')
    list_filter = ('question_type', 'section__section_type', 'created_at')
    search_fields = ('question_text', 'correct_answer')
    ordering = ('section', 'question_number')
    readonly_fields = ('id', 'created_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'section', 'passage', 'question_type', 'question_number')
        }),
        ('Question Content', {
            'fields': ('question_text', 'correct_answer', 'marks', 'explanation')
        }),
        ('Listening Specific', {
            'fields': ('audio_timestamp',),
            'classes': ('collapse',)
        }),
        ('Additional Data', {
            'fields': ('options_data',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )
    
    inlines = []


class OptionInline(admin.TabularInline):
    model = Option
    extra = 4
    fields = ('option_label', 'option_text', 'is_correct', 'order')


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('question', 'option_label', 'option_text', 'is_correct', 'order')
    list_filter = ('is_correct', 'question__question_type')
    search_fields = ('option_text', 'question__question_text')
    ordering = ('question', 'order')


# Update QuestionAdmin to include OptionInline
QuestionAdmin.inlines = [OptionInline]


@admin.register(ListeningAudio)
class ListeningAudioAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'duration', 'created_at')
    list_filter = ('section', 'created_at')
    search_fields = ('title',)
    ordering = ('section', 'created_at')
    readonly_fields = ('id', 'created_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'section', 'title', 'audio_file')
        }),
        ('Audio Details', {
            'fields': ('duration', 'timestamps')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )


@admin.register(TestSession)
class TestSessionAdmin(admin.ModelAdmin):
    list_display = (
        'session_id', 'exam', 'user_id', 'status', 'overall_band_score',
        'listening_score', 'reading_score', 'writing_score', 'speaking_score',
        'started_at', 'completed_at'
    )
    list_filter = ('status', 'exam', 'started_at', 'completed_at')
    search_fields = ('session_id', 'user_id', 'exam__title')
    ordering = ('-started_at',)
    readonly_fields = (
        'session_id', 'started_at', 'completed_at', 'created_at', 'updated_at',
        'overall_band_score'
    )
    
    fieldsets = (
        ('Session Information', {
            'fields': ('session_id', 'exam', 'user_id', 'status')
        }),
        ('Timing', {
            'fields': ('started_at', 'completed_at', 'time_remaining')
        }),
        ('Scores', {
            'fields': (
                'listening_score', 'reading_score', 'writing_score', 'speaking_score',
                'overall_band_score'
            )
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return self.readonly_fields + ('exam',)
        return self.readonly_fields


@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ('test_session', 'question', 'answer_preview', 'is_correct', 'answered_at')
    list_filter = ('is_correct', 'question__question_type', 'answered_at')
    search_fields = ('answer', 'test_session__session_id', 'question__question_text')
    ordering = ('-answered_at',)
    readonly_fields = ('id', 'answered_at', 'updated_at')
    
    def answer_preview(self, obj):
        answer = obj.answer or ""
        if len(answer) > 50:
            return format_html('<span title="{}">{}</span>', answer, answer[:50] + '...')
        return answer
    answer_preview.short_description = 'Answer'


@admin.register(WritingTask)
class WritingTaskAdmin(admin.ModelAdmin):
    list_display = (
        'test_session', 'task_type', 'band_score', 'word_count',
        'submitted_at', 'scored_at'
    )
    list_filter = ('task_type', 'submitted_at', 'scored_at')
    search_fields = ('test_session__session_id', 'response_text')
    ordering = ('-submitted_at',)
    readonly_fields = ('id', 'submitted_at', 'scored_at')
    
    fieldsets = (
        ('Task Information', {
            'fields': ('id', 'test_session', 'section', 'task_type')
        }),
        ('Response', {
            'fields': ('response_text', 'word_count', 'file_upload')
        }),
        ('Scoring', {
            'fields': ('band_score', 'feedback', 'scoring_breakdown')
        }),
        ('Metadata', {
            'fields': ('submitted_at', 'scored_at')
        }),
    )


@admin.register(SpeakingTask)
class SpeakingTaskAdmin(admin.ModelAdmin):
    list_display = (
        'test_session', 'part_type', 'band_score', 'duration',
        'submitted_at', 'scored_at'
    )
    list_filter = ('part_type', 'submitted_at', 'scored_at')
    search_fields = ('test_session__session_id', 'transcript')
    ordering = ('-submitted_at',)
    readonly_fields = ('id', 'submitted_at', 'scored_at', 'transcribed_at')
    
    fieldsets = (
        ('Task Information', {
            'fields': ('id', 'test_session', 'section', 'part_type')
        }),
        ('Audio', {
            'fields': ('audio_file', 'duration')
        }),
        ('Transcription', {
            'fields': ('transcript', 'transcribed_at')
        }),
        ('Scoring', {
            'fields': ('band_score', 'feedback', 'scoring_breakdown')
        }),
        ('Metadata', {
            'fields': ('submitted_at', 'scored_at')
        }),
    )
