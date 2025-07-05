#!/usr/bin/env python3
"""
Debug why API parsing differs from direct parsing
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from services.parsing_service import ParsingService
from core.database import SessionLocal

async def debug_api_parsing():
    """Debug the API parsing vs direct parsing"""
    db = SessionLocal()
    
    try:
        test_url = "https://www.halfbakedharvest.com/caesar-pesto-pasta/"
        
        print(f"🔍 Debugging API parsing for: {test_url}")
        print("=" * 60)
        
        # Test the full parsing service (what the API uses)
        parsing_service = ParsingService(db)
        result = await parsing_service.parse_from_url(test_url, "test-user-id")
        
        print(f"API Parsing Result:")
        print(f"Title: {result.get('title')}")
        print(f"Description: {result.get('description', '')[:100]}...")
        print(f"Confidence Score: {result.get('confidence_score')}")
        print(f"Prep/Cook/Total: {result.get('prep_time')}/{result.get('cook_time')}/{result.get('total_time')}")
        print(f"Servings: {result.get('servings')}")
        
        # Check media field specifically
        media = result.get('media')
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
        instructions = result.get('instructions', '')
        instruction_count = instructions.count('<li>')
        print(f"\nInstructions:")
        print(f"HTML length: {len(instructions)}")
        print(f"Step count: {instruction_count}")
        print(f"First 150 chars: {instructions[:150]}...")
        
        # Check ingredients format  
        ingredients = result.get('ingredients', '')
        ingredient_count = ingredients.count('<li>')
        print(f"\nIngredients:")
        print(f"HTML length: {len(ingredients)}")
        print(f"Item count: {ingredient_count}")
        print(f"First 150 chars: {ingredients[:150]}...")
        
    except Exception as e:
        print(f"❌ Debugging failed: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(debug_api_parsing())