"""Delete specific users from the database"""
from database import get_db_connection

def delete_user_by_email(email):
    """Delete a user and all associated data by email"""
    print(f"\n=== DELETING USER: {email} ===")
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get user ID
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            
            if not user:
                print(f"❌ User not found: {email}")
                return False
            
            user_id = user["id"]
            print(f"User ID: {user_id}")
            
            # Delete all associated data
            # 1. Delete team memberships
            cursor.execute("DELETE FROM team_members WHERE userId = ?", (user_id,))
            team_members_deleted = cursor.rowcount
            print(f"✓ Deleted {team_members_deleted} team memberships")
            
            # 2. Delete team invites created by user
            cursor.execute("DELETE FROM team_invites WHERE invitedBy = ?", (user_id,))
            invites_deleted = cursor.rowcount
            print(f"✓ Deleted {invites_deleted} team invites")
            
            # 3. Delete teams created by user
            cursor.execute("DELETE FROM teams WHERE createdBy = ?", (user_id,))
            teams_deleted = cursor.rowcount
            print(f"✓ Deleted {teams_deleted} teams")
            
            # 4. Delete matches
            cursor.execute("DELETE FROM matches WHERE userId = ? OR matchedUserId = ?", (user_id, user_id))
            matches_deleted = cursor.rowcount
            print(f"✓ Deleted {matches_deleted} matches")
            
            # 5. Delete swipes by this user
            cursor.execute("DELETE FROM swipes WHERE userId = ?", (user_id,))
            swipes_deleted = cursor.rowcount
            print(f"✓ Deleted {swipes_deleted} swipes")
            
            # 6. Delete swipes on this user
            cursor.execute("DELETE FROM swipes WHERE targetId = ?", (user_id,))
            target_swipes_deleted = cursor.rowcount
            print(f"✓ Deleted {target_swipes_deleted} swipes on user")
            
            # 7. Delete profile
            cursor.execute("DELETE FROM profiles WHERE userId = ?", (user_id,))
            profile_deleted = cursor.rowcount
            print(f"✓ Deleted profile")
            
            # 8. Delete user account
            cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
            print(f"✓ Deleted user account")
            
            conn.commit()
            print(f"✅ Successfully deleted user: {email}")
            return True
            
    except Exception as e:
        print(f"❌ Error deleting user: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Delete specified users
    emails_to_delete = [
        "meenubang05@gmail.com",
        "231501097@rajalakshmi.edu.in"
    ]
    
    print("="*60)
    print("DELETING USERS FROM DATABASE")
    print("="*60)
    
    for email in emails_to_delete:
        delete_user_by_email(email)
    
    print("\n" + "="*60)
    print("DELETION COMPLETE")
    print("="*60)
