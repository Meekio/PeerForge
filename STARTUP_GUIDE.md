# PeerForge - Startup Guide

## Prerequisites
- Node.js installed
- Python 3.8+ installed
- Expo Go app on your phone
- Phone and computer on same WiFi (via hotspot)

## Step 1: Get Your Computer's IP

On Windows, open Command Prompt and run:
```bash
ipconfig
```

Look for "IPv4 Address" under your active connection. Example: `10.155.218.232`

## Step 2: Update Frontend Environment

Edit `frontend/.env`:
```
EXPO_PUBLIC_API_URL=http://YOUR_IP:8000
EXPO_PUBLIC_AUTH_URL=http://YOUR_IP:8001
```

Replace `YOUR_IP` with your actual IP from Step 1.

## Step 3: Start Backend (Port 8001)

Open Terminal 1:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
```

## Step 4: Start Frontend

Open Terminal 2:
```bash
cd frontend
npm start -c
```

The `-c` flag clears Expo cache to pick up new `.env` variables.

You should see a QR code in the terminal.

## Step 5: Open on Phone

1. Open Expo Go app on your phone
2. Scan the QR code from Terminal 2
3. App should load on your phone

## Step 6: Test the Flow

### Test 1: Single User
1. Signup with `user1@example.com` / `password123`
2. Upload ID (auto-verifies)
3. Create profile with name, college, skills, etc.
4. Should see "No more profiles" (no other users yet)

### Test 2: Two Users (Matching)
1. **User 1**: Signup, verify, create profile
2. **User 2**: Signup, verify, create profile
3. **User 1**: Go to Discover, should see User 2's profile
4. **User 1**: Swipe right (interested)
5. **User 2**: Go to Discover, should see User 1's profile
6. **User 2**: Swipe right (interested)
7. **Both**: Go to Matches, should see each other
8. **Either**: Click unmatch to remove

## Troubleshooting

### "Network request failed" error
- Check if backend is running on port 8001
- Verify IP address in `.env` is correct
- Make sure phone and computer are on same WiFi
- Check Windows Firewall allows port 8001

### "No profiles showing" on Discover
- Make sure at least 2 users have created profiles
- First user won't see their own profile
- Profiles only show if they haven't been swiped on yet

### Swipe not working
- Try refreshing the app (pull down on Discover screen)
- Make sure you're swiping on the card itself, not the buttons

### Profile not saving
- Check backend terminal for errors
- Make sure all required fields are filled (name, college, year)

## Test Credentials

You can use these for quick testing:
- Email: `test@example.com`
- Password: `test123`

Or create your own during signup.

## Notes

- All data is stored in-memory (resets when backend restarts)
- ID verification is auto-approved (no actual OCR check)
- Matches are mutual (both users must swipe right)
- Profiles persist until backend restarts
