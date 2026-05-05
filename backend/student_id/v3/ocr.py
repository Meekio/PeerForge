import easyocr
from pdf2image import convert_from_path
from PIL import Image
import numpy as np

reader = easyocr.Reader(['en'], gpu=False)

CONFIDENCE_THRESHOLD = 0.5  # minimum average confidence to accept

def extract_text(file_path):
    if file_path.endswith(".pdf"):
        images = convert_from_path(file_path, dpi=300)
        full_text = ""
        for img in images:
            text, ok = _read_image(np.array(img))
            if not ok:
                return None  # signal low quality
            full_text += text + "\n"
        return full_text
    else:
        img = Image.open(file_path)
        text, ok = _read_image(np.array(img))
        return text if ok else None

def _read_image(img_array):
    results = reader.readtext(img_array, detail=1, paragraph=False)
    if not results:
        return "", False

    scores = [r[2] for r in results]
    avg_confidence = sum(scores) / len(scores)

    if avg_confidence < CONFIDENCE_THRESHOLD:
        return "", False

    text = "\n".join([r[1] for r in results])
    return text, True
