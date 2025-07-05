#!/usr/bin/env python3
"""
Verify the API parsing fix by testing the complete flow
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from services.parsing_service import ParsingService
from services.parsers.validation_pipeline import ValidationPipeline

async def verify_fix():
    """Verify that the parsing + validation pipeline works correctly"""
    
    test_url = "https://www.halfbakedharvest.com/caesar-pesto-pasta/"
    
    print(f"🔍 Verifying complete parsing flow for: {test_url}")
    print("=" * 60)
    
    try:
        # Mock a database session (None for testing)
        mock_db = None
        
        # Create parsing service (this is what the API uses)
        parsing_service = ParsingService(mock_db)
        
        # This would normally fail due to database dependency, but we can test the core logic
        # Instead, let's manually replicate what parse_from_url does:
        
        # Step 1: Parse with URL parser
        parsed_recipe = await parsing_service.url_parser.parse(test_url)
        print(f"✅ Step 1 - URL Parser:")
        print(f"   Media: {bool(parsed_recipe.media)}")
        print(f"   Images: {len(parsed_recipe.media.get('images', [])) if parsed_recipe.media else 0}")
        print(f"   Confidence: {parsed_recipe.confidence_score}")
        print(f"   Instructions: {parsed_recipe.instructions.count('<li>')} steps")
        
        # Step 2: Apply validation 
        validation_result = parsing_service.validation_pipeline.validate_parsed_recipe(
            parsed_recipe, test_url, "test-user-id"
        )
        print(f"\n✅ Step 2 - Validation Pipeline:")
        print(f"   Status: {validation_result.validation_status}")
        print(f"   Issues: {len(validation_result.issues)}")
        print(f"   Media preserved: {bool(validation_result.parsed_recipe.media)}")
        
        # Step 3: Convert to legacy format
        final_result = parsing_service._convert_to_legacy_format(validation_result.parsed_recipe)
        print(f"\n✅ Step 3 - Legacy Format Conversion:")
        print(f"   Media field: {final_result.get('media')}")
        print(f"   Confidence: {final_result.get('confidence_score')}")
        print(f"   Instructions format: {final_result.get('instructions', '')[:50]}...")
        
        # Verify the key fixes
        success = True
        issues = []
        
        # Check 1: Media field should not be null
        if final_result.get('media') is None:
            issues.append("❌ Media field is null")
            success = False
        else:
            print(f"✅ Media field has content: {len(final_result['media'].get('images', []))} images")
        
        # Check 2: Confidence should be high
        if final_result.get('confidence_score', 0) < 0.8:
            issues.append(f"❌ Low confidence: {final_result.get('confidence_score')}")
            success = False
        else:
            print(f"✅ High confidence score: {final_result.get('confidence_score')}")
        
        # Check 3: Instructions should be properly formatted
        instructions = final_result.get('instructions', '')
        step_count = instructions.count('<li>')
        if step_count < 2:
            issues.append(f"❌ Instructions not properly formatted: {step_count} steps")
            success = False
        else:
            print(f"✅ Instructions properly formatted: {step_count} steps")
        
        print(f"\n{'🎉 ALL TESTS PASSED!' if success else '❌ ISSUES FOUND:'}")
        for issue in issues:
            print(f"   {issue}")
            
        if success:
            print(f"\nThe API parsing should now work correctly!")
            print(f"If the user still sees issues, it might be:")
            print(f"- Frontend caching old responses")
            print(f"- Testing a different URL")
            print(f"- Authentication/environment differences")
        
    except Exception as e:
        print(f"❌ Verification failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(verify_fix())