# PeerForge 🚀

PeerForge is a full-stack teammate discovery platform tailored for university students and developers. It features a Tinder-like swiping mechanic to help software engineers, designers, and AI researchers find matching skillsets for hackathons and group projects.

---

## 📂 Folder Structure & Logic Overview

The application is structured into three main microservices:

### 1. `/mobile` (React Native / Expo Frontend)
This folder contains the complete User Interface for Android, iOS, and Web.

- **`App.js`**: The root entry point of the React Native application. It wraps the app in a `SafeAreaProvider` to handle notches on modern phones.
- **`src/navigation/AppNavigator.js`**: Manages the routing logic. It defines an `AuthStack` (Login/Register screens) that is active when the user is logged out, and a `MainTabs` (Dashboard swiping, Matches) component that unlocks once authenticated.
- **`src/components/SwipeCard.js`**: A reusable UI component that builds the visual card. It takes a `profile` object and formats the image, name, and skills using `expo-linear-gradient` overlays.
- **`src/screens/DashboardScreen.js`**: *The Core Logic.* It imports `Animated` and `PanResponder` from React Native to track your thumb movements across the screen. 
  - If you drag right beyond a certain threshold, the card animates out of view (simulating a 'Like'). 
  - If you drag left, the card slides out to the left (simulating a 'Nope').
  - The cards underneath visually scale and move up.
- **`src/screens/LoginScreen.js` & `RegisterScreen.js`**: Form views that handle user input for authentication.
- **`src/screens/ProfileSetupScreen.js`**: Collects the user's tech stack and allows for the upload of a Student ID card.
- **`src/screens/MatchesScreen.js`**: A list view component that displays profiles of mutual matches (when two people swipe right on each other).
- **`src/utils/mockData.js`**: Currently holds dummy developers so you can test the swiping gesture immediately without a database.

---

### 2. `/backend` (Node.js & Express API)
This folder serves as the secure brain of the application, communicating between the database and the mobile app.

- **`server.js`**: The main Express server file. It initializes cross-origin sharing (CORS), connects to MongoDB using Mongoose, and links the API routes.
- **`models/User.js`**: The Mongoose schema defining the base account credentials (`email`, hashed `password`, and `isVerified` boolean).
- **`models/Profile.js`**: The schema defining a developer's personality (skills, roles, GitHub link, profile picture path). Includes a foreign-key to the base `User`.
- **`middlewares/auth.js`**: A security function. It intercepts incoming API requests, reads the JWT (JSON Web Token) from the headers, and rejects unauthorized traffic before it hits the database.
- **`routes/auth.js`**: Contains `/register` and `/login` endpoints. It uses `bcryptjs` to irreversibly encrypt raw passwords before saving them to MongoDB.
- **`routes/profiles.js`**: Contains profile creation logic. Notably, it leverages **`multer`** to catch raw ID image files uploaded from the React Native app, saves them temporarily to the server disk (`/uploads` folder), and then fires an HTTP request to our Python Service to verify the student ID.
- **`/uploads`**: A temporary local storage folder for saving avatar and student ID images.

---

### 3. `/python-service` (Flask Data Verification)
Since reading and validating actual Student ID cards involves Optical Character Recognition (OCR) or Machine Learning algorithms, this logic is abstracted to a Python microservice for maximum ecosystem compatibility.

- **`app.py`**: A minimalist Flask server. It listens on port 5001 for a `/verify` POST request from the Node.js backend. 
  - *Current Logic*: It currently mocks the verification by checking if the image file genuinely exists. 
  - *Future Logic*: This is designed to easily swap in `pytesseract` to scan the image for keywords like "University", "Student", or "Expires 2026", and returning a JSON payload of `{"verified": true}` back to Node.js.
- **`requirements.txt`**: The `pip` dependencies necessary to execute the Python environment.

---

## ⚙️ Running the Full Stack Local Environment

You need to spin up three independent processes in parallel to run the whole app:

1. **Frontend**: Open `d:\PeerForge\mobile` and run `npm run web` (or `npx expo start`) to see the mobile app.
2. **Backend**: Open `d:\PeerForge\backend` and run `node server.js` to boot the MongoDB endpoints.
3. **Python**: Open `d:\PeerForge\python-service` and run `pip install -r requirements.txt`, followed by `python app.py` to power up the ID validation mock.
