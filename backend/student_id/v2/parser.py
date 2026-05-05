import re

MONTHS = r'(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|Ma[yor]|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'

def fix_validity_year(year_str):
    digits = list(year_str)
    if digits[0] == '2' and digits[1] == '0' and digits[2] == '0':
        corrected = '2' + '0' + '2' + digits[3]
        if int(corrected) >= 2024:
            return corrected
    return year_str

def extract_validity_year(text):
    # Try to find validity line explicitly
    validity_line = None
    for line in text.splitlines():
        if re.search(r'(?:valid|vat|val|expir|card)', line, re.IGNORECASE):
            validity_line = line

    search_text = validity_line if validity_line else text

    match = re.search(MONTHS + r'[\s\-/]*(\d{4})', search_text, re.IGNORECASE)
    if match:
        return int(fix_validity_year(match.group(2)))

    years = re.findall(r'20\d{2}', search_text)
    if years:
        return int(fix_validity_year(years[-1]))

    return None


def extract_name(text):
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # Look for line after "IDENTITY CARD"
    for i, line in enumerate(lines):
        if re.search(r'identity\s*card', line, re.IGNORECASE):
            if i + 1 < len(lines):
                return lines[i + 1]

    # Fallback: find REG.NO line and return the line before it
    for i, line in enumerate(lines):
        if re.search(r'reg\.?\s*no', line, re.IGNORECASE):
            if i - 1 >= 0:
                return lines[i - 1]

    # Fallback: line containing "name" keyword
    for line in lines:
        if re.search(r'\bname\b', line, re.IGNORECASE):
            if ":" in line:
                return line.split(":", 1)[1].strip()
            return line

    return "Not Found"


def extract_college(text):
    keywords = ["university", "college", "institute"]

    best = None
    for line in text.split("\n"):
        for key in keywords:
            if key in line.lower():
                cleaned = re.sub(r'[^A-Za-z0-9\s,&.-]', '', line).strip()
                # prefer longer, cleaner matches (the actual college name line)
                if cleaned and (best is None or len(cleaned) > len(best)):
                    best = cleaned

    return best if best else "Not Found"