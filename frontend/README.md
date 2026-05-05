# PeerForge Frontend

A React Native mobile app for discovering and connecting with student teammates. Built with Expo and Expo Router for seamless navigation.

## Features

- **Authentication** — Login/Signup with email and password
- **ID Verification** — Upload and verify student ID (front & back)
- **Profile Setup** — Complete profile with skills, interests, availability, and social links
- **Discover** — Swipe through profiles to find teammates (card-based UI with gesture support)
- **Matches** — View mutual matches and access LinkedIn/GitHub profiles
- **Profile** — View and manage your profile, verification status, and logout

## Project Structure

```
frontend/
├── app/
│   ├── _layout.tsx              # Root layout with auth provider
│   ├── (auth)/                  # Auth flow screens
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── verify.tsx           # ID verification
│   │   └── profile-setup.tsx    # Profile completion
│   └── (app)/                   # Main app screens (tab navigation)
│       ├── _layout.tsx          # Tab navigator
│       ├── discover.tsx         # Swipe cards
│       ├── matches.tsx          # Matched profiles
│       └── profile.tsx          # User profile
├── context/
│   └── AuthContext.tsx          # Auth state management
├── app.json                     # Expo config
└── package.json
```

## Navigation Flow

```
Login/Signup
    ↓
ID Verification (if not verified)
    ↓
Profile Setup (if profile not completed)
    ↓
Discover (Main App)
    ├── Discover (Swipe)
    ├── Matches
    └── Profile
```

## Tech Stack

- **React Native** — Cross-platform mobile framework
- **Expo** — Development platform and build service
- **Expo Router** — File-based routing (similar to Next.js)
- **AsyncStorage** — Local data persistence
- **Expo Document Picker** — File upload for ID verification
- **Ionicons** — Icon library

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
cd frontend
npm install
```

### Running the App

**Development:**
```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web

**Build for production:**
```bash
eas build --platform ios
eas build --platform android
```

## Key Components

### AuthContext
Manages user authentication state and persistence using AsyncStorage. Provides:
- `user` — Current user object
- `login()` — Login with email/password
- `signup()` — Create new account
- `logout()` — Clear session
- `updateVerification()` — Update verification status
- `updateProfile()` — Update profile completion status

### Screens

#### Login/Signup
- Email and password inputs
- Form validation
- Error handling
- Link between login and signup

#### ID Verification
- Upload front and back ID (PDF or image)
- File preview
- Status indicators (pending/verified/rejected)
- Automatic navigation to profile setup on success

#### Profile Setup
- Basic info (name, college, year)
- Skills selection (tag-based)
- Interests selection
- Availability options
- Looking for roles
- Social links (GitHub, LinkedIn)
- Bio text area
- Form validation and save

#### Discover
- Card-based profile display
- Swipe gestures (left = skip, right = interested)
- Profile info: name, college, skills, interests, bio
- Verification badge
- Progress counter
- Empty state when no more profiles

#### Matches
- List of mutual matches
- Match timestamp
- Skills display
- LinkedIn button (always visible)
- GitHub button (visible only after match)
- Empty state

#### Profile
- User profile display
- Verification status badge
- Skills and interests
- Social links
- Edit profile button
- Re-verify ID button
- Logout button

## Styling

- **Dark theme** — `#0f0f0f` background, `#1a1a1a` cards
- **Primary color** — `#6366f1` (indigo)
- **Success color** — `#10b981` (green)
- **Error color** — `#ef4444` (red)
- **Rounded corners** — 12-16px border radius
- **Soft shadows** — Subtle elevation effects

## State Management

Currently using React Context for auth state. For scaling, consider:
- Redux Toolkit
- Zustand
- Jotai

## API Integration

All API calls are marked with `TODO` comments. Backend endpoints needed:

- `POST /auth/login` — User login
- `POST /auth/signup` — User registration
- `POST /verify` — ID verification (upload front/back)
- `POST /profile` — Save user profile
- `GET /discover` — Get profiles to swipe
- `POST /swipe` — Record swipe (interested/skip)
- `GET /matches` — Get matched profiles
- `GET /profile` — Get current user profile

## Future Enhancements

- [ ] Image upload for profile picture
- [ ] Real-time notifications for matches
- [ ] In-app messaging (optional)
- [ ] Advanced filters on discover
- [ ] Profile editing
- [ ] Undo last swipe
- [ ] Block/report users
- [ ] Analytics and insights

## Troubleshooting

**Blank screen on startup:**
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Navigation not working:**
- Ensure all screen files are in correct folders
- Check `_layout.tsx` files are properly configured

**AsyncStorage not persisting:**
- On Android, may need to request permissions
- On web, uses localStorage instead

## Contributing

- Follow the existing code style
- Use TypeScript for type safety
- Keep components focused and reusable
- Add comments for complex logic

## License

MIT
