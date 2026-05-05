#!/usr/bin/env python3
"""
Quick test script to verify email sending works
Run: python test_email.py
"""

from email_service import send_email
import sys

if __name__ == "__main__":
    # Test email
    test_email = "meenakshiganesanofficial@gmail.com"
    
    print("=" * 50)
    print("EMAIL SENDING TEST")
    print("=" * 50)
    print(f"Sending test email to: {test_email}")
    print()
    
    result = send_email(test_email, verified=True)
    
    print()
    print("=" * 50)
    if result:
        print("✓ TEST PASSED - Email sent successfully!")
        print("Check your inbox for the verification email")
    else:
        print("✗ TEST FAILED - Email could not be sent")
        print("Check the error messages above")
    print("=" * 50)
    
    sys.exit(0 if result else 1)
