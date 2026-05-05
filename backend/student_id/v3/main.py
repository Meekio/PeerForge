from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from datetime import datetime

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("sample_ids", exist_ok=True)

# Import email service
from email_service import send_email

# In-memory data stores
users_db = {
    "demo@example.com": {
        "id": "1",
        "password": "demo123",
        "verified": False,
        "profileCompleted": False
    },
    "test@example.com": {
        "id": "2",
        "password": "test123",
        "verified": False,
        "profileCompleted": False
    }
}

profiles_db = {}  # user_id -> profile data
swipes_db = {}    # user_id -> {target_id: True/False}
matches_db = {}   # user_id -> [matched_user_ids]

# ============ AUTH ENDPOINTS ============

@app.post("/auth/login")
async def login(email: str = Form(...), password: str = Form(...)):
    print(f"Login attempt: {email}")
    if email in users_db and users_db[email]["password"] == password:
        user = users_db[email]
        print(f"Login successful for {email}")
        return {
            "id": user["id"],
            "email": email,
            "verified": user.get("verified", False),
            "profileCompleted": user.get("profileCompleted", False),
            "token": f"token-{user['id']}"
        }
    print(f"Login failed for {email}")
    return {"error": "Invalid credentials"}

@app.post("/auth/signup")
async def signup(email: str = Form(...), password: str = Form(...)):
    print(f"Signup attempt: {email}")
    if email in users_db:
        print(f"Signup failed - user already exists: {email}")
        return {"error": "User already exists"}
    
    user_id = str(len(users_db) + 1)
    users_db[email] = {
        "id": user_id,
        "password": password,
        "verified": False,
        "profileCompleted": False
    }
    
    print(f"Signup successful for {email}")
    return {
        "id": user_id,
        "email": email,
        "verified": False,
        "profileCompleted": False,
        "token": f"token-{user_id}"
    }

# ============ PROFILE ENDPOINTS ============

@app.post("/profile")
async def save_profile(
    name: str = Form(...),
    college: str = Form(...),
    year: int = Form(...),
    skills: str = Form(...),
    interests: str = Form(...),
    availability: str = Form(...),
    lookingFor: str = Form(...),
    github: str = Form(default=""),
    linkedin: str = Form(default=""),
    bio: str = Form(default=""),
    email: str = Form(...)
):
    """Save user profile"""
    print(f"Saving profile for {email}")
    
    if email not in users_db:
        return {"error": "User not found"}
    
    user_id = users_db[email]["id"]
    
    # Parse comma-separated tags
    skills_list = [s.strip() for s in skills.split(",") if s.strip()]
    interests_list = [i.strip() for i in interests.split(",") if i.strip()]
    availability_list = [a.strip() for a in availability.split(",") if a.strip()]
    lookingFor_list = [l.strip() for l in lookingFor.split(",") if l.strip()]
    
    profiles_db[user_id] = {
        "id": user_id,
        "email": email,
        "name": name,
        "college": college,
        "year": year,
        "skills": skills_list,
        "interests": interests_list,
        "availability": availability_list,
        "lookingFor": lookingFor_list,
        "github": github,
        "linkedin": linkedin,
        "bio": bio,
        "verified": True,
        "createdAt": datetime.now().isoformat()
    }
    
    # Mark profile as completed
    users_db[email]["profileCompleted"] = True
    
    print(f"Profile saved for {email}")
    return {"success": True, "profile": profiles_db[user_id]}

# ============ DISCOVERY & SWIPING ============

@app.get("/discover")
async def get_discover_profiles(email: str):
    """Get profiles for discovery (excluding current user and already swiped)"""
    print(f"Getting discover profiles for {email}")
    
    if email not in users_db:
        return {"error": "User not found"}
    
    user_id = users_db[email]["id"]
    
    # Get all profiles except current user
    available_profiles = [
        p for uid, p in profiles_db.items() 
        if uid != user_id
    ]
    
    # Filter out already swiped profiles
    if user_id in swipes_db:
        swiped_ids = set(swipes_db[user_id].keys())
        available_profiles = [p for p in available_profiles if p["id"] not in swiped_ids]
    
    print(f"Found {len(available_profiles)} profiles for {email}")
    return {"profiles": available_profiles}

@app.post("/swipe")
async def record_swipe(
    targetId: str = Form(...),
    interested: bool = Form(...),
    email: str = Form(...)
):
    """Record a swipe (interested or not)"""
    print(f"Recording swipe: {email} -> {targetId} (interested: {interested})")
    
    if email not in users_db:
        return {"error": "User not found"}
    
    user_id = users_db[email]["id"]
    
    # Initialize swipes for user if not exists
    if user_id not in swipes_db:
        swipes_db[user_id] = {}
    
    # Record the swipe
    swipes_db[user_id][targetId] = interested
    
    # Check for mutual match
    if interested and targetId in swipes_db and user_id in swipes_db[targetId]:
        if swipes_db[targetId][user_id]:
            # Mutual match!
            print(f"MATCH! {user_id} <-> {targetId}")
            
            # Add to matches
            if user_id not in matches_db:
                matches_db[user_id] = []
            if targetId not in matches_db:
                matches_db[targetId] = []
            
            if targetId not in matches_db[user_id]:
                matches_db[user_id].append(targetId)
            if user_id not in matches_db[targetId]:
                matches_db[targetId].append(user_id)
            
            return {"success": True, "matched": True, "matchedWith": targetId}
    
    return {"success": True, "matched": False}

# ============ MATCHES ============

@app.get("/matches")
async def get_matches(email: str):
    """Get user's matches"""
    print(f"Getting matches for {email}")
    
    if email not in users_db:
        return {"error": "User not found"}
    
    user_id = users_db[email]["id"]
    
    if user_id not in matches_db:
        return {"matches": []}
    
    # Get full profile data for matched users
    matched_profiles = []
    for matched_id in matches_db[user_id]:
        if matched_id in profiles_db:
            profile = profiles_db[matched_id].copy()
            profile["matchedAt"] = "recently"
            matched_profiles.append(profile)
    
    print(f"Found {len(matched_profiles)} matches for {email}")
    return {"matches": matched_profiles}

@app.delete("/matches/{matchId}")
async def unmatch(matchId: str, email: str):
    """Unmatch with a user"""
    print(f"Unmatching: {email} -> {matchId}")
    
    if email not in users_db:
        return {"error": "User not found"}
    
    user_id = users_db[email]["id"]
    
    if user_id in matches_db and matchId in matches_db[user_id]:
        matches_db[user_id].remove(matchId)
    
    if matchId in matches_db and user_id in matches_db[matchId]:
        matches_db[matchId].remove(user_id)
    
    print(f"Unmatched: {user_id} <-> {matchId}")
    return {"success": True}

# ============ EMAIL VERIFICATION ============

@app.post("/send-verification-email")
async def send_verification_email(email: str = Form(...)):
    """Send verification email"""
    print(f"\n=== VERIFICATION EMAIL ENDPOINT ===")
    print(f"Email: {email}")
    
    try:
        result = send_email(email, verified=True)
        if result:
            print(f"✓ Verification email sent to {email}")
            return {"success": True, "message": "Email sent"}
        else:
            print(f"✗ Failed to send email to {email}")
            return {"success": False, "error": "Failed to send email"}
    except Exception as e:
        print(f"✗ Exception in send_verification_email: {e}")
        return {"success": False, "error": str(e)}

# ============ HEALTH CHECK ============

@app.get("/health")
async def health():
    return {"status": "ok"}

