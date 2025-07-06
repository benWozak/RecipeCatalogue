#!/usr/bin/env python3
"""
Test script to check 403 fix for ohsheglows.com
"""

import asyncio
import sys
from app.services.parsers.url_parser import URLParser

async def test_problematic_url():
    """Test the URL that was giving 403 errors"""
    
    url = "https://ohsheglows.com/quick-n-easy-no-bake-protein-bars/"
    
    print(f"Testing problematic URL: {url}")
    print("-" * 60)
    
    try:
        # Initialize parser
        parser = URLParser(db=None)
        
        # Try to parse the URL
        print("Attempting to parse with enhanced headers and retry logic...")
        result = await parser.parse(url)
        
        print("✅ Successfully parsed the URL!")
        print(f"Title: {result.title}")
        print(f"Description: {result.description[:100]}...")
        print(f"Source Type: {result.source_type}")
        print(f"Confidence Score: {result.confidence_score}")
        
        # Check ingredients and instructions
        if result.ingredients:
            print(f"Ingredients found: {len(result.ingredients.split('<li>'))} items")
        if result.instructions:
            print(f"Instructions found: {len(result.instructions.split('<li>'))} steps")
        
        # Check media
        if result.media and result.media.get('images'):
            print(f"Images found: {len(result.media['images'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Still failed to parse URL: {e}")
        return False

async def test_multiple_user_agents():
    """Test different user agents manually"""
    
    import httpx
    
    url = "https://ohsheglows.com/quick-n-easy-no-bake-protein-bars/"
    
    user_agents = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
    ]
    
    print("\nTesting individual user agents:")
    print("-" * 40)
    
    for i, user_agent in enumerate(user_agents, 1):
        try:
            headers = {
                'User-Agent': user_agent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0',
                'Referer': 'https://www.google.com/'
            }
            
            async with httpx.AsyncClient(follow_redirects=True) as client:
                response = await client.get(url, headers=headers, timeout=30.0)
                response.raise_for_status()
                
            print(f"✅ User Agent {i}: Success (Status: {response.status_code})")
            print(f"   Browser: {user_agent.split(')')[0]})...")
            
            # Check if we got actual content
            if len(response.text) > 1000 and 'recipe' in response.text.lower():
                print(f"   Content: Looks like valid recipe page ({len(response.text)} chars)")
            else:
                print(f"   Content: Suspicious response ({len(response.text)} chars)")
            
            return True
            
        except httpx.HTTPStatusError as e:
            print(f"❌ User Agent {i}: HTTP {e.response.status_code}")
        except Exception as e:
            print(f"❌ User Agent {i}: {type(e).__name__}: {e}")
        
        # Small delay between attempts
        await asyncio.sleep(1)
    
    return False

if __name__ == "__main__":
    print("🔍 Testing 403 Forbidden Fix")
    print("=" * 60)
    
    async def run_tests():
        # Test the enhanced parser
        success = await test_problematic_url()
        
        if not success:
            # Test individual user agents if parser failed
            await test_multiple_user_agents()
        
        print("\n" + "=" * 60)
        if success:
            print("✅ Tests completed - URL parsing should work now!")
        else:
            print("❌ Tests failed - URL may still have access restrictions")
            print("\nPossible solutions:")
            print("1. The website may require JavaScript execution")
            print("2. The website may use advanced bot detection")
            print("3. The website may require specific cookies or sessions")
            print("4. Consider using a proxy or rotating IP addresses")
    
    # Run the tests
    asyncio.run(run_tests())