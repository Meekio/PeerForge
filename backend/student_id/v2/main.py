from fastapi import FastAPI, UploadFile, File, Form
import shutil
import os

from ocr import extract_text
from parser import extract_validity_year, extract_name, extract_college
from validator import validate_id
from email_service import send_email

app = FastAPI()

os.makedirs("sample_ids", exist_ok=True)

@app.post("/verify")
async def verify(
    file: UploadFile = File(...),
    email: str = Form(...)
):
    file_path = f"sample_ids/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # handles multi-page PDFs — page 1 = front, page 2 = back
    full_text = extract_text(file_path)

    year = extract_validity_year(full_text)
    name = extract_name(full_text)
    college = extract_college(full_text)

    verified = validate_id(year)

    send_email(email, verified)

    return {
        "name": name,
        "college": college,
        "validity_year": year,
        "verified": verified
    }
