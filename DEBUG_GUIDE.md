# PeerForge - Debugging Guide

## Issue 1: Email Not Sent

### Root Cause
The email endpoint needs v3 backend running on port 8000.

### Fix
1. **Start v3 backend** (in a separate terminal):
```bash
cd student-id/v3
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Check v3 is running**:
   - Open browser: `http://localhost:8000/docs`
   - Should see FastAPI docs

3. **Check backend logs** when verifying ID:
   - Should see: `Sending verification email to {email}`
   - Should see: `Attempting to connect to v3 at http://localhost:8000/send-verification-email`
   - Should see: `V3 response status: 200`

### If Email Still Doesn't Send
- Check v3 `.env` has Gmail credentials:
  ```
  EMAIL=mbsg2379@gmail.com
  PASSWORD=shca uwbj dlad mkxq
  ```
- Check Gmail allows "Less secure apps" or use App Password
- Check backend terminal for error messages

---

## Issue 2: Profile Not Saved

### Root Cause
Profile endpoint was calling wrong port (8000 instead of 8001).

### Fix Applied
- Updated `frontend/services/api.ts` to call `AUTH_URL` (port 8001) for profile endpoints
- Added console logging to track the request

### Verify It's Working
1. **Check frontend logs** when saving profile:
   - Should see: `Saving profile to: http://YOUR_IP:8001/profile`
   - Should see: `Save profile response status: 200`

2. **Check backend logs** (port 8001):
   - Should see: `Saving profile for {email}`
   - Should see: `Profile saved for {email}`

3. **Test Flow**:
   - Signup with new email
   - Verify ID
   - Fill profile form
   - Click "Save Profile"
   - Should redirect to Discover

---

## Issue 3: Swipe Not Working on Other Cards

### Root Cause
The gesture responder might not be properly handling multiple cards. The PanResponder is created once but needs to work with changing card data.

### Debugging Steps

1. **Check frontend logs** when swiping:
   - Should see: `Interested in: {name}` or `Skipped: {name}`
   - Should see: `Recording swipe to: http://YOUR_IP:8001/swipe`

2. **Check backend logs** (port 8001):
   - Should see: `Recording swipe: {email} -> {targetId} (interested: {interested})`

3. **Test Swipe**:
   - Load Discover screen
   - Try swiping on first card (should work)
   - Try swiping on second card (should work)
   - Try swiping on third card (should work)

### If Swipe Still Doesn't Work
- Try tapping the buttons instead of swiping:
  - Red X button = skip (left swipe)
  - Pink heart button = interested (right swipe)
- If buttons work but swipe doesn't, it's a gesture responder issue

---

## Complete Testing Checklist

### Setup
- [ ] v3 backend running on port 8000
- [ ] Auth backend running on port 8001
- [ ] Frontend running with correct `.env`
- [ ] Phone connected to same WiFi

### Test 1: Email Verification
- [ ] Signup with email
- [ ] Upload ID file
- [ ] See "Verified" popup
- [ ] Check email inbox for verification email
- [ ] Email should say "Your student ID has been verified successfully"

### Test 2: Profile Save
- [ ] After verification, fill profile form
- [ ] Select skills, interests, availability
- [ ] Fill social links (optional)
- [ ] Click "Save Profile"
- [ ] Should redirect to Discover
- [ ] Check backend logs for "Profile saved"

### Test 3: Swipe Functionality
- [ ] On Discover screen, see first profile
- [ ] Try swiping left (skip) - should move to next card
- [ ] Try swiping right (interested) - should move to next card
- [ ] Try using buttons instead of swipe
- [ ] Check backend logs for swipe records

### Test 4: Multi-User Matching
- [ ] Create User 1 profile
- [ ] Create User 2 profile (different email)
- [ ] User 1 swipes right on User 2
- [ ] User 2 swipes right on User 1
- [ ] Both should see each other in Matches
- [ ] Should be able to unmatch

---

## Common Errors & Solutions

### "Network request failed"
- Check if backend is running
- Check IP address in `.env`
- Check firewall allows ports 8000 and 8001

### "User not found"
- Make sure you're logged in
- Check email is correct
- Try logging out and back in

### "Profile save failed"
- Check backend is running on port 8001
- Check all required fields are filled
- Check backend logs for errors

### "Swipe failed"
- Check backend is running
- Check email is correct
- Try refreshing the app

---

## Logs to Check

### Frontend (Expo terminal)
```
Saving profile to: http://10.155.218.232:8001/profile
Save profile response status: 200
Recording swipe to: http://10.155.218.232:8001/swipe
```

### Backend (port 8001)
```
Saving profile for user@example.com
Profile saved for user@example.com
Recording swipe: user@example.com -> 2 (interested: True)
```

### v3 Backend (port 8000)
```
Sending verification email to user@example.com
Email sent to user@example.com
```

---

## Quick Restart

If something breaks, restart everything:

```bash
# Terminal 1
cd student-id/v3
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# Terminal 3
cd frontend
npm start -c
```

Then scan the QR code again on your phone.
