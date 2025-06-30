#!/usr/bin/env python3
"""
Test JWT token generation and validation with the new secret key
"""

import sys
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_jwt_functionality():
    """Test JWT token creation and validation"""
    print("🔐 Testing JWT Token Generation with New Secret Key")
    print("=" * 55)
    
    try:
        # Import after loading env vars
        from app.core.security import create_access_token
        from app.core.config import settings
        from jose import jwt, JWTError
        
        # Validate secret key
        print(f"🔑 Secret key loaded: {len(settings.SECRET_KEY)} characters")
        print(f"🔧 Algorithm: {settings.ALGORITHM}")
        print(f"⏰ Token expiry: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
        
        # Test 1: Create a token
        print(f"\n📝 Test 1: Creating JWT Token")
        test_data = {
            "sub": "test@example.com",
            "user_id": str(uuid.uuid4()),
            "type": "access_token"
        }
        
        token = create_access_token(test_data)
        print(f"✅ Token created successfully")
        print(f"📏 Token length: {len(token)} characters")
        
        # Test 2: Decode and validate token
        print(f"\n🔍 Test 2: Decoding JWT Token")
        try:
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            print(f"✅ Token decoded successfully")
            print(f"👤 Subject: {decoded.get('sub')}")
            print(f"🆔 User ID: {decoded.get('user_id')}")
            print(f"📅 Expires: {datetime.fromtimestamp(decoded.get('exp'))}")
            
        except JWTError as e:
            print(f"❌ Token decode failed: {str(e)}")
            return False
        
        # Test 3: Test token with custom expiry
        print(f"\n⏱️ Test 3: Custom Expiry Token")
        custom_expiry = timedelta(hours=24)
        custom_token = create_access_token(test_data, custom_expiry)
        
        decoded_custom = jwt.decode(custom_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        exp_time = datetime.fromtimestamp(decoded_custom.get('exp'))
        print(f"✅ Custom expiry token created")
        print(f"📅 Custom expiry: {exp_time}")
        
        # Test 4: Test token tampering detection
        print(f"\n🛡️ Test 4: Tampering Detection")
        tampered_token = token[:-5] + "XXXXX"  # Tamper with the end
        try:
            jwt.decode(tampered_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            print(f"❌ ERROR: Tampered token was accepted!")
            return False
        except JWTError:
            print(f"✅ Tampered token correctly rejected")
        
        # Test 5: Wrong secret key detection
        print(f"\n🔐 Test 5: Wrong Secret Key Detection")
        wrong_secret = "wrong-secret-key"
        try:
            jwt.decode(token, wrong_secret, algorithms=[settings.ALGORITHM])
            print(f"❌ ERROR: Wrong secret key was accepted!")
            return False
        except JWTError:
            print(f"✅ Wrong secret key correctly rejected")
        
        print(f"\n🎉 All JWT tests passed! Your secret key is working correctly.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        print(f"Make sure you have installed all dependencies:")
        print(f"pip install python-jose[cryptography]")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_key_strength():
    """Test the strength of the current secret key"""
    print(f"\n🔍 Testing Secret Key Strength")
    print("=" * 35)
    
    try:
        from generate_secret_key import SecretKeyGenerator
        from app.core.config import settings
        
        validation = SecretKeyGenerator.validate_key_strength(settings.SECRET_KEY)
        
        print(f"📏 Key length: {validation['length_bytes']} bytes ({validation['length_bits']} bits)")
        print(f"✅ Meets minimum: {'Yes' if validation['meets_minimum'] else 'No'}")
        print(f"🔒 Recommended strength: {'Yes' if validation['recommended_strength'] else 'No'}")
        print(f"🎲 Entropy estimate: {validation['entropy_estimate']}")
        
        if validation['warnings']:
            print(f"\n⚠️ Warnings:")
            for warning in validation['warnings']:
                print(f"  - {warning}")
        
        if validation['valid']:
            print(f"\n✅ Secret key meets security requirements!")
        else:
            print(f"\n⚠️ Secret key could be improved.")
            
        return validation['valid']
        
    except Exception as e:
        print(f"❌ Key validation error: {str(e)}")
        return False

def test_environment_security():
    """Test overall environment security configuration"""
    print(f"\n🔧 Testing Environment Security")
    print("=" * 35)
    
    try:
        from app.core.config import settings
        
        issues = []
        recommendations = []
        
        # Check secret key
        if settings.SECRET_KEY == "your-secret-key-here-use-generate_secret_key.py-script":
            issues.append("SECRET_KEY is still using default value")
        
        # Check Clerk configuration
        if settings.CLERK_SECRET_KEY.startswith("sk_test_your_clerk"):
            recommendations.append("Update CLERK_SECRET_KEY with your actual Clerk secret")
        
        if settings.CLERK_PUBLISHABLE_KEY.startswith("pk_test_your_clerk"):
            recommendations.append("Update CLERK_PUBLISHABLE_KEY with your actual Clerk publishable key")
        
        # Check other settings
        if "localhost" in settings.DATABASE_URL:
            print("ℹ️ Using local database (development mode)")
        elif "neon.tech" in settings.DATABASE_URL:
            print("✅ Using Neon Postgres (production ready)")
        
        # Report results
        if issues:
            print(f"\n❌ Security Issues Found:")
            for issue in issues:
                print(f"  - {issue}")
        
        if recommendations:
            print(f"\n💡 Recommendations:")
            for rec in recommendations:
                print(f"  - {rec}")
        
        if not issues and not recommendations:
            print(f"✅ Environment security looks good!")
            
        return len(issues) == 0
        
    except Exception as e:
        print(f"❌ Environment check error: {str(e)}")
        return False

def main():
    """Run all security tests"""
    print("🔐 Recipe Catalogue Security Validation")
    print("=" * 45)
    
    tests_passed = 0
    total_tests = 3
    
    # Test JWT functionality
    if test_jwt_functionality():
        tests_passed += 1
    
    # Test key strength
    if test_key_strength():
        tests_passed += 1
    
    # Test environment security
    if test_environment_security():
        tests_passed += 1
    
    print(f"\n" + "=" * 45)
    print(f"📊 Security Test Results: {tests_passed}/{total_tests} passed")
    
    if tests_passed == total_tests:
        print(f"🎉 All security tests passed! Your application is secure.")
        return True
    else:
        print(f"⚠️ Some security tests failed. Please address the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)