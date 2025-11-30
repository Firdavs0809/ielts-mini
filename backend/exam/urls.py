"""
URL configuration for exam app
"""
from django.urls import path
from . import views

urlpatterns = [
    # Exam session endpoints
    path('exam/start', views.start_exam, name='start_exam'),
    path('exam/submit-answer', views.submit_answer_view, name='submit_answer'),
    path('exam/finish', views.finish_exam, name='finish_exam'),
    path('exam/result/<str:session_id>', views.exam_result, name='exam_result'),
    
    # Listening audio endpoint
    path('exam/listening/audio/<str:audio_id>', views.listening_audio, name='listening_audio'),
    
    # Writing and Speaking submission endpoints
    path('exam/submit-writing', views.submit_writing_task, name='submit_writing'),
    path('exam/submit-speaking', views.submit_speaking_task, name='submit_speaking'),
    
    # Admin endpoints
    path('admin/upload-passage', views.admin_upload_passage, name='admin_upload_passage'),
    path('admin/create-question', views.admin_create_question, name='admin_create_question'),
]
