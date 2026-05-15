"""Gemini Vision-based OCR for student ID verification"""
import google.generativeai as genai
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print(f"✓ Gemini configured")
else:
    print("⚠ GEMINI_API_KEY not found in .env")

def extract_text_with_gemini(file_path):
    """
    Extract text from student ID using Gemini Vision
    Returns: dict with extracted fields or None if failed
    """
    if not GEMINI_API_KEY:
        print("✗ Gemini API key not configured")
        return None
    
    try:
        print(f"Processing {file_path} with Gemini...")
        
        # Upload file to Gemini
        uploaded_file = genai.upload_file(file_path)
        print(f"✓ File uploaded: {uploaded_file.name}")
        
        # Use Gemini 1.5 Flash (stable version)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
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
        
        # Generate response
        response = model.generate_content([uploaded_file, prompt])
        
        print(f"✓ Gemini response received")
        print(f"Response text:\n{response.text}")
        
        # Parse response
        result = parse_gemini_response(response.text)
        
        # Clean up uploaded file
        genai.delete_file(uploaded_file.name)
        print(f"✓ Cleaned up uploaded file")
        
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
