# PeerForge - Quick Start (5 Minutes)

## 1. Get IP Address
```bash
ipconfig
# Copy your IPv4 Address (e.g., 10.155.218.232)
```

## 2. Update `.env`
Edit `frontend/.env`:
```
EXPO_PUBLIC_API_URL=http://10.155.218.232:8000
EXPO_PUBLIC_AUTH_URL=http://10.155.218.232:8001
```

## 3. Start Backend (Terminal 1)
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

## 4. Start Frontend (Terminal 2)
```bash
cd frontend
npm start -c
```

## 5. Scan QR Code
- Open Expo Go on phone
- Scan QR code from Terminal 2

## 6. Test Flow

**User 1:**
- Signup: `user1@test.com` / `pass123`
- Upload ID (auto-verifies)
- Create profile (name, college, year, skills)
- Go to Discover → should see "No more profiles"

**User 2 (same phone, different account):**
- Logout (if needed)
- Signup: `user2@test.com` / `pass123`
- Upload ID (auto-verifies)
- Create profile
- Go to Discover → should see User 1's profile
- Swipe right

**User 1:**
- Refresh Discover
- Should see User 2's profile
- Swipe right
- Go to Matches → should see User 2

**Both:**
- Go to Matches → should see each other
- Click unmatch to remove

## Key Features

✅ Auto-verify ID (no backend call)
✅ Swipe works on all cards (fixed gesture issue)
✅ Profiles persist across sessions
✅ Mutual matching system
✅ Unmatch functionality
✅ Multi-user support

## Backend Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Login |
| POST | `/auth/signup` | Create account |
| POST | `/profile` | Save profile |
| GET | `/discover?email=...` | Get profiles to swipe |
| POST | `/swipe` | Record swipe |
| GET | `/matches?email=...` | Get matches |
| DELETE | `/matches/{id}?email=...` | Unmatch |

## Notes

- All data is in-memory (resets on backend restart)
- Use email as identifier (not token)
- Profiles only show if not already swiped
- Matches require mutual swipes
