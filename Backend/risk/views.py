# views.py
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.conf import settings
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from .realEstate import  analyze_real_estate_risk
from .construction import analyze_construction_risk
from .finance import analyze_finance_risk

@csrf_exempt
@api_view(["POST"])
def analyze_uploaded_document(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        file_path = default_storage.save('uploads/' + uploaded_file.name, uploaded_file)
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)

        text = extract_text_from_pdf(full_path)

        if not text.strip():
            return JsonResponse({"error": "No readable text found in the PDF."}, status=400)

        doc_type = identify_document_type(text)

        if doc_type == "real_estate":
            risk_data = analyze_real_estate_risk(full_path)
            return JsonResponse({
                "document_type": "Real Estate",
                "risk_analysis": risk_data
            })

        elif doc_type == "construction":
            details, score, percent, category = analyze_construction_risk(full_path)
            return JsonResponse({
                "document_type": "Construction",
                "overall_score": score,
                "risk_percentage": percent,
                "risk_level": category,
                "risk_details": details
            })

        elif doc_type == "finance":
            risk_data = analyze_finance_risk(full_path)
            return JsonResponse({
                "document_type": "Finance",
                "risk_analysis": risk_data
            })

        else:
            return JsonResponse({"error": "Unable to determine document type."}, status=400)

    return JsonResponse({"error": "Invalid request or file not found."}, status=400)


def identify_document_type(text):
    real_estate_keywords = ["allotment", "property", "real estate", "lease", "tenancy", "occupancy", "mortgage", "zoning"]
    construction_keywords = ["contractor", "construction", "site", "permit", "engineering", "subcontractor", "cement", "material"]
    finance_keywords = ["loan", "interest rate", "repayment", "collateral", "bank", "finance", "credit", "borrower"]

    real_estate_hits = sum(1 for word in real_estate_keywords if word in text)
    construction_hits = sum(1 for word in construction_keywords if word in text)
    finance_hits = sum(1 for word in finance_keywords if word in text)

    hits = {
        "real_estate": real_estate_hits,
        "construction": construction_hits,
        "finance": finance_hits
    }

    return max(hits, key=hits.get)


def extract_text_from_pdf(pdf_path):
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.lower()
    except Exception as e:
        print("Error reading PDF with pdfplumber:", e)
        return ""
