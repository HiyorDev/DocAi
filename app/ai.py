from google import genai
import os
from dotenv import load_dotenv


load_dotenv()


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def ask_ai(
        question: str,
        document_text: str

        ) -> str:

    prompt = f"""
You are an AI assistant that analyzes documents.

DOCUMENT:
{document_text}

USER QUESTION:
{question}

Answer the user's question using the information from the document.

If the answer cannot be found in the document, say that you cannot find the answer in the document.
"""

    response = client.interactions.create(
        model="gemini-3.7-flash",
        input=prompt
    )

    return response.output_text