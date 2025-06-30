#!/usr/bin/env python3

import sys
import os
sys.path.append('.')

from app.services.parsers.base_parser import ParsedRecipe
from app.services.parsers.validation_pipeline import ValidationPipeline

def test_structured_validation():
    """Test validation with structured ingredients and instructions"""
    
    # Create a test recipe with structured format
    test_recipe = ParsedRecipe(
        title="Test Chicken Salad Recipe",
        description="A delicious chicken salad with fresh vegetables",
        source_type="instagram",
        source_url="https://www.instagram.com/p/test123/",
        servings=4,
        confidence_score=0.75,
        # Structured ingredients with categories
        ingredients={
            "Chicken Salad": [
                "2 cups cooked chicken breast, diced",
                "1/2 cup celery, chopped",
                "1/4 cup red onion, minced"
            ],
            "Dressing": [
                "1/4 cup mayonnaise",
                "2 tbsp olive oil",
                "1 tbsp lemon juice",
                "Salt and pepper to taste"
            ]
        },
        # Structured instructions
        instructions={
            "steps": [
                "Cook chicken breast and let cool, then dice into bite-sized pieces",
                "Chop celery and mince red onion finely",
                "In a separate bowl, whisk together mayonnaise, olive oil, and lemon juice",
                "Combine chicken, celery, and onion in a large bowl",
                "Pour dressing over chicken mixture and toss to combine",
                "Season with salt and pepper to taste"
            ]
        }
    )
    
    # Test validation
    pipeline = ValidationPipeline()
    try:
        validation_result = pipeline.validate_parsed_recipe(
            test_recipe, 
            "https://www.instagram.com/p/test123/",
            "test-user-id"
        )
        
        print("✅ Validation passed!")
        print(f"Status: {validation_result.validation_status}")
        print(f"Issues found: {len(validation_result.issues)}")
        for issue in validation_result.issues:
            print(f"  - {issue.severity}: {issue.message}")
        
        print(f"Confidence: {validation_result.parsed_recipe.confidence_score}")
        print(f"Title: {validation_result.parsed_recipe.title}")
        
        # Test ingredient structure
        ingredients = validation_result.parsed_recipe.ingredients
        print(f"Ingredients type: {type(ingredients)}")
        if isinstance(ingredients, dict):
            print(f"Ingredient categories: {list(ingredients.keys())}")
            total_ingredients = sum(len(items) for items in ingredients.values() if isinstance(items, list))
            print(f"Total ingredients: {total_ingredients}")
        
        # Test instruction structure
        instructions = validation_result.parsed_recipe.instructions
        print(f"Instructions type: {type(instructions)}")
        if isinstance(instructions, dict) and 'steps' in instructions:
            print(f"Total steps: {len(instructions['steps'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Validation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_legacy_format():
    """Test validation with legacy flat list format"""
    
    test_recipe = ParsedRecipe(
        title="Legacy Recipe",
        description="Test legacy format",
        source_type="url",
        confidence_score=0.6,
        # Legacy flat list format
        ingredients={
            "ingredients": [
                "1 cup flour",
                "2 eggs",
                "1/2 cup milk"
            ]
        },
        instructions={
            "steps": [
                "Mix flour and eggs",
                "Add milk gradually",
                "Cook until done"
            ]
        }
    )
    
    pipeline = ValidationPipeline()
    try:
        validation_result = pipeline.validate_parsed_recipe(
            test_recipe, 
            "https://example.com/recipe",
            "test-user-id"
        )
        
        print("✅ Legacy format validation passed!")
        print(f"Status: {validation_result.validation_status}")
        print(f"Issues: {len(validation_result.issues)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Legacy validation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing structured recipe validation...")
    test1 = test_structured_validation()
    
    print("\nTesting legacy format validation...")
    test2 = test_legacy_format()
    
    if test1 and test2:
        print("\n🎉 All validation tests passed!")
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)