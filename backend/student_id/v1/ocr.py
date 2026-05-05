import pytesseract
from PIL import Image, ImageFilter, ImageEnhance
from pdf2image import convert_from_path

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def preprocess(img):
    # scale up for better OCR accuracy
    w, h = img.size
    img = img.resize((w * 2, h * 2), Image.LANCZOS)
    # sharpen and increase contrast
    img = img.filter(ImageFilter.SHARPEN)
    img = ImageEnhance.Contrast(img).enhance(2.0)
    return img

def extract_text(file_path):

    if file_path.endswith(".pdf"):
        images = convert_from_path(file_path, dpi=300)
        text = ""

        for img in images:
            img = preprocess(img)
            text += pytesseract.image_to_string(img, config="--psm 6")

        return text

    else:
        image = Image.open(file_path)
        image = preprocess(image)
        text = pytesseract.image_to_string(image, config="--psm 6")
        return text