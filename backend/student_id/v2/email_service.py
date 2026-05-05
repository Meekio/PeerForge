import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")

def send_email(to_email, verified):

    msg = EmailMessage()

    msg["Subject"] = "Student ID Verification Status"
    msg["From"] = EMAIL
    msg["To"] = to_email

    if verified:
        msg.set_content("Your student ID has been verified successfully.")
    else:
        msg.set_content("Your student ID verification failed.")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL, PASSWORD)
        smtp.send_message(msg)