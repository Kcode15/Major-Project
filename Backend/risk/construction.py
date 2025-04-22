# construction_module.py
import re
import pdfplumber

risk_categories = {
    "Leadership & Organizational": ["mismanagement", "lack of planning", "delays", "decision failure", "poor execution",
                                    "inefficiency", "lack of bidding competition", "complaint from neighborhood"],
    "Contractual": ["breach of contract", "dispute", "legal issues", "arbitration", "claims", "project termination",
                    "bidding time", "buy america compliance"],
    "Physical": ["accident", "injury", "damage", "collapse", "hazard", "unsafe conditions",
                 "soil condition", "unexpected underground conditions", "increased slope"],
    "Logistics": ["supply chain", "transport delay", "material shortage", "delivery failure",
                  "higher transportation expenses", "material issues"],
    "Environmental": ["earthquake", "flood", "storm", "fire", "natural disaster", "extreme weather",
                      "environmental issues", "unexpected weather conditions"],
    "Financial & Economic": ["budget overrun", "cost increase", "funding issues", "financial instability",
                             "lack of funding"],
    "Socio-Political & Legal": ["government regulation", "policy change", "political unrest", "lawsuit",
                                "neighborhood complaints", "policy compliance"],
    "Design & Technical": ["design flaw", "engineering issue", "technical failure", "specification error",
                           "high project complexity", "omissions and errors in design"],
    "Insurance & Indemnity": ["liability", "insurance coverage", "indemnity", "claim payment", "coverage limits"],
    "Subcontractor Risks": ["subcontractor", "subcontract", "third-party", "outsourcing", "vendor compliance"],
    "Communication & Documentation": ["reporting", "communication breakdown", "documentation error", "notice"],
    "Safety & Compliance": ["safety standards", "OSHA", "compliance failure", "violation", "non-compliance"],
    "Permits & Approvals": ["permit", "approval", "regulatory compliance", "inspection failure", "zoning approval"],
    "Human Resources": ["labor shortage", "employee dispute", "workforce", "training gaps", "labor union"],
    "Equipment & Machinery": ["equipment failure", "maintenance", "machinery breakdown", "repair delay"],
    "Procurement & Vendor Management": ["vendor reliability", "procurement delay", "supplier default", "sourcing issues", "vendor performance"],
    "Environmental Compliance": ["environmental violation", "pollution", "hazardous waste", "non-compliance", "ecological impact"],
}

risk_weights = {
    "Leadership & Organizational": 5,
    "Contractual": 4,
    "Physical": 6,
    "Logistics": 3,
    "Environmental": 7,
    "Financial & Economic": 5,
    "Socio-Political & Legal": 4,
    "Design & Technical": 6,
    "Insurance & Indemnity": 4,
    "Subcontractor Risks": 3,
    "Communication & Documentation": 3,
    "Safety & Compliance": 5,
    "Permits & Approvals": 4,
    "Human Resources": 3,
    "Equipment & Machinery": 4,
    "Procurement & Vendor Management": 4,
    "Environmental Compliance": 5,
}

average_weight = sum(risk_weights.values()) / len(risk_weights)
expected_keyword_matches = 5
RISK_THRESHOLD = int(len(risk_weights) * average_weight * expected_keyword_matches)
LOW_RISK_LIMIT = 30
MODERATE_RISK_LIMIT = 60

average_weight = sum(risk_weights.values()) / len(risk_weights)
expected_keyword_matches = 5
RISK_THRESHOLD = int(len(risk_weights) * average_weight * expected_keyword_matches)
LOW_RISK_LIMIT = 30
MODERATE_RISK_LIMIT = 60


def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text.lower()

def extract_relevant_sentences(text, keywords):
    sentences = re.split(r'(?<=[.?!])\s+', text)
    matched = [s.strip() for s in sentences if any(k in s for k in keywords)]
    return "; ".join(matched[:3]) if matched else "No relevant text found."


def analyze_construction_risk(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    risk_scores = {}
    risk_details = []
    total_score = 0

    for category, keywords in risk_categories.items():
        keyword_hits = sum(len(re.findall(r'\b' + re.escape(k) + r'\b', text)) for k in keywords)
        weighted_score = keyword_hits * risk_weights[category]
        relevant_text = extract_relevant_sentences(text, keywords)

        risk_scores[category] = weighted_score
        total_score += weighted_score

        risk_details.append({
            "category": category,
            "score": weighted_score,
            "evidence": relevant_text
        })

    risk_percentage = min((total_score / RISK_THRESHOLD) * 100, 100)

    if risk_percentage <= LOW_RISK_LIMIT:
        risk_level = "Low Risk"
    elif risk_percentage <= MODERATE_RISK_LIMIT:
        risk_level = "Moderate Risk"
    else:
        risk_level = "High Risk"

    return {
        "risk_details": risk_details,
        "total_score": total_score,
        "risk_percentage": round(risk_percentage, 2),
        "risk_level": risk_level
    }