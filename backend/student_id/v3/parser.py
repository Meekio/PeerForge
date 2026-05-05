import re
import spacy

nlp = spacy.load("en_core_web_sm")

MONTHS = r'(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|Ma[yor]|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'

COLLEGE_KEYWORDS = ['university', 'college', 'institute', 'engineering', 'polytechnic', 'academy']

def fix_validity_year(year_str):
    digits = list(year_str)
    if digits[0] == '2' and digits[1] == '0' and digits[2] == '0':
        corrected = '20' + '2' + digits[3]
        if int(corrected) >= 2026:
            return corrected
    return year_str

def is_valid_year(y):
    return 2026 <= y <= 2040

def extract_fields(text):
    doc = nlp(text)

    college = None
    validity_year = None

    # college: prefer ORG entities that contain college keywords
    for ent in doc.ents:
        if ent.label_ == "ORG":
            if any(kw in ent.text.lower() for kw in COLLEGE_KEYWORDS):
                college = ent.text.strip()
                break

    # fallback: scan lines directly for college keywords
    if college is None:
        for line in text.splitlines():
            if any(kw in line.lower() for kw in COLLEGE_KEYWORDS):
                cleaned = re.sub(r'[^A-Za-z0-9\s,&.-]', '', line).strip()
                if cleaned and len(cleaned) > len(college or ''):
                    college = cleaned

    # validity year: look in validity line first
    validity_line = None
    for line in text.splitlines():
        if re.search(r'(?:valid|vat|val|expir|card)', line, re.IGNORECASE):
            validity_line = line

    search_text = validity_line if validity_line else text
    match = re.search(MONTHS + r'[\s\-/]*(\d{4})', search_text, re.IGNORECASE)
    if match:
        validity_year = int(fix_validity_year(match.group(2)))
    else:
        # find all 4-digit numbers that look like valid years
        candidates = [int(y) for y in re.findall(r'\d{4}', search_text) if is_valid_year(int(y))]
        if candidates:
            validity_year = max(candidates)

    # name: line just before REG.NO
    name = None
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for i, line in enumerate(lines):
        if re.search(r'reg\.?\s*no', line, re.IGNORECASE) and i - 1 >= 0:
            name = lines[i - 1]
            break

    return {
        "name": name or "Not Found",
        "college": college or "Not Found",
        "validity_year": validity_year
    }
