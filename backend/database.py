"""SQLite database connection and utilities"""
import sqlite3
import os
from contextlib import contextmanager

DB_PATH = "peerforge.db"

def init_db():
    """Initialize SQLite database with tables"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            verified BOOLEAN DEFAULT 0,
            profileCompleted BOOLEAN DEFAULT 0,
            createdAt TEXT
        )
    """)
    
    # Profiles table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
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
    """)
    
    # Swipes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS swipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            targetId TEXT NOT NULL,
            interested BOOLEAN NOT NULL,
            createdAt TEXT,
            FOREIGN KEY (userId) REFERENCES users(id),
            UNIQUE(userId, targetId)
        )
    """)
    
    # Matches table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            matchedUserId TEXT NOT NULL,
            createdAt TEXT,
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (matchedUserId) REFERENCES users(id),
            UNIQUE(userId, matchedUserId)
        )
    """)
    
    # Teams table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS teams (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            purpose TEXT,
            createdBy TEXT NOT NULL,
            createdAt TEXT,
            FOREIGN KEY (createdBy) REFERENCES users(id)
        )
    """)
    
    # Team members table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS team_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teamId TEXT NOT NULL,
            userId TEXT NOT NULL,
            role TEXT DEFAULT 'member',
            joinedAt TEXT,
            FOREIGN KEY (teamId) REFERENCES teams(id),
            FOREIGN KEY (userId) REFERENCES users(id),
            UNIQUE(teamId, userId)
        )
    """)
    
    # Team invites table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS team_invites (
            id TEXT PRIMARY KEY,
            teamId TEXT NOT NULL,
            invitedBy TEXT NOT NULL,
            inviteCode TEXT UNIQUE NOT NULL,
            expiresAt TEXT,
            createdAt TEXT,
            FOREIGN KEY (teamId) REFERENCES teams(id),
            FOREIGN KEY (invitedBy) REFERENCES users(id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("✓ Connected to SQLite")

@contextmanager
def get_db_connection():
    """Get database connection context manager"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def is_connected():
    """Check if database is available"""
    try:
        with get_db_connection() as conn:
            conn.execute("SELECT 1")
        return True
    except:
        return False
