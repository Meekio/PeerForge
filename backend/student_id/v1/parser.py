import re

MONTHS = r'(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May]|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'

def fix_validity_year(year_str):
    """
    Fix OCR misread only for years that should be in the future (validity dates).
    2007 -> 2027, 2006 -> 2026, etc. Only corrects if result would be >= current year.
    """
    digits = list(year_str)
    if digits[0] == '2' and digits[1] == '0' and digits[2] == '0':
        corrected = '2' + '0' + '2' + digits[3]
        if int(corrected) >= 2026:
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
        year_str = fix_validity_year(match.group(2))
        return int(year_str)

    # Fallback: last 4-digit year in validity line or full text
    years = re.findall(r'20\d{2}', search_text)
    if years:
        return int(fix_validity_year(years[-1]))

    return None