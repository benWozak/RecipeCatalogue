#!/usr/bin/env python3
"""
Test parsing with validation pipeline (no database)
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from services.parsers.url_parser import URLParser
from services.parsers.validation_pipeline import ValidationPipeline

async def test_with_validation():
    """Test parser with validation pipeline but no database"""
    
    test_url = "https://www.halfbakedharvest.com/caesar-pesto-pasta/"
    
    print(f"🔍 Testing URL parsing with validation for: {test_url}")
    print("=" * 60)
    
    try:
        # Step 1: Parse with URL parser
        parser = URLParser()
        parsed_recipe = await parser.parse(test_url)
        
        print(f"Step 1 - Direct Parser Result:")
        print(f"Media: {parsed_recipe.media}")
        print(f"Confidence: {parsed_recipe.confidence_score}")
        print(f"Instructions count: {parsed_recipe.instructions.count('<li>')}")
        
        # Step 2: Apply validation pipeline
        validation_pipeline = ValidationPipeline()
        validation_result = validation_pipeline.validate_parsed_recipe(
            parsed_recipe, test_url, "test-user-id"
        )
        
        print(f"\nStep 2 - After Validation Pipeline:")
        print(f"Status: {validation_result.validation_status}")
        print(f"Issues count: {len(validation_result.issues)}")
        
        # Print any issues
        for issue in validation_result.issues:
            print(f"  - {issue.severity}: {issue.message}")
        
        # Check the final recipe data
        final_recipe = validation_result.parsed_recipe
        print(f"\nFinal Recipe Data:")
        print(f"Media: {final_recipe.media}")
        print(f"Confidence: {final_recipe.confidence_score}")
        print(f"Instructions count: {final_recipe.instructions.count('<li>')}")
        
        # Step 3: Convert to legacy format (like the parsing service does)
        def convert_to_legacy_format(parsed_recipe):
            return {
                "title": parsed_recipe.title,
                "description": parsed_recipe.description,
                "source_type": parsed_recipe.source_type,
                "source_url": parsed_recipe.source_url,
                "prep_time": parsed_recipe.prep_time,
                "cook_time": parsed_recipe.cook_time,
                "total_time": parsed_recipe.total_time,
                "servings": parsed_recipe.servings,
                "instructions": parsed_recipe.instructions,
                "ingredients": parsed_recipe.ingredients,
                "confidence_score": parsed_recipe.confidence_score,
                "media": parsed_recipe.media
            }
        
        api_response = convert_to_legacy_format(final_recipe)
        
        print(f"\nStep 3 - Final API Response:")
        print(f"Media: {api_response['media']}")
        print(f"Confidence: {api_response['confidence_score']}")
        print(f"Instructions length: {len(api_response['instructions'])}")
        print(f"Instructions preview: {api_response['instructions'][:100]}...")
        
    except Exception as e:
        print(f"❌ Testing failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_with_validation())