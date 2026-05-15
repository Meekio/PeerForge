from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from datetime import datetime
import sys
import uuid

# Add backend to path so we can import student_id module
sys.path.insert(0, os.path.dirname(__file__))

# Import database module
from database import init_db, get_db_connection, is_connected

# Import email service and verification modules from student_id.v3
from student_id.v3.email_service import send_email
from student_id.v3.gemini_ocr import extract_text_with_gemini
from student_id.v3.validator import validate_id

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

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# In-memory fallback data stores (removed - using SQLite now)
users_db = {}
profiles_db = {}
swipes_db = {}
matches_db = {}

# ============ AUTH ENDPOINTS ============

@app.post("/auth/login")
async def login(email: str = Form(...), password: str = Form(...)):
    print(f"Login attempt: {email}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if user and user["password"] == password:
            print(f"Login successful for {email}")
            return {
                "id": user["id"],
                "email": email,
                "verified": user["verified"],
                "profileCompleted": user["profileCompleted"],
                "token": f"token-{user['id']}"
            }
    
    print(f"Login failed for {email}")
    return {"error": "Invalid credentials"}

@app.post("/auth/signup")
async def signup(email: str = Form(...), password: str = Form(...)):
    print(f"Signup attempt: {email}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            print(f"Signup failed - user already exists: {email}")
            return {"error": "User already exists"}
        
        # Create new user
        user_id = str(uuid.uuid4())
        cursor.execute(
            """INSERT INTO users (id, email, password, verified, profileCompleted, createdAt)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user_id, email, password, False, False, datetime.now().isoformat())
        )
        conn.commit()
        
        print(f"Signup successful for {email}")
        return {
            "id": user_id,
            "email": email,
            "verified": False,
            "profileCompleted": False,
            "token": f"token-{user_id}"
        }

# ============ PROFILE ENDPOINTS ============

@app.get("/profile")
async def get_user_profile(email: str):
    """Get current user's profile"""
    print(f"\n=== GET PROFILE ===")
    print(f"Email: {email}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get user
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        if not user:
            print(f"❌ User not found: {email}")
            return {"error": "User not found"}
        
        user_id = user["id"]
        print(f"User ID: {user_id}")
        
        # Get profile
        cursor.execute("SELECT * FROM profiles WHERE userId = ?", (user_id,))
        profile = cursor.fetchone()
        if not profile:
            print(f"❌ Profile not found for user_id: {user_id}")
            return {"error": "Profile not found"}
        
        profile_dict = dict(profile)
        # Parse JSON arrays
        profile_dict["skills"] = profile_dict["skills"].split(",") if profile_dict["skills"] else []
        profile_dict["interests"] = profile_dict["interests"].split(",") if profile_dict["interests"] else []
        profile_dict["availability"] = profile_dict["availability"].split(",") if profile_dict["availability"] else []
        profile_dict["lookingFor"] = profile_dict["lookingFor"].split(",") if profile_dict["lookingFor"] else []
        
        print(f"✓ Found profile for {email}")
        return {"profile": profile_dict}

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
    print(f"\n{'='*60}")
    print(f"SAVE PROFILE REQUEST RECEIVED")
    print(f"{'='*60}")
    print(f"Email: {email}")
    print(f"Name: {name}")
    print(f"College: {college}")
    print(f"Year: {year}")
    print(f"Skills: {skills}")
    print(f"Interests: {interests}")
    print(f"{'='*60}\n")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get user
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        if not user:
            print(f"❌ ERROR: User '{email}' not found")
            return {"error": "User not found"}
        
        user_id = user["id"]
        print(f"✓ User found: {email} (ID: {user_id})")
        
        # Save or update profile
        cursor.execute(
            """INSERT OR REPLACE INTO profiles 
               (userId, email, name, college, year, skills, interests, availability, lookingFor, github, linkedin, bio, verified, createdAt)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, email, name, college, year, skills, interests, availability, lookingFor, github, linkedin, bio, True, datetime.now().isoformat())
        )
        
        # Update user's profileCompleted flag
        cursor.execute("UPDATE users SET profileCompleted = 1 WHERE id = ?", (user_id,))
        conn.commit()
        
        print(f"✓ Profile saved successfully")
        print(f"{'='*60}\n")
        
        return {"success": True, "profile": {
            "userId": user_id,
            "email": email,
            "name": name,
            "college": college,
            "year": year,
            "skills": skills.split(","),
            "interests": interests.split(","),
            "availability": availability.split(","),
            "lookingFor": lookingFor.split(","),
            "github": github,
            "linkedin": linkedin,
            "bio": bio
        }}

# ============ DISCOVERY & SWIPING ============

@app.get("/discover")
async def get_discover_profiles(email: str):
    """Get profiles for discovery (excluding current user and already swiped)"""
    print(f"Getting discover profiles for {email}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get user
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        if not user:
            return {"error": "User not found"}
        
        user_id = user["id"]
        
        # Get all profiles except current user
        cursor.execute("SELECT * FROM profiles WHERE userId != ?", (user_id,))
        all_profiles = cursor.fetchall()
        
        # Get swiped profiles
        cursor.execute("SELECT targetId FROM swipes WHERE userId = ?", (user_id,))
        swiped_ids = set(row["targetId"] for row in cursor.fetchall())
        
        # Filter and format
        available_profiles = []
        for profile in all_profiles:
            if profile["userId"] not in swiped_ids:
                p = dict(profile)
                p["skills"] = p["skills"].split(",") if p["skills"] else []
                p["interests"] = p["interests"].split(",") if p["interests"] else []
                p["availability"] = p["availability"].split(",") if p["availability"] else []
                p["lookingFor"] = p["lookingFor"].split(",") if p["lookingFor"] else []
                available_profiles.append(p)
        
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
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get user
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        if not user:
            return {"error": "User not found"}
        
        user_id = user["id"]
        
        # Record the swipe
        cursor.execute(
            """INSERT OR REPLACE INTO swipes (userId, targetId, interested, createdAt)
               VALUES (?, ?, ?, ?)""",
            (user_id, targetId, interested, datetime.now().isoformat())
        )
        
        # Check for mutual match
        if interested:
            cursor.execute(
                "SELECT interested FROM swipes WHERE userId = ? AND targetId = ?",
                (targetId, user_id)
            )
            target_swipe = cursor.fetchone()
            if target_swipe and target_swipe["interested"]:
                # Mutual match!
                print(f"MATCH! {user_id} <-> {targetId}")
                
                # Add to matches
                cursor.execute(
                    """INSERT OR IGNORE INTO matches (userId, matchedUserId, createdAt)
                       VALUES (?, ?, ?)""",
                    (user_id, targetId, datetime.now().isoformat())
                )
                cursor.execute(
                    """INSERT OR IGNORE INTO matches (userId, matchedUserId, createdAt)
                       VALUES (?, ?, ?)""",
                    (targetId, user_id, datetime.now().isoformat())
                )
                
                conn.commit()
                return {"success": True, "matched": True, "matchedWith": targetId}
        
        conn.commit()
        return {"success": True, "matched": False}

# ============ MATCHES ============

@app.get("/matches")
async def get_matches(email: str):
    """Get user's matches"""
    print(f"Getting matches for {email}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get user
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        if not user:
            return {"error": "User not found"}
        
        user_id = user["id"]
        
        # Get matched user IDs
        cursor.execute("SELECT matchedUserId FROM matches WHERE userId = ?", (user_id,))
        matched_ids = [row["matchedUserId"] for row in cursor.fetchall()]
        
        if not matched_ids:
            return {"matches": []}
        
        # Get profiles for matched users
        matched_profiles = []
        for matched_id in matched_ids:
            cursor.execute("SELECT * FROM profiles WHERE userId = ?", (matched_id,))
            profile = cursor.fetchone()
            if profile:
                p = dict(profile)
                p["skills"] = p["skills"].split(",") if p["skills"] else []
                p["interests"] = p["interests"].split(",") if p["interests"] else []
                p["availability"] = p["availability"].split(",") if p["availability"] else []
                p["lookingFor"] = p["lookingFor"].split(",") if p["lookingFor"] else []
                p["matchedAt"] = "recently"
                matched_profiles.append(p)
        
        print(f"Found {len(matched_profiles)} matches for {email}")
        return {"matches": matched_profiles}

@app.delete("/matches/{matchId}")
async def unmatch(matchId: str, email: str):
    """Unmatch with a user"""
    print(f"Unmatching: {email} -> {matchId}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get user
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        if not user:
            return {"error": "User not found"}
        
        user_id = user["id"]
        
        # Remove matches
        cursor.execute("DELETE FROM matches WHERE userId = ? AND matchedUserId = ?", (user_id, matchId))
        cursor.execute("DELETE FROM matches WHERE userId = ? AND matchedUserId = ?", (matchId, user_id))
        conn.commit()
        
        print(f"Unmatched: {user_id} <-> {matchId}")
        return {"success": True}

@app.delete("/account")
async def delete_account(email: str):
    """Delete user account and all associated data"""
    print(f"\n=== DELETE ACCOUNT ===")
    print(f"Email: {email}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get user ID
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if not user:
                print(f"❌ User not found: {email}")
                return {"error": "User not found"}
            
            user_id = user["id"]
            print(f"User ID: {user_id}")
            
            # Delete all associated data in order (respecting foreign keys)
            # 1. Delete matches where user is involved
            cursor.execute("DELETE FROM matches WHERE userId = ? OR matchedUserId = ?", (user_id, user_id))
            matches_deleted = cursor.rowcount
            print(f"✓ Deleted {matches_deleted} matches")
            
            # 2. Delete swipes by this user
            cursor.execute("DELETE FROM swipes WHERE userId = ?", (user_id,))
            swipes_deleted = cursor.rowcount
            print(f"✓ Deleted {swipes_deleted} swipes")
            
            # 3. Delete swipes on this user
            cursor.execute("DELETE FROM swipes WHERE targetId = ?", (user_id,))
            target_swipes_deleted = cursor.rowcount
            print(f"✓ Deleted {target_swipes_deleted} swipes on user")
            
            # 4. Delete profile
            cursor.execute("DELETE FROM profiles WHERE userId = ?", (user_id,))
            profile_deleted = cursor.rowcount
            print(f"✓ Deleted profile")
            
            # 5. Delete user account
            cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
            print(f"✓ Deleted user account")
            
            conn.commit()
            print(f"✓ Account deletion complete for {email}")
            
            return {
                "success": True,
                "message": "Account deleted successfully",
                "deleted": {
                    "matches": matches_deleted,
                    "swipes": swipes_deleted + target_swipes_deleted,
                    "profile": profile_deleted > 0,
                    "user": True
                }
            }
    except Exception as e:
        print(f"✗ Delete account error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

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

# ============ STUDENT ID VERIFICATION ============

@app.post("/verify")
async def verify_student_id(
    file: UploadFile = File(...),
    email: str = Form(...)
):
    """Verify student ID using Gemini Vision"""
    print(f"\n=== STUDENT ID VERIFICATION (GEMINI) ===")
    print(f"Email: {email}")
    print(f"File: {file.filename}")
    
    try:
        # Save uploaded file
        file_path = f"sample_ids/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"✓ File saved to {file_path}")
        
        # Extract fields using Gemini Vision
        print("Running Gemini Vision OCR...")
        fields = extract_text_with_gemini(file_path)
        
        if fields is None:
            print("✗ Gemini extraction failed")
            return {
                "verified": False,
                "error": "Failed to process ID. Please try again.",
                "name": "Not Found",
                "college": "Not Found",
                "validity_year": None
            }
        
        print(f"✓ Extracted: name={fields['name']}, college={fields['college']}, year={fields['validity_year']}")
        
        # Validate ID
        verified = validate_id(fields['validity_year'])
        print(f"✓ Validation result: {verified}")
        
        # Update user verification status in database
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET verified = ? WHERE email = ?", (verified, email))
            conn.commit()
            print(f"✓ Updated user verification status in database")
        
        # Send verification email
        try:
            send_email(email, verified)
            print(f"✓ Verification email sent to {email}")
        except Exception as e:
            print(f"⚠ Email send failed (non-critical): {e}")
        
        # Clean up uploaded file
        try:
            os.remove(file_path)
            print(f"✓ Cleaned up {file_path}")
        except:
            pass
        
        return {
            "verified": verified,
            "name": fields['name'],
            "college": fields['college'],
            "validity_year": fields['validity_year']
        }
        
    except Exception as e:
        print(f"✗ Verification error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "verified": False,
            "error": str(e),
            "name": "Not Found",
            "college": "Not Found",
            "validity_year": None
        }

# ============ HEALTH CHECK ============

@app.get("/health")
async def health():
    return {"status": "ok"}
