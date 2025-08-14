from django.urls import path
from . import views

urlpatterns = [
    # IELTS Reading Test endpoints
    path('reading-test/', views.reading_test, name='reading_test'),
    path('submit-reading/', views.submit_reading, name='submit_reading'),
    path('start-reading-test/', views.start_reading_test, name='start_reading_test'),  # <-- Added here

    # Legacy endpoints for compatibility
    path('questions/', views.questions_list, name='questions_list'),
    path('submit/', views.submit_test, name='submit_test'),

    # End session endpoint
    path('end-session/', views.end_session, name='end_session'),
]
