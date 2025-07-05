#!/usr/bin/env python3
"""
Debug why API and direct parsing give different results
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from services.parsers.url_parser import URLParser

async def debug_parsing_paths():
    """Debug which parsing path is being taken"""
    
    test_url = "https://www.halfbakedharvest.com/caesar-pesto-pasta/"
    
    print(f"🔍 Debugging parsing paths for: {test_url}")
    print("=" * 60)
    
    parser = URLParser()
    
    # First, test if recipe-scrapers works directly
    print("Testing recipe-scrapers directly...")
    try:
        from recipe_scrapers import scrape_me
        scraper = scrape_me(test_url)
        print(f"✅ Recipe-scrapers direct test successful")
        print(f"   Title: {scraper.title()}")
        print(f"   Instructions: {len(scraper.instructions_list())} steps")
        try:
            image = scraper.image()
            print(f"   Image: {image[:50] if image else 'None'}...")
        except:
            print(f"   Image: Failed to extract")
    except Exception as e:
        print(f"❌ Recipe-scrapers direct test failed: {e}")
    
    # Now test the parser with debug output
    print(f"\nTesting URLParser.parse()...")
    
    # Temporarily modify the parser to capture more debug info
    original_parse_with_scrapers = parser._parse_with_recipe_scrapers
    
    async def debug_parse_with_scrapers(url):
        print(f"🔄 Entering _parse_with_recipe_scrapers for {url}")
        try:
            result = await original_parse_with_scrapers(url)
            print(f"✅ Recipe-scrapers parser succeeded")
            print(f"   Media: {result.media}")
            print(f"   Instructions count: {result.instructions.count('<li>')}")
            return result
        except Exception as e:
            print(f"❌ Recipe-scrapers parser failed: {e}")
            import traceback
            print(f"Full traceback:\n{traceback.format_exc()}")
            raise
    
    # Monkey patch for debugging
    parser._parse_with_recipe_scrapers = debug_parse_with_scrapers
    
    try:
        result = await parser.parse(test_url)
        
        print(f"\nFinal result:")
        print(f"Media: {result.media}")
        print(f"Confidence: {result.confidence_score}")
        print(f"Instructions: {result.instructions.count('<li>')} steps")
        print(f"Instructions preview: {result.instructions[:100]}...")
        
    except Exception as e:
        print(f"❌ Parser failed completely: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_parsing_paths())