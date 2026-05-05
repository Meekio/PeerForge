# Student ID Verification — v3

## Methodology

v3 uses **EasyOCR** for text extraction and **spaCy NER** for field parsing, making it more robust than v1/v2 which relied on Tesseract.

### Step-by-step flow

```
PDF/Image upload
      ↓
EasyOCR extracts all text (ocr.py)
      ↓
spaCy NER + Regex parses fields (parser.py)
      ↓
Validator checks expiry year (validator.py)
      ↓
Email sent with result (email_service.py)
      ↓
JSON response returned
```

---

## Technologies Used

### EasyOCR
- Deep learning-based OCR engine built on PyTorch
- Handles faint text, varied fonts, and low-contrast images better than Tesseract
- Runs on CPU (slower) or GPU (faster); v3 uses CPU by default
- PDFs are converted to images at 300 DPI before being passed to EasyOCR for best accuracy

### spaCy (`en_core_web_sm`)
- NLP library used for Named Entity Recognition (NER)
- Identifies `ORG` entities to extract the college name
- Only accepts ORG entities that contain keywords like `college`, `engineering`, `university` to avoid false matches (e.g. address tokens)
- Lightweight model (~12MB), no training required

### Regex
- Used as a fallback when spaCy misses fields
- Extracts validity year by searching for month+year patterns near keywords like `valid`, `valid till`, `expiry`
- `fix_validity_year()` corrects common OCR misreads (e.g. `2007` → `2027`)
- `is_valid_year()` filters out garbage values — only accepts years between 2020–2040

---

## Files

### `main.py`
FastAPI entry point. Accepts a single PDF upload and an email address via a `POST /verify` endpoint. Saves the file, runs the pipeline, and returns the extracted fields + verification result.

### `ocr.py`
Handles text extraction. Converts PDFs to images (300 DPI) using `pdf2image`, then passes each page to EasyOCR. Also supports direct image uploads (JPG, PNG).

### `parser.py`
Extracts three fields from the raw OCR text:
- **Name** — finds the line immediately before `REG.NO` (reliable anchor on most college IDs)
- **College** — uses spaCy NER for ORG entities filtered by college keywords; falls back to line scan
- **Validity year** — searches the line containing `valid`/`expiry` keywords first, then applies regex and OCR correction logic

### `validator.py`
Compares the extracted validity year against the current year. Returns `true` if the ID is still valid, `false` if expired or year not found.

### `email_service.py`
Sends a verification result email to the user via Gmail SMTP (SSL, port 465). Credentials are loaded from `.env` using `python-dotenv`. Requires a Gmail App Password — not your regular account password.

### `.env`
Stores Gmail credentials. Never commit this file.
```
EMAIL=your@gmail.com
PASSWORD=your_app_password
```

---

## Setup

```bash
pip install fastapi uvicorn easyocr spacy pdf2image pillow python-multipart python-dotenv
python -m spacy download en_core_web_sm
```

## Run

```bash
cd student-id/v3
uvicorn main:app --reload
```

Then open `http://127.0.0.1:8000/docs` to test via Swagger UI.

## Response

```json
{
  "name": "MEENAKSHI G",
  "college": "RAJALAKSHMI ENGINEERING COLLEGE",
  "validity_year": 2027,
  "verified": true
}
```
