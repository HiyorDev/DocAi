# DocAI

AI-powered document analyzer built with **Python, FastAPI and Gemini**.

DocAI allows users to upload documents and ask questions about their content through an interactive chat.

## 🚀 Features

* Upload PDF, DOCX and XLSX files
* Automatic text extraction
* Unique document IDs
* AI-powered questions and answers
* Interactive chat interface
* FastAPI REST API
* Gemini integration

## 🛠️ Tech Stack

* Python
* FastAPI
* Google Gemini API
* PyMuPDF
* python-docx
* openpyxl
* HTML
* CSS
* JavaScript

## 📂 Project Structure

```text
Peo/
├── app/
│   ├── main.py
│   ├── ai.py
│   └── extractors/
│       ├── pdf.py
│       ├── docx_ex.py
│       └── xlsx.py
├── uploads/
├── .env
├── .gitignore
└── requirements.txt
```

## ⚙️ Installation

Clone the repository and install the dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Start the FastAPI server:

```bash
python -m uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

## 💬 How it works

```text
Document
    ↓
FastAPI
    ↓
Text extraction
    ↓
Document ID
    ↓
User question
    ↓
Gemini
    ↓
AI response
```

## 🔮 Future Improvements

* RAG architecture
* Semantic search
* Vector database
* User authentication
* Conversation history
* PostgreSQL
* Docker
* Cloud deployment

## 📌 Version

**V1.0** — Basic document analysis and AI question answering.
