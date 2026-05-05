from fastapi import FastAPI, UploadFile, File
import shutil
import os

from ocr import extract_text
from parser import extract_validity_year
from validator import validate_id

app = FastAPI()

os.makedirs("sample_ids", exist_ok=True)

@app.post("/verify")

async def verify_id(file: UploadFile = File(...)):

    file_path = f"sample_ids/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_path)

    validity_year = extract_validity_year(text)
    verified = validate_id(validity_year)

    return {
        "validity_year": validity_year,
        "verified": verified
    }