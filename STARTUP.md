# PeerForge - Startup Guide

## Single Backend Setup

### Terminal 1: Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm start -c
```

Scan the QR code on your phone with Expo Go.

---

## That's It!

Everything runs on **port 8000** now.

- Backend: `http://YOUR_IP:8000`
- Frontend: Scan QR code

---

## Quick Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running
- [ ] Phone on same WiFi
- [ ] `frontend/.env` has correct IP
- [ ] `backend/student_id/v3/.env` has Gmail credentials

---

## Test Flow

1. Signup with email
2. Upload ID (auto-verifies)
3. Check email for verification
4. Create profile
5. Discover profiles
6. Swipe left/right
7. Check matches

---

## Troubleshooting

### Backend won't start
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Email not sending
```bash
cd backend/student_id/v3
python test_email.py
```

### Network error on phone
- Check IP in `frontend/.env`
- Check firewall allows port 8000
- Check phone and computer on same WiFi

---

## Project Structure

```
backend/
├── main.py                 ← Main FastAPI app (run this)
├── requirements.txt        ← All dependencies
└── student_id/             ← Student ID verification module
    ├── __init__.py
    └── v3/
        ├── __init__.py
        ├── email_service.py
        ├── ocr.py
        ├── parser.py
        ├── validator.py
        ├── .env            ← Gmail credentials
        └── test_email.py

frontend/
├── .env                    ← API_URL
├── app/
│   ├── (auth)/
│   ├── (app)/
│   └── ...
└── services/
    └── api.ts              ← API calls
```
