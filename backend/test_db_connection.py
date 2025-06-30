#!/usr/bin/env python3
"""
Simple script to test database connection to Neon Postgres
Run this after setting up your .env file to verify the connection works
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_connection():
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in environment variables")
        print("Please make sure you have a .env file with your Neon connection string")
        return False
    
    print(f"🔗 Testing connection to database...")
    print(f"📍 Host: {database_url.split('@')[1].split('/')[0] if '@' in database_url else 'localhost'}")
    
    try:
        # Create engine with connection pooling
        engine = create_engine(
            database_url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=3600
        )
        
        # Test connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connection successful!")
            print(f"📊 PostgreSQL version: {version}")
            
            # Test basic query
            result = connection.execute(text("SELECT current_database(), current_user"))
            db_info = result.fetchone()
            print(f"🗄️ Database: {db_info[0]}")
            print(f"👤 User: {db_info[1]}")
            
        print("🎉 Database connection test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check your DATABASE_URL format")
        print("2. Ensure your Neon database is active (not suspended)")
        print("3. Verify your credentials are correct")
        print("4. Make sure SSL is enabled (?sslmode=require)")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)