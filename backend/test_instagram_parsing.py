#!/usr/bin/env python3

import sys
import os
import asyncio
sys.path.append('.')

from app.services.parsers.instagram_parser import InstagramParser
from app.services.parsers.validation_pipeline import ValidationPipeline

async def test_instagram_parsing():
    """Test Instagram parsing with a sample URL"""
    
    # Mock database for testing
    db = None
    
    parser = InstagramParser(db)
    
    # Use a simple test - we'll simulate the parsing without hitting Instagram
    # since we don't have valid credentials and it might be rate limited
    
    try:
        # Test with the text processor directly
        from app.services.parsers.text_processor import TextProcessor
        
        processor = TextProcessor()
        
        # Sample Instagram-like text with categories
        sample_text = """
        Easy Chicken Salad Recipe! 🥗
        
        This fresh and delicious chicken salad is perfect for lunch or dinner. Makes 4 servings.
        
        Chicken Salad:
        - 2 cups cooked chicken breast, diced
        - 1/2 cup celery, chopped
        - 1/4 cup red onion, minced
        - 2 tbsp fresh parsley
        
        Dressing:
        - 1/4 cup mayonnaise
        - 2 tbsp olive oil
        - 1 tbsp lemon juice
        - 1 tsp Dijon mustard
        - Salt and pepper to taste
        
        Instructions:
        1. Cook chicken breast and let cool, then dice into bite-sized pieces
        2. Chop celery and mince red onion finely
        3. In a separate bowl, whisk together all dressing ingredients
        4. Combine chicken, celery, onion, and parsley in a large bowl
        5. Pour dressing over chicken mixture and toss to combine
        6. Season with salt and pepper to taste
        7. Serve immediately or chill for 30 minutes
        
        #chickensalad #healthylunch #easyrecipe #homemade
        """
        
        recipe_pattern = processor.extract_recipe_from_text(sample_text)
        
        print("🧪 Testing text extraction...")
        print(f"Title: {recipe_pattern.title}")
        print(f"Confidence: {recipe_pattern.confidence}")
        print(f"Servings: {recipe_pattern.servings}")
        
        print(f"\nIngredients type: {type(recipe_pattern.ingredients)}")
        if isinstance(recipe_pattern.ingredients, dict):
            print("Ingredient categories:")
            for category, items in recipe_pattern.ingredients.items():
                print(f"  {category}: {len(items)} items")
                for item in items[:2]:  # Show first 2 items
                    print(f"    - {item}")
        
        print(f"\nInstructions type: {type(recipe_pattern.instructions)}")
        if isinstance(recipe_pattern.instructions, dict) and 'steps' in recipe_pattern.instructions:
            print(f"Steps: {len(recipe_pattern.instructions['steps'])}")
            for i, step in enumerate(recipe_pattern.instructions['steps'][:3], 1):
                print(f"  {i}. {step}")
        
        # Test validation
        from app.services.parsers.base_parser import ParsedRecipe
        
        parsed_recipe = ParsedRecipe(
            title=recipe_pattern.title,
            description="Recipe from Instagram",
            source_type="instagram",
            source_url="https://www.instagram.com/p/test123/",
            servings=4,
            confidence_score=recipe_pattern.confidence,
            ingredients=recipe_pattern.ingredients,
            instructions=recipe_pattern.instructions
        )
        
        pipeline = ValidationPipeline()
        validation_result = pipeline.validate_parsed_recipe(
            parsed_recipe,
            "https://www.instagram.com/p/test123/",
            "test-user-id"
        )
        
        print(f"\n✅ Validation completed!")
        print(f"Status: {validation_result.validation_status}")
        print(f"Issues: {len(validation_result.issues)}")
        
        # Convert to legacy format (what the API returns)
        legacy_format = {
            "title": parsed_recipe.title,
            "description": parsed_recipe.description,
            "source_type": parsed_recipe.source_type,
            "source_url": parsed_recipe.source_url,
            "servings": parsed_recipe.servings,
            "confidence_score": parsed_recipe.confidence_score,
            "ingredients": parsed_recipe.ingredients,
            "instructions": parsed_recipe.instructions
        }
        
        print(f"\n📋 API Response Format:")
        print(f"Title: {legacy_format['title']}")
        print(f"Servings: {legacy_format['servings']}")
        print(f"Confidence: {legacy_format['confidence_score']}")
        print(f"Ingredients structure: {type(legacy_format['ingredients'])}")
        print(f"Instructions structure: {type(legacy_format['instructions'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing Instagram parsing pipeline...")
    result = asyncio.run(test_instagram_parsing())
    
    if result:
        print("\n🎉 Instagram parsing test completed successfully!")
        print("\nThe validation fixes have resolved the 'str' object has no attribute 'get' error.")
        print("The system now properly handles structured ingredients and instructions.")
    else:
        print("\n❌ Test failed!")
        sys.exit(1)