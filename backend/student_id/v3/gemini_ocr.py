"""Gemini Vision-based OCR for student ID verification"""
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
    print(f"✓ Gemini configured with API key: {GEMINI_API_KEY[:20]}...")
else:
    print("⚠ GEMINI_API_KEY not found in .env")
    client = None

def extract_text_with_gemini(file_path):
    """
    Extract text from student ID using Gemini Vision
    Returns: dict with extracted fields or None if failed
    """
    if not client:
        print("✗ Gemini API key not configured")
        return None
    
    try:
        print(f"Processing {file_path} with Gemini...")
        
        # Read file
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        print(f"✓ File loaded: {len(file_data)} bytes")
        
        # Prompt for structured extraction
        prompt = """
        Analyze this student ID card and extract the following information:
        
        1. Student Name
        2. College/University Name
        3. Valid Till Date (format: Month Year, e.g., "May 2027")
        
        Return the information in this exact format:
        NAME: [student name]
        COLLEGE: [college name]
        VALID_TILL: [month year]
        
        If any field is not found, write "Not Found" for that field.
        Be precise and extract exactly what you see on the ID.
        """
        
        # Determine file type
        file_ext = os.path.splitext(file_path)[1].lower()
        if file_ext == '.pdf':
            mime_type = 'application/pdf'
        elif file_ext in ['.jpg', '.jpeg']:
            mime_type = 'image/jpeg'
        elif file_ext == '.png':
            mime_type = 'image/png'
        else:
            mime_type = 'application/octet-stream'
        
        # Generate response using new API
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=file_data, mime_type=mime_type),
                prompt
            ]
        )
        
        print(f"✓ Gemini response received")
        print(f"Response text:\n{response.text}")
        
        # Parse response
        result = parse_gemini_response(response.text)
        
        return result
        
    except Exception as e:
        print(f"✗ Gemini extraction error: {e}")
        import traceback
        traceback.print_exc()
        return None

def parse_gemini_response(text):
    """Parse Gemini's structured response"""
    result = {
        "name": "Not Found",
        "college": "Not Found",
        "validity_year": None
    }
    
    lines = text.strip().split('\n')
    for line in lines:
        line = line.strip()
        if line.startswith("NAME:"):
            result["name"] = line.replace("NAME:", "").strip()
        elif line.startswith("COLLEGE:"):
            result["college"] = line.replace("COLLEGE:", "").strip()
        elif line.startswith("VALID_TILL:"):
            valid_till = line.replace("VALID_TILL:", "").strip()
            # Extract year from "Month Year" format
            parts = valid_till.split()
            if len(parts) >= 2:
                try:
                    result["validity_year"] = int(parts[-1])
                except:
                    pass
    
    print(f"Parsed result: {result}")
    return result
