from django.urls import path
from .views import hello_world, extract_text,get_recent_documents,get_document_summary,regenerate_summary

urlpatterns = [
    path('hello/', hello_world),  
    path('extract-text/', extract_text),  
    path('recent-document/',get_recent_documents),
    path('document-summary/',get_document_summary),
    path('regenerate-summary/<int:document_id>/', regenerate_summary),

]
