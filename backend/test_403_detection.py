#!/usr/bin/env python3
"""
Test script to verify 403 detection works properly
"""

import asyncio
import httpx
from app.services.parsers.url_parser import URLParser, WebsiteProtectionError

async def test_403_detection():
    """Test that 403 errors are properly detected and converted to WebsiteProtectionError"""
    
    # Test URL that should give 403
    url = "https://ohsheglows.com/quick-n-easy-no-bake-protein-bars/"
    
    print(f"Testing 403 detection for: {url}")
    print("-" * 60)
    
    # First, test direct HTTP request to see what we get
    print("1. Testing direct HTTP request...")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
        
        print(f"   ✅ HTTP request succeeded (Status: {response.status_code})")
        print(f"   Content length: {len(response.text)} characters")
        
        # Check if content looks like a blocked page
        blocked_indicators = ['access denied', 'forbidden', 'blocked', 'sign in', 'login']
        content_lower = response.text.lower()
        found_indicators = [indicator for indicator in blocked_indicators if indicator in content_lower]
        
        if found_indicators:
            print(f"   ⚠️  Found blocking indicators: {found_indicators}")
        else:
            print(f"   ℹ️  No obvious blocking indicators found")
            
    except httpx.HTTPStatusError as e:
        print(f"   ❌ HTTP error: {e.response.status_code} {e.response.reason_phrase}")
        if e.response.status_code == 403:
            print(f"   ✅ This confirms the site returns 403 Forbidden")
    except Exception as e:
        print(f"   ❌ Other error: {e}")
    
    # Now test the URL parser
    print("\n2. Testing URL Parser...")
    try:
        parser = URLParser(db=None)
        result = await parser.parse(url)
        
        print(f"   ❌ Unexpected success!")
        print(f"   Title: {result.title}")
        print(f"   Confidence: {result.confidence_score}")
        print(f"   Ingredients length: {len(result.ingredients) if result.ingredients else 0}")
        print(f"   Instructions length: {len(result.instructions) if result.instructions else 0}")
        
        # If we get here, check if it's a low-confidence result that should have been caught
        if result.confidence_score and result.confidence_score < 0.3:
            print(f"   ⚠️  Low confidence result - our detection should catch this")
        
    except WebsiteProtectionError as e:
        print(f"   ✅ WebsiteProtectionError caught correctly!")
        print(f"   Message: {e}")
        return True
        
    except Exception as e:
        print(f"   ❌ Unexpected error type: {type(e).__name__}: {e}")
        return False
    
    return False

if __name__ == "__main__":
    print("🔍 Testing 403 Forbidden Detection")
    print("=" * 60)
    
    async def run_test():
        success = await test_403_detection()
        
        print("\n" + "=" * 60)
        if success:
            print("✅ Test passed - WebsiteProtectionError properly detected!")
        else:
            print("❌ Test failed - 403 error not properly handled")
            print("\nThis means either:")
            print("1. The site doesn't actually return 403")
            print("2. Our detection logic needs adjustment")
            print("3. The site returns 200 with blocked content")
    
    asyncio.run(run_test())