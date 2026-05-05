# PeerForge Frontend — Quick Start

## 1. Install Dependencies

```bash
cd frontend
npm install
```

## 2. Start Development Server

```bash
npm start
```

## 3. Run on Device/Emulator

- **iOS Simulator:** Press `i`
- **Android Emulator:** Press `a`
- **Web:** Press `w`

## 4. Test the App Flow

### Login
- Email: `test@example.com`
- Password: `password123`

### ID Verification
- Upload any PDF or image file (front and back)
- Status will show "Verified" after 2 seconds

### Profile Setup
- Fill in name, college, year
- Select skills, interests, availability
- Add GitHub/LinkedIn URLs (optional)
- Save profile

### Discover
- Swipe right to show interest
- Swipe left to skip
- View profile details (skills, interests, bio)

### Matches
- View matched profiles
- Click LinkedIn to open profile
- GitHub visible only after match

### Profile
- View your profile details
- Edit profile (coming soon)
- Re-verify ID (coming soon)
- Logout

## 5. File Structure

```
app/
├── (auth)/          # Login, Signup, Verify, Profile Setup
├── (app)/           # Discover, Matches, Profile (main app)
└── _layout.tsx      # Root navigation

context/
└── AuthContext.tsx  # Auth state management
```

## 6. Key Features Implemented

✅ Bottom tab navigation (Discover, Matches, Profile)
✅ Auth flow with verification and profile setup
✅ Swipe gesture on discover cards
✅ Tag-based skill/interest selection
✅ File upload for ID verification
✅ Local state persistence with AsyncStorage
✅ Dark theme UI
✅ Responsive design

## 7. Next Steps (Backend Integration)

Replace `TODO` comments with actual API calls:

1. **Login/Signup** — Connect to auth endpoints
2. **ID Verification** — Upload to backend, get verification status
3. **Profile Save** — Store profile data
4. **Discover** — Fetch profiles from backend
5. **Swipes** — Record user interactions
6. **Matches** — Fetch mutual matches

## 8. Debugging

**Hot reload not working:**
```bash
npm start -c  # Clear cache
```

**Module not found errors:**
```bash
rm -rf node_modules
npm install
```

**Navigation issues:**
- Check all `_layout.tsx` files exist
- Verify screen names match route names
- Check imports are correct

## 9. Build for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build
```

## 10. Environment Variables

Create `.env` file in `frontend/` for API endpoints:

```
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_TIMEOUT=30000
```

Access in code:
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

---

**Ready to start?** Run `npm start` and begin testing!
