import re
import pdfplumber

risk_keywords = {
    "Reputational Risk": ["negative publicity", "brand damage", "customer dissatisfaction", "misleading statements",
                          "ethical concerns", "data privacy violation", "media scrutiny", "regulatory fines",
                          "whistleblower", "fraud scandal", "corporate governance failure"],
    "Loan Amount": ["loan amount", "borrow", "total sum"],
    "Interest Rate": ["interest rate", "floating", "fixed", "variable"],
    "Repayment Terms": ["repay", "installment", "EMI", "payment schedule"],
    "Prepayment Penalties": ["prepayment", "early payment", "penalty", "late charges"],
    "Penal Interest": ["penal interest", "penalty interest", "additional charges", "delayed interest", "extra interest"],
    "Property & Collateral": ["mortgage", "pledge", "collateral", "security"],
    "Default Consequences": ["default", "bankruptcy", "foreclosure", "inability to pay"],
    "Preprocessing Charges": ["processing fee", "loan processing charge", "preprocessing charge", "application fee"]
}

risk_weights = {
    "Reputational Risk": 2,
    "Loan Amount": 4,
    "Interest Rate": 4,
    "Repayment Terms": 4,
    "Prepayment Penalties": 5,
    "Penal Interest": 3,
    "Property & Collateral": 5,
    "Default Consequences": 5,
    "Preprocessing Charges": 3
}


average_weight = sum(risk_weights.values()) / len(risk_weights)
expected_keyword_matches = 5
RISK_THRESHOLD = int(len(risk_keywords) * average_weight * expected_keyword_matches)
LOW_RISK_LIMIT = 30
MODERATE_RISK_LIMIT = 60


def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + " "
    return text.lower()

def find_relevant_sentences(text, keywords):
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', text)
    relevant_sentences = []
    for sentence in sentences:
        if any(re.search(r"\b" + re.escape(keyword) + r"\b", sentence, re.IGNORECASE) for keyword in keywords):
            relevant_sentences.append(sentence.strip())
        if len(relevant_sentences) >= 3:
            break
    return relevant_sentences

def extract_key_clauses(text):
    key_clauses = {}
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', text)
    for category, keywords in risk_keywords.items():
        for sentence in sentences:
            if any(re.search(r'\b' + re.escape(keyword) + r'\b', sentence, re.IGNORECASE) for keyword in keywords):
                key_clauses[category] = sentence.strip()
                break
    return key_clauses

def calculate_risk_score(text):
    risk_scores = {category: 0 for category in risk_keywords}
    relevant_data = {}
    for category, keywords in risk_keywords.items():
        relevant_sentences = find_relevant_sentences(text, keywords)
        relevant_data[category] = relevant_sentences
        for keyword in keywords:
            occurrences = len(re.findall(r"\b" + re.escape(keyword) + r"\b", text, re.IGNORECASE))
            risk_scores[category] += occurrences * risk_weights[category]
    total_score = sum(risk_scores.values())
    risk_percentage = min((total_score / RISK_THRESHOLD) * 100, 100)
    if risk_percentage <= LOW_RISK_LIMIT:
        risk_category = "Low Risk"
    elif risk_percentage <= MODERATE_RISK_LIMIT:
        risk_category = "Moderate Risk"
    else:
        risk_category = "High Risk"
    return risk_scores, total_score, risk_percentage, risk_category, relevant_data

def analyze_finance_risk(file_path):
    text = extract_text_from_pdf(file_path)
    risk_scores, total_score, risk_percentage, risk_category, relevant_data = calculate_risk_score(text)

    result = {
        "risk_scores": risk_scores,
        "total_score": total_score,
        "risk_percentage": risk_percentage,
        "risk_category": risk_category,
        "relevant_sentences": relevant_data
    }

    return result
