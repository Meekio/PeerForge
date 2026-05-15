"""Quick database viewer"""
import sqlite3
from database import DB_PATH

def view_all_data():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("\n" + "="*60)
    print("PEERFORGE DATABASE CONTENTS")
    print("="*60)
    
    # Users
    print("\n📧 USERS:")
    print("-" * 60)
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    for user in users:
        print(f"ID: {user['id']}")
        print(f"Email: {user['email']}")
        print(f"Verified: {user['verified']}")
        print(f"Profile Completed: {user['profileCompleted']}")
        print(f"Created: {user['createdAt']}")
        print("-" * 60)
    print(f"Total Users: {len(users)}\n")
    
    # Profiles
    print("\n👤 PROFILES:")
    print("-" * 60)
    cursor.execute("SELECT * FROM profiles")
    profiles = cursor.fetchall()
    for profile in profiles:
        print(f"Name: {profile['name']}")
        print(f"Email: {profile['email']}")
        print(f"College: {profile['college']}")
        print(f"Year: {profile['year']}")
        print(f"Skills: {profile['skills']}")
        print(f"Interests: {profile['interests']}")
        print("-" * 60)
    print(f"Total Profiles: {len(profiles)}\n")
    
    # Swipes
    print("\n👆 SWIPES:")
    print("-" * 60)
    cursor.execute("SELECT * FROM swipes")
    swipes = cursor.fetchall()
    for swipe in swipes:
        print(f"User: {swipe['userId']} -> Target: {swipe['targetId']}")
        print(f"Interested: {swipe['interested']}")
        print(f"Created: {swipe['createdAt']}")
        print("-" * 60)
    print(f"Total Swipes: {len(swipes)}\n")
    
    # Matches
    print("\n💕 MATCHES:")
    print("-" * 60)
    cursor.execute("SELECT * FROM matches")
    matches = cursor.fetchall()
    for match in matches:
        print(f"User: {match['userId']} <-> {match['matchedUserId']}")
        print(f"Created: {match['createdAt']}")
        print("-" * 60)
    print(f"Total Matches: {len(matches)}\n")
    
    conn.close()

if __name__ == "__main__":
    view_all_data()
