#!/usr/bin/env python3
"""
Test direct parsing without database dependencies
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from services.parsers.url_parser import URLParser

async def test_direct_parsing():
    """Test direct parser without database or validation pipeline"""
    
    test_url = "https://www.halfbakedharvest.com/caesar-pesto-pasta/"
    
    print(f"🔍 Testing direct URL parsing for: {test_url}")
    print("=" * 60)
    
    try:
        # Test direct URL parser (no database needed)
        parser = URLParser()
        result = await parser.parse(test_url)
        
        print(f"Direct Parser Result:")
        print(f"Title: {result.title}")
        print(f"Description: {result.description[:100] if result.description else 'None'}...")
        print(f"Confidence Score: {result.confidence_score}")
        print(f"Prep/Cook/Total: {result.prep_time}/{result.cook_time}/{result.total_time}")
        print(f"Servings: {result.servings}")
        
        # Check media field specifically
        media = result.media
        print(f"\nMedia field:")
        print(f"Type: {type(media)}")
        print(f"Value: {media}")
        
        if media and isinstance(media, dict) and media.get('images'):
            images = media['images']
            print(f"Images found: {len(images)}")
            for i, img in enumerate(images[:2], 1):
                print(f"  {i}. {img}")
        else:
            print("❌ No images found in media field")
        
        # Check instruction format
        instructions = result.instructions
        instruction_count = instructions.count('<li>')
        print(f"\nInstructions:")
        print(f"HTML length: {len(instructions)}")
        print(f"Step count: {instruction_count}")
        print(f"First 150 chars: {instructions[:150]}...")
        
        # Check ingredients format  
        ingredients = result.ingredients
        ingredient_count = ingredients.count('<li>')
        print(f"\nIngredients:")
        print(f"HTML length: {len(ingredients)}")
        print(f"Item count: {ingredient_count}")
        print(f"First 150 chars: {ingredients[:150]}...")
        
    except Exception as e:
        print(f"❌ Direct parsing failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_direct_parsing())