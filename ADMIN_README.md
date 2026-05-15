# PeerForge 🤝

**A mobile app for finding hackathon teammates based on skills, interests, and availability.**

PeerForge is a Tinder-style matching platform that helps students discover and connect with potential hackathon teammates. Swipe through profiles, match with like-minded developers, and build your dream team.

---

## 📱 Features

- **🔐 Authentication**: Secure signup/login with email and password
- **🎓 Student ID Verification**: AI-powered verification using Gemini Vision
- **📋 Profile Creation**: Showcase your skills, interests, college, and availability
- **🎯 Smart Discovery**: Browse profiles of potential teammates
- **💫 Swipe Matching**: Tinder-style interface for expressing interest
- **✨ Mutual Matches**: Connect when both users swipe right
- **💬 Match Management**: View and manage your connections
- **📧 Email Notifications**: Automated verification emails

---

## 🏗️ Tech Stack

### Frontend
- **React Native** with **Expo** (v54)
- **TypeScript** for type safety
- **Expo Router** for navigation
- **React Context API** for state management
- **AsyncStorage** for local persistence

### Backend
- **FastAPI** (Python) for REST API
- **SQLite** for database
- **Uvicorn** as ASGI server
- **CORS** enabled for cross-origin requests

### AI & Services
- **Gemini 1.5 Flash** for student ID verification (OCR)
- **Gmail SMTP** for verification emails

---

## 📂 Project Structure

```
PeerForge/
├── frontend/                 # React Native mobile app
│   ├── app/                 # Expo Router screens
│   │   ├── (auth)/         # Authentication screens (login, signup, verify)
│   │   ├── (app)/          # Main app screens (discover, matches, profile)
│   │   ├── profile-setup.tsx
│   │   └── _layout.tsx     # Root layout with conditional routing
│   ├── components/         # Reusable UI components
│   ├── context/            # React Context (Auth)
│   ├── services/           # API service layer
│   └── constants/          # Theme and constants
│
├── backend/                 # FastAPI backend
│   ├── main.py             # Main API server with all endpoints
│   ├── database.py         # SQLite connection & schema
│   ├── view_db.py          # Database viewer utility
│   ├── student_id/         # ID verification modules
│   │   └── v3/            # Latest version
│   │       ├── gemini_ocr.py      # Gemini Vision OCR
│   │       ├── email_service.py   # Email notifications
│   │       └── validator.py       # ID validation logic
│   └── peerforge.db        # SQLite database (auto-generated)
│
└── docs/                    # Documentation files
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Python** (v3.8+)
- **Expo Go** app on your mobile device
- Computer and phone on the **same WiFi network**
- **Gemini API Key** (for ID verification)

### 1. Clone the Repository

```bash
git clone https://github.com/Meekio/PeerForge.git
cd PeerForge
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create `backend/student_id/v3/.env`:
```env
# Email service (Gmail)
EMAIL=your-email@gmail.com
PASSWORD=your-gmail-app-password

# Gemini API Key for ID verification
GEMINI_API_KEY=your-gemini-api-key
```

> **Getting API Keys:**
> - **Gmail App Password**: [Create one here](https://support.google.com/accounts/answer/185833)
> - **Gemini API Key**: [Get it here](https://aistudio.google.com/apikey)

#### Database Schema

The database will be automatically created on first run with these tables:
- `users` - User accounts (email, password, verified status)
- `profiles` - User profile data (name, college, skills, interests)
- `swipes` - Swipe history (who swiped on whom)
- `matches` - Mutual matches

#### Start Backend Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

You should see:
```
✓ Gemini configured
✓ Connected to SQLite
INFO:     Uvicorn running on http://0.0.0.0:8001
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure API URL

1. Get your computer's IP address:
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **Mac/Linux**: `ifconfig` or `ip addr`

2. Create `frontend/.env`:
```env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:8001
```

Replace `YOUR_IP_ADDRESS` with your actual IP (e.g., `192.168.1.100`).

#### Start Expo Development Server

```bash
npm start
```

Or clear cache and start:
```bash
npm start -c
```

#### Open on Mobile Device

1. Install **Expo Go** from App Store/Play Store
2. Scan the QR code from your terminal
3. App will load on your phone

---

## 🎮 Usage Guide

### Creating Your First Account

1. **Signup**: Enter email and password
2. **Verify ID**: Upload student ID (PDF or images)
   - Gemini AI extracts name, college, and validity date
   - Automatic verification based on expiry date
   - Email notification sent
3. **Complete Profile**:
   - Basic info (name, college, year)
   - Skills (React, Python, ML, etc.)
   - Interests (Hackathons, Startups, etc.)
   - Availability (Weekends, Evenings, etc.)
   - Looking for (Frontend Dev, Designer, etc.)
   - Social links (GitHub, LinkedIn)
   - Bio

### Finding Teammates

1. **Discover Tab**: Browse profiles of other students
2. **Swipe Right**: Interested in teaming up
3. **Swipe Left**: Not a match
4. **Match Notification**: When both users swipe right

### Managing Matches

1. **Matches Tab**: View all your connections
2. **Profile Details**: See full profile of matched users
3. **Social Links**: Access GitHub/LinkedIn profiles
4. **Unmatch**: Remove a connection if needed

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Login to existing account

### Verification
- `POST /verify` - Verify student ID using Gemini Vision
- `POST /send-verification-email` - Send verification email

### Profile Management
- `POST /profile` - Create/update user profile
- `GET /profile?email={email}` - Get user's own profile

### Discovery & Matching
- `GET /discover?email={email}` - Get profiles to swipe on
- `POST /swipe` - Record a swipe (left/right)
- `GET /matches?email={email}` - Get user's matches
- `DELETE /matches/{matchId}?email={email}` - Unmatch

### Health Check
- `GET /health` - Server status

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    verified BOOLEAN DEFAULT 0,
    profileCompleted BOOLEAN DEFAULT 0,
    createdAt TEXT
)
```

### Profiles Table
```sql
CREATE TABLE profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    college TEXT NOT NULL,
    year INTEGER NOT NULL,
    skills TEXT,
    interests TEXT,
    availability TEXT,
    lookingFor TEXT,
    github TEXT,
    linkedin TEXT,
    bio TEXT,
    verified BOOLEAN DEFAULT 1,
    createdAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
)
```

### Swipes Table
```sql
CREATE TABLE swipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    targetId TEXT NOT NULL,
    interested BOOLEAN NOT NULL,
    createdAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE(userId, targetId)
)
```

### Matches Table
```sql
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    matchedUserId TEXT NOT NULL,
    createdAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (matchedUserId) REFERENCES users(id),
    UNIQUE(userId, matchedUserId)
)
```

---

## 🔍 Viewing Database

### Option 1: Python Script (Easiest)
```bash
cd backend
python view_db.py
```

Shows all users, profiles, swipes, and matches in a formatted view.

### Option 2: DB Browser for SQLite
1. Download from https://sqlitebrowser.org/
2. Open `backend/peerforge.db`
3. Browse tables with GUI

### Option 3: Command Line
```bash
cd backend
sqlite3 peerforge.db
.tables
SELECT * FROM users;
```

---

## 🧪 Testing

### Test with Multiple Users

1. **User 1**:
   ```
   Email: user1@test.com
   Password: pass123
   ```
   - Verify ID
   - Create profile with skills: React, Node.js
   - Set availability: Weekends

2. **User 2**:
   ```
   Email: user2@test.com
   Password: pass123
   ```
   - Verify ID
   - Create profile with skills: Python, ML
   - Set availability: Weekends

3. **Test Matching**:
   - User 1 swipes right on User 2
   - User 2 swipes right on User 1
   - Both should see each other in Matches tab

### Quick Test Flow

```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# Terminal 2: Start frontend
cd frontend
npm start -c
```

---

## 🛠️ Development

### Backend Development

```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# View API docs
# Open http://localhost:8001/docs in browser
```

### Frontend Development

```bash
cd frontend
# Install dependencies
npm install

# Start with cache clear
npm start -c

# Run on specific platform
npm run ios
npm run android
npm run web
```

### Adding New Features

1. **Backend**: Add endpoints in `backend/main.py`
2. **Frontend**: Add API calls in `frontend/services/api.ts`
3. **UI**: Create screens in `frontend/app/`
4. **State**: Update context in `frontend/context/AuthContext.tsx`

---

## 🐛 Troubleshooting

### "Network request failed"
- ✅ Check backend is running on port 8001
- ✅ Verify IP address in `frontend/.env` is correct
- ✅ Ensure phone and computer are on same WiFi
- ✅ Check firewall allows port 8001

### "No profiles showing"
- ✅ Create at least 2 user accounts with profiles
- ✅ Users won't see their own profile
- ✅ Profiles only show if not already swiped

### Swipe not working
- ✅ Try refreshing the Discover screen
- ✅ Swipe on the card itself, not buttons
- ✅ Check console for errors

### Profile not saving
- ✅ Check backend terminal for errors
- ✅ Ensure all required fields are filled
- ✅ Verify database connection

### ID verification failing
- ✅ Check Gemini API key is correct
- ✅ Ensure PDF/image is clear and readable
- ✅ Check backend logs for detailed error messages

### Email not received
- ✅ Check spam folder
- ✅ Verify Gmail credentials in `.env`
- ✅ Use App Password, not regular password

---

## 📦 Dependencies

### Backend (`backend/requirements.txt`)
```
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
python-dotenv==1.0.0
google-generativeai==0.8.6
pillow==9.5.0
```

### Frontend (`frontend/package.json`)
- React Native 0.81.5
- Expo ~54.0.33
- TypeScript ~5.9.2
- Expo Router ~6.0.23
- React Navigation 7.x

---

## 🔒 Security Notes

- **Passwords**: Currently stored in plain text (use bcrypt in production)
- **Tokens**: Simple token generation (use JWT in production)
- **CORS**: Currently allows all origins (restrict in production)
- **Environment Variables**: Never commit `.env` files
- **Database**: SQLite is for development (use PostgreSQL in production)
- **API Keys**: Keep Gemini API key secure

---

## 🚧 Recent Updates

### v1.0 (Current)
- ✅ Switched from EasyOCR to Gemini Vision for ID verification
  - 10x faster (2-3s vs 30s)
  - More accurate text extraction
  - Better handling of PDFs and low-quality images
- ✅ Fixed swipe animation issues
- ✅ Fixed unmatch functionality
- ✅ Added proper API timeouts (10s general, 60s for verification)
- ✅ Improved routing after verification
- ✅ Added database viewer utility
- ✅ Fixed all network connectivity issues

---

## 🚧 Future Enhancements

- [ ] Real-time chat between matches
- [ ] Push notifications for new matches
- [ ] Advanced filtering (by skills, college, etc.)
- [ ] Team formation (groups of 3-4)
- [ ] Hackathon event integration
- [ ] Profile pictures/avatars
- [ ] Skill endorsements
- [ ] Project showcase
- [ ] OAuth login (Google, GitHub)
- [ ] Password reset functionality
- [ ] In-app messaging

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

**Project Link**: [https://github.com/Meekio/PeerForge](https://github.com/Meekio/PeerForge)

For questions or support, please open an issue on GitHub.

---

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Mobile app powered by [Expo](https://expo.dev/)
- AI verification by [Google Gemini](https://ai.google.dev/)
- UI inspired by modern dating apps
- Icons from [Expo Vector Icons](https://icons.expo.fyi/)

---

**Made with ❤️ for hackathon enthusiasts**
