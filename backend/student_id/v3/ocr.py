import easyocr
from pdf2image import convert_from_path
from PIL import Image
import numpy as np

reader = easyocr.Reader(['en'], gpu=False)

CONFIDENCE_THRESHOLD = 0.3  # minimum average confidence to accept (lowered from 0.5)

def extract_text(file_path):
    print(f"Extracting text from: {file_path}")
    if file_path.endswith(".pdf"):
        print("Converting PDF to images...")
        images = convert_from_path(file_path, dpi=300)
        print(f"Converted to {len(images)} image(s)")
        full_text = ""
        for i, img in enumerate(images):
            print(f"Processing page {i+1}...")
            text, ok, confidence = _read_image(np.array(img))
            print(f"Page {i+1} - Confidence: {confidence:.2f}, OK: {ok}")
            if not ok:
                print(f"⚠ Page {i+1} failed confidence check")
                # Don't fail completely, just skip this page
                continue
            full_text += text + "\n"
        
        if not full_text.strip():
            print("✗ No text extracted from any page")
            return None
        
        print(f"✓ Extracted {len(full_text)} characters total")
        return full_text
    else:
        img = Image.open(file_path)
        text, ok, confidence = _read_image(np.array(img))
        print(f"Image - Confidence: {confidence:.2f}, OK: {ok}")
        return text if ok else None

def _read_image(img_array):
    results = reader.readtext(img_array, detail=1, paragraph=False)
    if not results:
        print("⚠ No text detected in image")
        return "", False, 0.0

    scores = [r[2] for r in results]
    avg_confidence = sum(scores) / len(scores)
    
    print(f"Detected {len(results)} text regions, avg confidence: {avg_confidence:.2f}")

    if avg_confidence < CONFIDENCE_THRESHOLD:
        print(f"⚠ Confidence {avg_confidence:.2f} below threshold {CONFIDENCE_THRESHOLD}")
        return "", False, avg_confidence

    text = "\n".join([r[1] for r in results])
    return text, True, avg_confidence
