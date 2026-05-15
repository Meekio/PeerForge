# PeerForge 🤝

**Find your perfect hackathon teammate**

PeerForge is a mobile app that helps students discover and connect with potential hackathon teammates. Swipe through profiles, match with like-minded developers, and build your dream team.

---

## ✨ Features

### 🔐 **Secure Authentication**
- Email and password signup/login
- Student ID verification using AI (Gemini Vision)
- Automated email notifications

### 👤 **Rich Profiles**
- Showcase your skills (React, Python, ML, etc.)
- Share your interests (Hackathons, Startups, AI/ML)
- Set your availability (Weekends, Evenings, Full-time)
- Add social links (GitHub, LinkedIn)
- Write a bio to stand out

### 💫 **Smart Matching**
- **Discover**: Swipe through profiles of potential teammates
- **Swipe Right**: Show interest in someone
- **Match**: When both users swipe right, it's a match!
- **Connect**: View all your matches and reach out

### 🏆 **Hackathon Browser**
- Browse upcoming hackathons
- Swipe to save interesting ones
- View details: prizes, dates, locations, tracks
- Registration deadlines and participant counts
- Direct links to register

### 📱 **Cross-Platform**
- Mobile app (iOS & Android via Expo)
- Web version available
- Seamless experience across devices

---

## 🚀 Quick Start

### For Users

1. **Download the app** (or open web version)
2. **Sign up** with your email
3. **Verify** your student ID
4. **Create your profile** - add skills, interests, and availability
5. **Start swiping** to find teammates!

### For Developers

See [ADMIN_README.md](ADMIN_README.md) for detailed setup instructions.

**Quick setup:**
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# Frontend
cd frontend
npm install
npm start
```

---

## 📖 How It Works

### 1️⃣ **Sign Up & Verify**
- Create an account with your email
- Upload your student ID (PDF or image)
- AI automatically verifies your student status
- Receive confirmation email

### 2️⃣ **Build Your Profile**
- Add your name, college, and year
- Select your technical skills
- Choose your interests
- Set your availability
- Add GitHub and LinkedIn profiles
- Write a short bio

### 3️⃣ **Discover Teammates**
- Browse profiles of other students
- See their skills, interests, and availability
- Swipe right if you'd like to team up
- Swipe left to pass

### 4️⃣ **Match & Connect**
- When both users swipe right, it's a match!
- View all your matches in the Matches tab
- Access their GitHub and LinkedIn profiles
- Reach out to form your team

### 5️⃣ **Find Hackathons**
- Browse upcoming hackathons
- See prizes, dates, and locations
- Swipe right to save interesting ones
- View all saved hackathons
- Register directly from the app

---

## 🎯 Use Cases

### **For Students**
- Find teammates for upcoming hackathons
- Connect with developers who have complementary skills
- Discover hackathons that match your interests
- Build your network in the tech community

### **For Hackathon Organizers**
- Help participants find teammates before the event
- Reduce "lone wolf" participants
- Increase team diversity and collaboration
- Improve overall hackathon experience

---

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **AI**: Google Gemini 1.5 Flash (ID verification)
- **Email**: Gmail SMTP

---

## 🤝 Contributing

We welcome contributions! Please see [ADMIN_README.md](ADMIN_README.md) for development setup and guidelines.

---

## 📄 License

MIT License - see LICENSE file for details

---

## 📧 Contact

**GitHub**: [https://github.com/Meekio/PeerForge](https://github.com/Meekio/PeerForge)

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for hackathon enthusiasts**
