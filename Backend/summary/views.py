from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from .models import UploadedDocument
from .utils import (
    extract_text_from_pdf,
    extract_contract_type,
    clean_text,
    extract_key_clauses,
    generate_full_summary,
    encrypt_text,
    decrypt_text,
)


@api_view(["GET"])
def hello_world(request):
    return Response({"message": "Hello from Django!"})


@api_view(["GET"])
def get_recent_documents(request):
    username = request.GET.get("user_name")

    if not username:
        return JsonResponse({"error": "Username is required"}, status=400)

    recent_docs = UploadedDocument.objects.filter(user_name=username).order_by('-upload_date')[:3]

    documents_data = [
        {
            "id": doc.id,
            "title": doc.file_name,
            "contractType": doc.contract_type,
            "uploadDate": doc.upload_date.strftime('%Y-%m-%d %H:%M:%S'),
            "summary": doc.summary,  # directly accessible summary
        }
        for doc in recent_docs
    ]

    return JsonResponse({"recent_documents": documents_data})


@csrf_exempt
@api_view(["POST"])
def extract_text(request):
    try:
        if "file" not in request.FILES:
            return JsonResponse({"error": "No file uploaded"}, status=400)

        uploaded_file = request.FILES["file"]
        user_name = request.POST.get("user_name")

        if not uploaded_file.name.lower().endswith(".pdf"):
            return JsonResponse({"error": "Only PDF files are supported"}, status=400)

        file_path = default_storage.save(f"uploads/{uploaded_file.name}", uploaded_file)
        file_path = default_storage.path(file_path)

        with open(file_path, "rb") as pdf_file:
            extracted_text = extract_text_from_pdf(pdf_file)

        cleaned = clean_text(extracted_text)
        encrypted_cleaned = encrypt_text(cleaned)
        decrypted_cleaned = decrypt_text(encrypted_cleaned)

        summary = generate_full_summary(decrypted_cleaned)
        contract_type = extract_contract_type(cleaned)
        key_clauses = extract_key_clauses(extracted_text)

        doc = UploadedDocument.objects.create(
            user_name=user_name,
            file_name=uploaded_file.name,
            contract_type=contract_type,
            encrypted_cleaned=encrypted_cleaned,
            summary=summary,
        )

        return JsonResponse({
            "summary": summary,
            "keyClauses": key_clauses,
            "contract_type": contract_type,
            "document_id": doc.id
        })

    except Exception as e:
        print("ERROR in extract_text:", str(e))
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)


@api_view(["GET"])
def get_document_summary(request):
    document_id = request.GET.get("document_id")
    username = request.GET.get("user_name")

    if not document_id or not username:
        return JsonResponse({"error": "Document ID and user_name are required"}, status=400)

    try:
        doc = UploadedDocument.objects.get(id=document_id, user_name=username)
        decrypted_text = decrypt_text(doc.encrypted_cleaned)
        return JsonResponse({
            "summary": doc.summary,
            "keyClauses": extract_key_clauses(decrypted_text),
            "contract_type": doc.contract_type,
            "file_name": doc.file_name,
            "document_id": doc.id,
        })

    except UploadedDocument.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve summary: {str(e)}"}, status=500)


@csrf_exempt
@api_view(["POST"])
def regenerate_summary(request, document_id):
    try:
        doc = UploadedDocument.objects.get(id=document_id)

        decrypted_cleaned = decrypt_text(doc.encrypted_cleaned)

        new_summary = generate_full_summary(decrypted_cleaned)
        key_clauses = extract_key_clauses(decrypted_cleaned)

        doc.summary = new_summary
        doc.save()

        return JsonResponse({
            "summary": new_summary,
            "keyClauses": key_clauses,
        })

    except UploadedDocument.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Failed to regenerate summary: {str(e)}"}, status=500)
