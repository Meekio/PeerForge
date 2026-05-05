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
