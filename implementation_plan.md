# PeerForge: Student Teammate Discovery Platform

This document outlines the implementation plan for the full-stack system that allows students to find teammates for hackathons and technical projects through a swipe-based matching system.

## User Review Required

> [!IMPORTANT]
> The plan has been updated to use **React Native** for the frontend, and phased to build the **UI First**, followed by the **Backend**. Please review this updated plan. Once approved, I will begin initializing the React Native application.

## Phased Approach

### Phase 1: Mobile UI First
We will start by building the user interface and interactions using **React Native** (via Expo for the easiest and most robust development experience). During this phase, we will use mock data to simulate the swipe behavior, matches, and authentication.

### Phase 2: Backend Integration
Once the UI feels solid, we will build out the Node.js + Express backend, MongoDB database, and the Python ID verification service, and then connect the React Native app to real API endpoints.

---

## Proposed Architecture

### Mobile App (React Native + Expo)
- Built using Expo for streamlined React Native development.
- **Navigation**: React Navigation (Stack and Bottom Tabs).
- **Styling**: Standard React Native StyleSheet to ensure a premium, modern aesthetic with smooth animations (using React Native Reanimated or standard Animated API for the swipe cards).
- **Screens**:
  - `Login / Register`: Introductory screen and auth forms.
  - `Profile Setup`: Multi-step form to upload profile picture, ID card, describe skills, tech stack, and links.
  - `Dashboard (Swipe)`: The main screen where profiles are presented as cards. We will implement Tinder-like swipe gestures to like (right) or skip (left).
  - `Matches View`: Shows a list of mutual matches, revealing their GitHub and LinkedIn links.
  - `Profile Viewer`: View and edit own profile details.

### Backend (Node.js/Express)
- Uses `mongoose` for MongoDB models.
- Uses `jsonwebtoken` (JWT) for secure endpoints.
- Uses `multer` for receiving file uploads (images & ID cards).
- Exposes REST APIs for Auth, Profiles, Swipes, and Matches.

### Python Verification Module
- Minimal Flask server with one primary endpoint `/verify`.
- Takes an image file sent from the Node server, performs simulated OCR or actual verification (depending on preference), and returns a verified status.

---

## Data Models (MongoDB)

### 1. User
- `_id`: ObjectId
- `email`: String (Unique)
- `passwordHash`: String
- `isVerified`: Boolean (Default: false)

### 2. Profile
- `user`: ObjectId (Ref User)
- `name`: String
- `college`: String
- `skills`: Array of Strings
- `techStack`: Array of Strings
- `interests`: Array of Strings
- `githubUrl`: String
- `linkedinUrl`: String
- `profilePicturePath`: String
- `idCardPath`: String

### 3. Swipe
- `swiper`: ObjectId (Ref User)
- `swipee`: ObjectId (Ref User)
- `liked`: Boolean

### 4. Match
- `users`: Array of ObjectIds (Length of 2)
- `matchedAt`: Date

---

## Open Questions

> [!WARNING]
> 1. Is using **Expo** for the React Native app acceptable? It's the recommended way to start new React Native projects.
> 2. For the swipe cards, I plan to build a smooth, animated card stack. Should we keep it simple for now, or focus heavily on replicating the exact Tinder-style fluid swipe feel?

## Verification Plan

- **Phase 1**: Initialize an Expo app, build the screens, implement navigation, and create the mock swipe functionality. You can test it using the Expo Go app on your phone or web emulator.
- **Phase 2**: Build the Node API, connect the DB, replace mock data in the React Native app with API requests. Validate file uploads and matches.
