#!/usr/bin/env python3
"""
Validation script to ensure everything is set up correctly
"""

import sys
import os
from dotenv import load_dotenv

load_dotenv()

def test_imports():
    """Test that all critical imports work"""
    print("🔍 Testing imports...")
    
    try:
        # Test core imports
        from app.core.config import settings
        from app.core.database import engine, get_db
        from app.models import Base, User, Recipe, Ingredient, Tag, MealPlan, MealPlanEntry
        from app.schemas import User as UserSchema, Recipe as RecipeSchema
        print("  ✅ Core imports successful")
        
        # Test API imports
        from app.api.auth import auth_router
        from app.api.recipes import recipes_router
        from app.api.meal_plans import meal_plans_router
        from app.api.users import users_router
        from app.api.parsing import parsing_router
        print("  ✅ API router imports successful")
        
        # Test services
        from app.services.recipe_service import RecipeService
        from app.services.meal_plan_service import MealPlanService
        from app.services.user_service import UserService
        from app.services.parsing_service import ParsingService
        print("  ✅ Service imports successful")
        
        return True
    except Exception as e:
        print(f"  ❌ Import error: {str(e)}")
        return False

def test_database_connection():
    """Test database connection"""
    print("🔗 Testing database connection...")
    
    try:
        from app.core.database import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            assert result.fetchone()[0] == 1
        
        print("  ✅ Database connection successful")
        return True
    except Exception as e:
        print(f"  ❌ Database connection error: {str(e)}")
        return False

def test_migration_status():
    """Check migration status"""
    print("🔄 Checking migration status...")
    
    try:
        import subprocess
        result = subprocess.run(['alembic', 'current'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✅ Current migration: {result.stdout.strip()}")
            return True
        else:
            print(f"  ❌ Migration check failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"  ❌ Migration status error: {str(e)}")
        return False

def test_app_creation():
    """Test FastAPI app creation"""
    print("🚀 Testing FastAPI app creation...")
    
    try:
        from app.main import app
        print(f"  ✅ App created: {app.title} v{app.version}")
        print(f"  📊 Routes count: {len(app.routes)}")
        return True
    except Exception as e:
        print(f"  ❌ App creation error: {str(e)}")
        return False

def test_environment():
    """Test environment configuration"""
    print("⚙️ Testing environment configuration...")
    
    database_url = os.getenv('DATABASE_URL')
    secret_key = os.getenv('SECRET_KEY')
    
    if not database_url:
        print("  ❌ DATABASE_URL not set")
        return False
    
    if secret_key == 'your-secret-key-here-generate-a-strong-random-key':
        print("  ⚠️  WARNING: Using default SECRET_KEY (should be changed for production)")
    
    if 'neon.tech' in database_url:
        print("  ✅ Using Neon Postgres")
    elif 'localhost' in database_url:
        print("  ℹ️  Using local PostgreSQL")
    
    print("  ✅ Environment configuration looks good")
    return True

def main():
    """Run all validation tests"""
    print("🧪 Recipe Catalogue Backend Validation")
    print("=" * 50)
    
    tests = [
        test_environment,
        test_imports,
        test_database_connection,
        test_migration_status,
        test_app_creation
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"  💥 Test crashed: {str(e)}")
            failed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed! Your setup is ready.")
        print("🚀 You can now start the server with:")
        print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        return True
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)