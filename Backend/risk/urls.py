from django.urls import path
from .views import analyze_uploaded_document

urlpatterns = [
    path('analyze/', analyze_uploaded_document),
]