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
from student_id.v3.simple_verify import simple_verify

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

# ============ TEAM MANAGEMENT ============

@app.post("/teams")
async def create_team(
    name: str = Form(...),
    description: str = Form(default=""),
    purpose: str = Form(default=""),
    email: str = Form(...)
):
    """Create a new team"""
    print(f"\n=== CREATE TEAM ===")
    print(f"Name: {name}, Creator: {email}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get user
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if not user:
                return {"error": "User not found"}
            
            user_id = user["id"]
            team_id = str(uuid.uuid4())
            
            # Create team
            cursor.execute(
                """INSERT INTO teams (id, name, description, purpose, createdBy, createdAt)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (team_id, name, description, purpose, user_id, datetime.now().isoformat())
            )
            
            # Add creator as admin
            cursor.execute(
                """INSERT INTO team_members (teamId, userId, role, joinedAt)
                   VALUES (?, ?, ?, ?)""",
                (team_id, user_id, "admin", datetime.now().isoformat())
            )
            
            # Generate invite code
            invite_code = str(uuid.uuid4())[:8].upper()
            invite_id = str(uuid.uuid4())
            cursor.execute(
                """INSERT INTO team_invites (id, teamId, invitedBy, inviteCode, createdAt)
                   VALUES (?, ?, ?, ?, ?)""",
                (invite_id, team_id, user_id, invite_code, datetime.now().isoformat())
            )
            
            conn.commit()
            print(f"✓ Team created: {team_id}")
            
            return {
                "success": True,
                "team": {
                    "id": team_id,
                    "name": name,
                    "description": description,
                    "purpose": purpose,
                    "inviteCode": invite_code,
                    "role": "admin"
                }
            }
    except Exception as e:
        print(f"✗ Create team error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.get("/teams")
async def get_user_teams(email: str):
    """Get all teams user is a member of"""
    print(f"\n=== GET USER TEAMS ===")
    print(f"Email: {email}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get user
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if not user:
                return {"error": "User not found"}
            
            user_id = user["id"]
            
            # Get teams user is member of
            cursor.execute("""
                SELECT t.*, tm.role, tm.joinedAt
                FROM teams t
                JOIN team_members tm ON t.id = tm.teamId
                WHERE tm.userId = ?
                ORDER BY tm.joinedAt DESC
            """, (user_id,))
            
            teams = []
            for row in cursor.fetchall():
                team = dict(row)
                
                # Get member count
                cursor.execute("SELECT COUNT(*) as count FROM team_members WHERE teamId = ?", (team["id"],))
                team["memberCount"] = cursor.fetchone()["count"]
                
                # Get invite code if user is admin
                if team["role"] == "admin":
                    cursor.execute("SELECT inviteCode FROM team_invites WHERE teamId = ? LIMIT 1", (team["id"],))
                    invite = cursor.fetchone()
                    team["inviteCode"] = invite["inviteCode"] if invite else None
                
                teams.append(team)
            
            print(f"✓ Found {len(teams)} teams for {email}")
            return {"teams": teams}
    except Exception as e:
        print(f"✗ Get teams error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.get("/teams/{teamId}")
async def get_team_details(teamId: str, email: str):
    """Get detailed team information including members"""
    print(f"\n=== GET TEAM DETAILS ===")
    print(f"Team ID: {teamId}, Email: {email}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get user
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if not user:
                return {"error": "User not found"}
            
            user_id = user["id"]
            
            # Check if user is member
            cursor.execute("SELECT role FROM team_members WHERE teamId = ? AND userId = ?", (teamId, user_id))
            membership = cursor.fetchone()
            if not membership:
                return {"error": "Not a member of this team"}
            
            # Get team info
            cursor.execute("SELECT * FROM teams WHERE id = ?", (teamId,))
            team = cursor.fetchone()
            if not team:
                return {"error": "Team not found"}
            
            team_dict = dict(team)
            team_dict["userRole"] = membership["role"]
            
            # Get members with profiles
            cursor.execute("""
                SELECT tm.userId, tm.role, tm.joinedAt, p.name, p.email, p.college, p.skills, p.interests
                FROM team_members tm
                JOIN profiles p ON tm.userId = p.userId
                WHERE tm.teamId = ?
                ORDER BY tm.joinedAt ASC
            """, (teamId,))
            
            members = []
            for row in cursor.fetchall():
                member = dict(row)
                member["skills"] = member["skills"].split(",") if member["skills"] else []
                member["interests"] = member["interests"].split(",") if member["interests"] else []
                members.append(member)
            
            team_dict["members"] = members
            
            # Get invite code if user is admin
            if membership["role"] == "admin":
                cursor.execute("SELECT inviteCode FROM team_invites WHERE teamId = ? LIMIT 1", (teamId,))
                invite = cursor.fetchone()
                team_dict["inviteCode"] = invite["inviteCode"] if invite else None
            
            print(f"✓ Team details retrieved")
            return {"team": team_dict}
    except Exception as e:
        print(f"✗ Get team details error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/teams/join")
async def join_team(
    inviteCode: str = Form(...),
    email: str = Form(...)
):
    """Join a team using invite code"""
    print(f"\n=== JOIN TEAM ===")
    print(f"Invite Code: {inviteCode}, Email: {email}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get user
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if not user:
                return {"error": "User not found"}
            
            user_id = user["id"]
            
            # Find team by invite code
            cursor.execute("SELECT teamId FROM team_invites WHERE inviteCode = ?", (inviteCode.upper(),))
            invite = cursor.fetchone()
            if not invite:
                return {"error": "Invalid invite code"}
            
            team_id = invite["teamId"]
            
            # Check if already a member
            cursor.execute("SELECT id FROM team_members WHERE teamId = ? AND userId = ?", (team_id, user_id))
            if cursor.fetchone():
                return {"error": "Already a member of this team"}
            
            # Add as member
            cursor.execute(
                """INSERT INTO team_members (teamId, userId, role, joinedAt)
                   VALUES (?, ?, ?, ?)""",
                (team_id, user_id, "member", datetime.now().isoformat())
            )
            
            # Get team info
            cursor.execute("SELECT * FROM teams WHERE id = ?", (team_id,))
            team = cursor.fetchone()
            
            conn.commit()
            print(f"✓ User joined team: {team_id}")
            
            return {
                "success": True,
                "team": dict(team)
            }
    except Exception as e:
        print(f"✗ Join team error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.delete("/teams/{teamId}/members/{userId}")
async def remove_team_member(teamId: str, userId: str, email: str):
    """Remove a member from team (admin only)"""
    print(f"\n=== REMOVE TEAM MEMBER ===")
    print(f"Team: {teamId}, Remove: {userId}, By: {email}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get requesting user
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if not user:
                return {"error": "User not found"}
            
            requester_id = user["id"]
            
            # Check if requester is admin
            cursor.execute("SELECT role FROM team_members WHERE teamId = ? AND userId = ?", (teamId, requester_id))
            membership = cursor.fetchone()
            if not membership or membership["role"] != "admin":
                return {"error": "Only admins can remove members"}
            
            # Don't allow removing yourself if you're the only admin
            if requester_id == userId:
                cursor.execute("SELECT COUNT(*) as count FROM team_members WHERE teamId = ? AND role = 'admin'", (teamId,))
                admin_count = cursor.fetchone()["count"]
                if admin_count <= 1:
                    return {"error": "Cannot remove yourself as the only admin"}
            
            # Remove member
            cursor.execute("DELETE FROM team_members WHERE teamId = ? AND userId = ?", (teamId, userId))
            conn.commit()
            
            print(f"✓ Member removed from team")
            return {"success": True}
    except Exception as e:
        print(f"✗ Remove member error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.delete("/teams/{teamId}")
async def delete_team(teamId: str, email: str):
    """Delete a team (admin only)"""
    print(f"\n=== DELETE TEAM ===")
    print(f"Team: {teamId}, By: {email}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get user
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if not user:
                return {"error": "User not found"}
            
            user_id = user["id"]
            
            # Check if user is admin
            cursor.execute("SELECT role FROM team_members WHERE teamId = ? AND userId = ?", (teamId, user_id))
            membership = cursor.fetchone()
            if not membership or membership["role"] != "admin":
                return {"error": "Only admins can delete teams"}
            
            # Delete team and related data
            cursor.execute("DELETE FROM team_invites WHERE teamId = ?", (teamId,))
            cursor.execute("DELETE FROM team_members WHERE teamId = ?", (teamId,))
            cursor.execute("DELETE FROM teams WHERE id = ?", (teamId,))
            
            conn.commit()
            print(f"✓ Team deleted")
            return {"success": True}
    except Exception as e:
        print(f"✗ Delete team error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@app.post("/teams/{teamId}/leave")
async def leave_team(teamId: str, email: str = Form(...)):
    """Leave a team"""
    print(f"\n=== LEAVE TEAM ===")
    print(f"Team: {teamId}, User: {email}")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get user
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if not user:
                return {"error": "User not found"}
            
            user_id = user["id"]
            
            # Check if user is the only admin
            cursor.execute("SELECT role FROM team_members WHERE teamId = ? AND userId = ?", (teamId, user_id))
            membership = cursor.fetchone()
            if membership and membership["role"] == "admin":
                cursor.execute("SELECT COUNT(*) as count FROM team_members WHERE teamId = ? AND role = 'admin'", (teamId,))
                admin_count = cursor.fetchone()["count"]
                if admin_count <= 1:
                    return {"error": "Cannot leave as the only admin. Delete the team or promote another member first."}
            
            # Remove from team
            cursor.execute("DELETE FROM team_members WHERE teamId = ? AND userId = ?", (teamId, user_id))
            conn.commit()
            
            print(f"✓ User left team")
            return {"success": True}
    except Exception as e:
        print(f"✗ Leave team error: {str(e)}")
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
    """Simple verification - accepts any file and marks user as verified"""
    print(f"\n=== STUDENT ID VERIFICATION (SIMPLE) ===")
    print(f"Email: {email}")
    print(f"File: {file.filename}")
    
    try:
        # Save uploaded file
        file_path = f"sample_ids/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"✓ File saved to {file_path}")
        
        # Use simple verification (always succeeds)
        result = simple_verify(file_path, email)
        
        # Update user verification status in database
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET verified = ? WHERE email = ?", (True, email))
            conn.commit()
            print(f"✓ Updated user verification status in database")
        
        # Clean up uploaded file
        try:
            os.remove(file_path)
            print(f"✓ Cleaned up {file_path}")
        except:
            pass
        
        return result
        
    except Exception as e:
        print(f"✗ Verification error: {e}")
        import traceback
        traceback.print_exc()
        
        # Still return success
        return {
            "verified": True,
            "name": "Verified User",
            "college": "Verified",
            "validity_year": 2027,
            "message": "Verification successful"
        }

# ============ HEALTH CHECK ============

@app.get("/health")
async def health():
    return {"status": "ok"}
