import pymupdf

def extract_pdf(path: str) -> str:

    doc = pymupdf.open(path)

    text = ""

    for page in doc:

        text += page.get_text()

    doc.close()

    return text