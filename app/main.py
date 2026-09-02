# - - -
# - -
# -

from pathlib import Path
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.extractors.pdf import extract_pdf
from app.extractors.docx_ex import extract_docx
from app.extractors.xlsx import extract_xlsx
from app.ai import ask_ai



app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:63342",
        "http://127.0.0.1:63342"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#------------------
#DOCUMENT
#------------------

documents = {}

#------------------
#MODELS
#------------------
class Question(BaseModel):
    question: str

@app.get("/")
def root():
    return {
        "message": "Document Analyzer API"
    }


#------------------
#UPLOAD DOCUMENT
#------------------
@app.post("/documents")
async def upload_document(file: UploadFile = File(...)):

    filename = file.filename

    if filename is None:
        raise  HTTPException(
            status_code=400,
            detail="File must have a name"
        )

    extension = Path(filename).suffix.lower()

    if extension not in [".pdf", ".docx", ".xlsx"]:
        raise HTTPException (
            status_code=400,
            detail="Unsupported file type"
        )

    UPLOAD_DIR = Path("uploads")
    UPLOAD_DIR.mkdir(exist_ok=True)

    # Guardar archivo

    file_path = UPLOAD_DIR / filename

    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)


    # Extraer texto en los formatos
    if extension == ".pdf":
        text = extract_pdf(str(file_path))
    elif extension == ".docx":
        text = extract_docx(str(file_path))
    elif extension == ".xlsx":
        text = extract_xlsx(str(file_path))

    document_id = str(uuid.uuid4())

    documents[document_id] = {
        "filename": filename,
        "extension": extension,
        "text": text
    }
    return {
        "document_id": document_id,
        "filename": filename,
        "extension": extension
    }   


@app.post("/documents/{document_id}/ask")
async def ask_document(
        document_id: str,
        data: Question
):

    # EXISTE?
    if document_id not in documents:
        raise HTTPException (
            status_code=404,
            detail="Document not found"
        )

    document = documents[document_id]


    answer = ask_ai(
        data.question,
        document["text"]
    )

    return {
        "document_id": document_id,
        "question": data.question,
        "answer": answer
    }