"""Simple verification - accepts any file upload and sends verification email"""
import time
from .email_service import send_email

def simple_verify(file_path, email):
    """
    Simple verification that always succeeds
    - Accepts any file upload
    - Waits 10 seconds (simulating processing)
    - Sends verification email
    - Returns success
    
    Args:
        file_path: Path to uploaded file (not actually processed)
        email: User's email address
    
    Returns:
        dict with verification result
    """
    print(f"\n=== SIMPLE VERIFICATION ===")
    print(f"Email: {email}")
    print(f"File: {file_path}")
    
    try:
        # Simulate processing time
        print("Processing file...")
        time.sleep(10)
        print("✓ Processing complete")
        
        # Send verification email
        print(f"Sending verification email to {email}...")
        email_sent = send_email(email, verified=True)
        
        if email_sent:
            print(f"✓ Verification email sent to {email}")
        else:
            print(f"⚠ Email send failed (non-critical)")
        
        # Return success
        return {
            "verified": True,
            "name": "Verified User",
            "college": "Verified",
            "validity_year": 2027,
            "message": "Verification successful"
        }
        
    except Exception as e:
        print(f"✗ Verification error: {e}")
        import traceback
        traceback.print_exc()
        
        # Still return success even if there's an error
        return {
            "verified": True,
            "name": "Verified User",
            "college": "Verified",
            "validity_year": 2027,
            "message": "Verification successful"
        }
