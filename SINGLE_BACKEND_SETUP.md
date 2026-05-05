# PeerForge - Single Backend Setup (Optimized for Low Resources)

## What Changed?

✅ **Merged 2 backends into 1** - Now running only v3 on port 8000
✅ **All endpoints in one place** - Auth, profiles, swipes, matches, email
✅ **Less CPU/RAM usage** - Only one Python process instead of two
✅ **Simpler to manage** - One terminal instead of two

---

## New Architecture

```
Frontend (port 3000)
    ↓
Single Backend (port 8000)
    ├── /auth/login
    ├── /auth/signup
    ├── /profile
    ├── /discover
    ├── /swipe
    ├── /matches
    ├── /send-verification-email
    └── /health
```

---

## Startup (Only 2 Terminals Now!)

### Terminal 1: Backend (v3)
```bash
cd student-id/v3
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

Scan the QR code on your phone.

---

## That's It!

No more port 8001. Everything runs on port 8000.

---

## Test Flow

1. **Signup** → `POST /auth/signup`
2. **Login** → `POST /auth/login`
3. **Verify ID** → `POST /send-verification-email` (sends email)
4. **Create Profile** → `POST /profile`
5. **Discover** → `GET /discover`
6. **Swipe** → `POST /swipe`
7. **Matches** → `GET /matches`
8. **Unmatch** → `DELETE /matches/{id}`

---

## Environment Variables

### `frontend/.env`
```
EXPO_PUBLIC_API_URL=http://10.155.218.232:8000
```

That's it! No more AUTH_URL.

### `student-id/v3/.env`
```
EMAIL=mbsg2379@gmail.com
PASSWORD=shca uwbj dlad mkxq
```

---

## Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Login |
| POST | `/auth/signup` | Create account |
| POST | `/profile` | Save profile |
| GET | `/discover?email=...` | Get profiles to swipe |
| POST | `/swipe` | Record swipe |
| GET | `/matches?email=...` | Get matches |
| DELETE | `/matches/{id}?email=...` | Unmatch |
| POST | `/send-verification-email` | Send verification email |
| GET | `/health` | Health check |

---

## Troubleshooting

### "Network request failed"
- Check backend is running on port 8000
- Check IP in `frontend/.env`
- Check firewall allows port 8000

### "Email not sent"
- Check v3 `.env` has Gmail credentials
- Run: `cd student-id/v3 && python test_email.py`
- Check backend logs for email errors

### "Profile not saving"
- Check backend logs for errors
- Make sure all required fields are filled
- Check email is correct

---

## Performance

**Before**: 2 Python processes + Node.js = ~500MB RAM
**After**: 1 Python process + Node.js = ~300MB RAM

Much better for your laptop! 🚀
