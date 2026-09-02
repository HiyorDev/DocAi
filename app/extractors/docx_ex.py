from docx import Document


def extract_docx(path: str) -> str:
    document = Document(path)

    text = ""

    for paragraph in document.paragraphs:
        text += paragraph.text + "\n"

    return text