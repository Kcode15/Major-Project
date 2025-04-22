import re
import pdfplumber


risk_keywords = {
    "Ownership Disputes": ["title defect", "encumbrance", "ownership dispute", "boundary issue", "title deed", "land registry"],
    "Legal & Compliance": ["zoning violation", "building code", "regulatory", "environmental compliance", "legal risk"],
    "Tenant Issues": ["tenant", "eviction", "lease termination", "rental dispute", "occupancy", "vacancy"],
    "Market Risk": ["property value drop", "market downturn", "economic slowdown", "real estate bubble"],
    "Loan & Mortgage": ["mortgage", "loan default", "foreclosure", "repayment", "interest rate", "bankruptcy"],
    "Contract Risk": ["contract breach", "litigation", "lawsuit", "termination", "arbitration"],
    "Environmental": ["contamination", "soil pollution", "hazardous material", "flood zone", "environmental hazard"],
    "Maintenance & Repairs": ["structural damage", "repair", "maintenance issue", "renovation", "plumbing", "electrical"],
    "Insurance Risk": ["underinsured", "claim", "coverage gap", "insurance policy", "natural disaster"],
    "Fraud & Misrepresentation": ["misrepresentation", "fraud", "false documentation", "fake signature"],
}


risk_weights = {
    "Ownership Disputes": 6,
    "Legal & Compliance": 5,
    "Tenant Issues": 4,
    "Market Risk": 4,
    "Loan & Mortgage": 6,
    "Contract Risk": 5,
    "Environmental": 5,
    "Maintenance & Repairs": 3,
    "Insurance Risk": 4,
    "Fraud & Misrepresentation": 6
}


average_weight = sum(risk_weights.values()) / len(risk_weights)
expected_keyword_matches = 5
RISK_THRESHOLD = int(len(risk_weights) * average_weight * expected_keyword_matches)

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.lower()


def find_relevant_sentences(text, keywords):
    sentences = re.split(r'(?<=[.?!])\s+', text)
    matched = [s.strip() for s in sentences if any(k in s for k in keywords)]
    return "; ".join(matched[:3]) if matched else "No relevant risk-related sentences found."

def analyze_real_estate_risk(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    risk_scores = {}
    relevant_data = {}
    total_score = 0

    for category, keywords in risk_keywords.items():
        keyword_count = sum(len(re.findall(r'\b' + re.escape(k) + r'\b', text)) for k in keywords)
        weighted_score = keyword_count * risk_weights[category]
        risk_scores[category] = weighted_score
        total_score += weighted_score
        relevant_data[category] = find_relevant_sentences(text, keywords)

    risk_percentage = min((total_score / RISK_THRESHOLD) * 100, 100)

    if risk_percentage <= 30:
        risk_category = "Low Risk"
    elif risk_percentage <= 60:
        risk_category = "Moderate Risk"
    else:
        risk_category = "High Risk"

 
    risk_details = [
        {
            "category": category,
            "score": risk_scores[category],
            "evidence": relevant_data[category]
        }
        for category in risk_keywords
    ]

    return {
        "risk_details": risk_details,
        "total_score": total_score,
        "risk_percentage": round(risk_percentage, 2),
        "risk_level": risk_category
    }
