# PeerForge Backend - Auth API

Simple authentication backend for PeerForge.

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

Server runs on `http://0.0.0.0:8001`

## Endpoints

- `POST /auth/login` — Login with email/password
- `POST /auth/signup` — Create new account
- `GET /health` — Health check

## Test Credentials

**Mock (no email verification):**
- Email: `demo@example.com`
- Password: `demo123`

**Real (email verification will be sent):**
- Email: `test@example.com`
- Password: `test123`

## Notes

- Uses in-memory storage (data lost on restart)
- Replace with database for production
- CORS enabled for frontend
