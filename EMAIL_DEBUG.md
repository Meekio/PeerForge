# Email Verification - Debugging Guide

## Quick Test

Before testing in the app, test email sending directly:

```bash
cd student-id/v3
python test_email.py
```

This will show you exactly what's happening with the email service.

---

## Step 1: Check Gmail Credentials

Your `.env` file should have:
```
EMAIL=mbsg2379@gmail.com
PASSWORD=shca uwbj dlad mkxq
```

**Important**: This is an **App Password**, not your regular Gmail password.

### If you don't have an App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Copy it to `student-id/v3/.env` as `PASSWORD=...`

---

## Step 2: Start v3 Backend

```bash
cd student-id/v3
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Watch the terminal for these messages:

```
Email service initialized with EMAIL=mbsg2379@gmail.com
```

If you see `EMAIL=None`, the `.env` file isn't being read.

---

## Step 3: Test Email Endpoint

From your phone or browser, visit:
```
http://YOUR_IP:8000/send-verification-email?email=meenakshiganesanofficial@gmail.com
```

Or use curl:
```bash
curl -X POST http://localhost:8000/send-verification-email \
  -d "email=meenakshiganesanofficial@gmail.com"
```

Watch the v3 terminal for:
```
=== VERIFICATION EMAIL ENDPOINT ===
Email: meenakshiganesanofficial@gmail.com

=== SENDING EMAIL ===
To: meenakshiganesanofficial@gmail.com
From: mbsg2379@gmail.com
Verified: True
Connecting to smtp.gmail.com:465...
Logging in as mbsg2379@gmail.com...
Sending message...
✓ Email sent successfully to meenakshiganesanofficial@gmail.com
```

---

## Step 4: Test in App

1. Start all three backends:
   - v3 on port 8000
   - Auth backend on port 8001
   - Frontend

2. Signup with your email
3. Upload ID file
4. Click "Submit for Verification"
5. Watch the frontend logs:
   ```
   Calling v3 email endpoint: http://YOUR_IP:8000/send-verification-email
   V3 email response status: 200
   V3 email response: {success: true, message: "Email sent"}
   ```

6. Check your email inbox

---

## Common Issues & Solutions

### Issue: "EMAIL or PASSWORD not set in .env"
**Solution**: 
- Make sure `student-id/v3/.env` exists
- Make sure it has both EMAIL and PASSWORD
- Restart v3 backend after editing `.env`

### Issue: "Authentication failed"
**Solution**:
- Check if you're using an App Password (not regular password)
- Generate a new App Password from https://myaccount.google.com/apppasswords
- Make sure there are no extra spaces in `.env`

### Issue: "Connection refused" or "Network error"
**Solution**:
- Make sure v3 is running on port 8000
- Check firewall allows port 8000
- Check IP address in frontend `.env`

### Issue: Email sent but not received
**Solution**:
- Check spam/junk folder
- Check if email address is correct
- Try sending to a different email address
- Check Gmail account settings allow "Less secure apps"

### Issue: "SMTP error"
**Solution**:
- This usually means Gmail rejected the login
- Double-check your App Password
- Try generating a new one

---

## Email Flow

```
Frontend (verify.tsx)
    ↓
    Calls: POST http://10.155.218.232:8000/send-verification-email
    ↓
v3 Backend (main.py)
    ↓
    Calls: send_email(email, verified=True)
    ↓
Email Service (email_service.py)
    ↓
    Connects to: smtp.gmail.com:465
    ↓
    Logs in with: mbsg2379@gmail.com / app_password
    ↓
    Sends email to: user@example.com
    ↓
Gmail
    ↓
User's Inbox
```

---

## Logs to Check

### Frontend (Expo terminal)
```
Calling v3 email endpoint: http://10.155.218.232:8000/send-verification-email
V3 email response status: 200
V3 email response: {success: true, message: "Email sent"}
```

### v3 Backend (port 8000)
```
=== VERIFICATION EMAIL ENDPOINT ===
Email: user@example.com

=== SENDING EMAIL ===
To: user@example.com
From: mbsg2379@gmail.com
Verified: True
Connecting to smtp.gmail.com:465...
Logging in as mbsg2379@gmail.com...
Sending message...
✓ Email sent successfully to user@example.com
```

---

## Quick Checklist

- [ ] v3 `.env` has EMAIL and PASSWORD
- [ ] v3 backend is running on port 8000
- [ ] Frontend `.env` has correct IP for API_URL (port 8000)
- [ ] Gmail App Password is set (not regular password)
- [ ] Firewall allows port 8000
- [ ] Test email script works: `python test_email.py`
- [ ] Email endpoint responds: `curl -X POST http://localhost:8000/send-verification-email -d "email=test@example.com"`
- [ ] Check spam folder if email doesn't arrive

---

## If Still Not Working

1. Run the test script and share the output:
   ```bash
   cd student-id/v3
   python test_email.py
   ```

2. Check v3 terminal output when verifying ID in app

3. Check frontend console logs in Expo

4. Verify Gmail credentials are correct at https://myaccount.google.com/apppasswords
