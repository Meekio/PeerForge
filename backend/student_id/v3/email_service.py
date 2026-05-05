import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")

print(f"Email service initialized with EMAIL={EMAIL}")

def send_email(to_email, verified):
    print(f"\n=== SENDING EMAIL ===")
    print(f"To: {to_email}")
    print(f"From: {EMAIL}")
    print(f"Verified: {verified}")
    
    if not EMAIL or not PASSWORD:
        print("ERROR: EMAIL or PASSWORD not set in .env")
        return False
    
    try:
        msg = EmailMessage()
        msg["Subject"] = "Student ID Verification Status"
        msg["From"] = EMAIL
        msg["To"] = to_email

        if verified:
            msg.set_content("Your student ID has been verified successfully.")
        else:
            msg.set_content("Your student ID verification failed.")

        print(f"Connecting to smtp.gmail.com:465...")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            print(f"Logging in as {EMAIL}...")
            smtp.login(EMAIL, PASSWORD)
            print(f"Sending message...")
            smtp.send_message(msg)
        
        print(f"✓ Email sent successfully to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"✗ Authentication failed: {e}")
        print(f"  Check your Gmail credentials in .env")
        return False
    except smtplib.SMTPException as e:
        print(f"✗ SMTP error: {e}")
        return False
    except Exception as e:
        print(f"✗ Email send failed: {e}")
        print(f"  Error type: {type(e).__name__}")
        return False
