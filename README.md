# PeerForge 🤝

**A mobile app for finding hackathon teammates based on skills, interests, and availability.**

PeerForge is a Tinder-style matching platform that helps students discover and connect with potential hackathon teammates. Swipe through profiles, match with like-minded developers, and build your dream team.

---

## 📱 Features

- **🔐 Authentication**: Secure signup/login with email verification
- **📋 Profile Creation**: Showcase your skills, interests, college, and availability
- **🎯 Smart Discovery**: Browse profiles of potential teammates
- **💫 Swipe Matching**: Tinder-style interface for expressing interest
- **✨ Mutual Matches**: Connect when both users swipe right
- **💬 Match Management**: View and manage your connections
- **🎓 Student Verification**: ID verification system (optional)

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

### Additional Services
- **Email Service** (Gmail SMTP) for verification emails
- **OCR Module** (EasyOCR) for student ID verification

---

## 📂 Project Structure

```
PeerForge/
├── frontend/                 # React Native mobile app
│   ├── app/                 # Expo Router screens
│   │   ├── (auth)/         # Authentication screens
│   │   ├── (app)/          # Main app screens
│   │   └── _layout.tsx     # Root layout
│   ├── components/         # Reusable UI components
│   ├── context/            # React Context (Auth)
│   ├── services/           # API service layer
│   └── constants/          # Theme and constants
│
├── backend/                 # FastAPI backend
│   ├── main.py             # Main API server
│   ├── database.py         # SQLite connection & schema
│   ├── student_id/         # ID verification modules
│   │   └── v3/            # Latest version
│   │       ├── email_service.py
│   │       ├── ocr.py
│   │       ├── parser.py
│   │       └── validator.py
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

Create `backend/.env`:
```env
# SQLite is used by default - no configuration needed
```

For email verification (optional), create `backend/student_id/v3/.env`:
```env
EMAIL=your-email@gmail.com
PASSWORD=your-app-password
```

> **Note**: Use Gmail App Password, not your regular password. [Learn how to create one](https://support.google.com/accounts/answer/185833).

#### Initialize Database

The database will be automatically created on first run. Tables include:
- `users` - User accounts
- `profiles` - User profile data
- `swipes` - Swipe history
- `matches` - Mutual matches

#### Start Backend Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
✓ Connected to SQLite
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
2. **Verify ID** (optional): Upload student ID for verification
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
3. **Unmatch**: Remove a connection if needed

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Login to existing account

### Profile Management
- `POST /profile` - Create/update user profile
- `GET /profile?email={email}` - Get user's own profile

### Discovery & Matching
- `GET /discover?email={email}` - Get profiles to swipe on
- `POST /swipe` - Record a swipe (left/right)
- `GET /matches?email={email}` - Get user's matches
- `DELETE /matches/{matchId}?email={email}` - Unmatch

### Verification
- `POST /send-verification-email` - Send verification email

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

## 🧪 Testing

### Test with Multiple Users

1. **User 1**:
   ```
   Email: user1@test.com
   Password: pass123
   ```
   - Create profile with skills: React, Node.js
   - Set availability: Weekends

2. **User 2**:
   ```
   Email: user2@test.com
   Password: pass123
   ```
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

### Email verification not working
- ✅ Check Gmail credentials in `.env`
- ✅ Use App Password, not regular password
- ✅ Enable "Less secure app access" if needed

---

## 📦 Dependencies

### Backend (`backend/requirements.txt`)
```
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
easyocr==1.7.0
opencv-python==4.8.1.78
pillow==10.1.0
python-dotenv==1.0.0
spacy==3.7.2
pymongo==4.6.0
motor==3.3.2
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
- UI inspired by modern dating apps
- Icons from [Expo Vector Icons](https://icons.expo.fyi/)

---

**Made with ❤️ for hackathon enthusiasts**
