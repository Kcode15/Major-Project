import pdfplumber
import re
import spacy
import base64
import torch
from transformers import BartTokenizer, BartForConditionalGeneration
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
from django.conf import settings

nlp = spacy.load("en_core_web_sm")
tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")


KEY_CLAUSES = {
    "Loan Amount": ["loan amount", "borrow from the bank", "sum stated in the schedule"],
    "Interest Rate": ["interest rate", "floating rate", "fixed rate", "default interest rate", "rate of interest on loans"],
    "Repayment Terms": ["repay", "monthly installment", "EMI"],
    "Prepayment & Penalties": ["prepayment", "early payment charges", "penalty"],
    "Property & Collateral": ["mortgage", "pledge", "property"],
    "Default Consequences": ["default", "terminate the agreement", "foreclosure"]
}



def extract_text_from_pdf(pdf_file):
    text = ""
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n\n"
    return text.strip()



def extract_contract_type(text):
    cleaned_text = re.sub(r'\s+', ' ', text[:1000])
    match = re.search(r'(?i)([A-Z\s]+(?:AGREEMENT|CONTRACT|DEED|MEMORANDUM|POLICY|LEASE|LOAN|MORTGAGE|NDA))', cleaned_text)
    return match.group(1).strip() if match else "Unknown Contract Type"

def clean_text(text):
    cleaned_lines = []
    for line in text.split("\n"):
        doc = nlp(line.strip())
        cleaned_line = " ".join([token.text for token in doc if not token.is_stop and not token.is_punct])
        cleaned_lines.append(cleaned_line)
    return "\n".join(cleaned_lines)


def extract_key_clauses(text):
    extracted_clauses = {clause: [] for clause in KEY_CLAUSES}
    text = re.sub(r'\s+', ' ', text)
    doc = nlp(text)

    for sent in doc.sents:
        sentence_text = sent.text.lower()
        for clause, keywords in KEY_CLAUSES.items():
            if any(re.search(rf'\b{re.escape(keyword)}\b', sentence_text) for keyword in keywords):
                extracted_clauses[clause].append(sent.text.strip())

    return {
        clause: '\n'.join(sentences) if sentences else "Not found"
        for clause, sentences in extracted_clauses.items()
    }


def preprocess_for_summary(text):
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:4096] 

def chunk_text(text, max_len=1024):
    sentences = text.split(". ")
    chunks = []
    chunk = ""
    for sentence in sentences:
        if len(tokenizer.encode(chunk + sentence, truncation=False)) < max_len:
            chunk += sentence + ". "
        else:
            chunks.append(chunk.strip())
            chunk = sentence + ". "
    if chunk:
        chunks.append(chunk.strip())
    return chunks


def summarize_text(text):
    text = preprocess_for_summary(text)
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=1024)
    
    with torch.no_grad():
        summary_ids = model.generate(
            inputs["input_ids"],
            max_length=200,
            num_beams=1,
            do_sample=True,
            top_k=50,
            top_p=0.9,
            temperature=0.95,
            early_stopping=True
        )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary.strip()

def format_summary(summary_text, title="Summary Section"):
    lines = summary_text.strip().split(". ")
    formatted = f"🔹 {title}\n\n"
    
    for line in lines:
        line = line.strip().capitalize()
        if not line.endswith('.'):
            line += '.'
        if len(line.split()) > 3:
            formatted += f"• {line}\n"
    return formatted.strip()

def generate_full_summary(text):
    chunks = chunk_text(text)
    summaries = [summarize_text(chunk) for chunk in chunks]
    
    formatted_summaries = []
    for i, summary in enumerate(summaries, start=1):
        formatted_summaries.append(format_summary(summary, title=f"Summary Section {i}"))
    
    return "\n\n".join(formatted_summaries)


def encrypt_text(plain_text):
    key = settings.AES_ENCRYPTION_KEY
    iv = get_random_bytes(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    encrypted = cipher.encrypt(pad(plain_text.encode(), AES.block_size))
    return base64.b64encode(iv + encrypted).decode()


def decrypt_text(encrypted_text):
    key = settings.AES_ENCRYPTION_KEY
    raw_data = base64.b64decode(encrypted_text)
    iv = raw_data[:16]
    cipher_text = raw_data[16:]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    decrypted = unpad(cipher.decrypt(cipher_text), AES.block_size)
    return decrypted.decode()