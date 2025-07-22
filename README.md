# LegalSutra Project

LegalSutra is a smart legal document analysis tool designed to simplify and automate the review of contracts and legal texts. It leverages NLP and machine learning to summarize documents, extract key clauses, and assess potential risks. The project supports PDF uploads, provides an intuitive UI, and ensures data security through encryption.

## Features of LegalSutra
- PDF text extraction  
- Contract summarization using transformers  
- Clause and risk identification  
- Secure storage with AES encryption CBC mode
- Modern React(Vite) + Django fullstack architecture  

## Installation

(Optional) First, create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
### Then install the required Python packages:
```bash
pip install django
pip install pdfplumber
pip install spacy
python -m spacy download en_core_web_sm
pip install transformers
pip install pycryptodome
```

### Running the Project

#### Run Backend (Django)
Navigate to the Backend directory and run:
```
cd Backend
python manage.py runserver
```

#### Run Frontend (React + Vite)
```bash
cd Frontend
npm install
npm run dev
```
### Team Members:
- [Khushi Mantri](https://github.com/kcode15)
- [Rashi Potey](https://github.com/Rashipotey)
- [Shinosha Jain](https://github.com/srj2005)
- [Sunidhi Admane](https://github.com/sunidhi09062004)
