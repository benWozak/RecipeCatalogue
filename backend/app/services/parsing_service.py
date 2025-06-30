from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup
import re
from app.schemas.recipe import RecipeCreate, IngredientCreate
from app.core.config import settings

class ParsingService:
    def __init__(self, db: Session):
        self.db = db

    async def parse_from_url(self, url: str) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=30.0)
                response.raise_for_status()
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Try to extract structured data first (JSON-LD)
            json_ld = soup.find('script', {'type': 'application/ld+json'})
            if json_ld:
                import json
                try:
                    data = json.loads(json_ld.string)
                    if isinstance(data, list):
                        data = data[0]
                    
                    if data.get('@type') == 'Recipe':
                        return self._parse_json_ld_recipe(data)
                except:
                    pass
            
            # Fallback to HTML parsing
            return self._parse_html_recipe(soup, url)
            
        except Exception as e:
            raise Exception(f"Failed to parse recipe from URL: {str(e)}")

    async def parse_from_instagram(self, url: str) -> Dict[str, Any]:
        # Placeholder for Instagram parsing
        # In a real implementation, you would use Instagram's API
        return {
            "title": "Instagram Recipe",
            "description": "Recipe parsed from Instagram post",
            "source_type": "instagram",
            "source_url": url,
            "instructions": {"steps": ["Please add recipe steps manually"]},
            "ingredients": []
        }

    async def parse_from_image(self, image_data: bytes) -> Dict[str, Any]:
        # Placeholder for OCR image parsing
        # In a real implementation, you would use Google Cloud Vision or similar
        return {
            "title": "Recipe from Image",
            "description": "Recipe parsed from uploaded image",
            "source_type": "image",
            "instructions": {"steps": ["Please add recipe steps manually"]},
            "ingredients": []
        }

    def _parse_json_ld_recipe(self, data: Dict[str, Any]) -> Dict[str, Any]:
        recipe_data = {
            "title": data.get("name", ""),
            "description": data.get("description", ""),
            "source_type": "website",
            "prep_time": self._parse_duration(data.get("prepTime")),
            "cook_time": self._parse_duration(data.get("cookTime")),
            "total_time": self._parse_duration(data.get("totalTime")),
            "servings": self._parse_yield(data.get("recipeYield")),
            "instructions": {"steps": self._parse_instructions(data.get("recipeInstructions", []))},
            "ingredients": self._parse_ingredients(data.get("recipeIngredient", []))
        }
        
        return recipe_data

    def _parse_html_recipe(self, soup: BeautifulSoup, url: str) -> Dict[str, Any]:
        # Basic HTML parsing fallback
        title = soup.find('title')
        title_text = title.get_text().strip() if title else "Recipe from Web"
        
        # Try to find ingredients
        ingredients = []
        ingredient_selectors = [
            '.recipe-ingredient',
            '.ingredient',
            '[itemprop="recipeIngredient"]',
            '.ingredients li'
        ]
        
        for selector in ingredient_selectors:
            elements = soup.select(selector)
            if elements:
                ingredients = [elem.get_text().strip() for elem in elements]
                break
        
        # Try to find instructions
        instructions = []
        instruction_selectors = [
            '.recipe-instruction',
            '.instruction',
            '[itemprop="recipeInstructions"]',
            '.instructions li',
            '.directions li'
        ]
        
        for selector in instruction_selectors:
            elements = soup.select(selector)
            if elements:
                instructions = [elem.get_text().strip() for elem in elements]
                break
        
        return {
            "title": title_text,
            "description": "",
            "source_type": "website",
            "source_url": url,
            "instructions": {"steps": instructions},
            "ingredients": [{"name": ing} for ing in ingredients]
        }

    def _parse_duration(self, duration_str: Optional[str]) -> Optional[int]:
        if not duration_str:
            return None
        
        # Parse ISO 8601 duration (PT15M) or simple formats
        if duration_str.startswith('PT'):
            # ISO 8601 format
            match = re.search(r'(\d+)H', duration_str)
            hours = int(match.group(1)) if match else 0
            match = re.search(r'(\d+)M', duration_str)
            minutes = int(match.group(1)) if match else 0
            return hours * 60 + minutes
        
        # Try to extract number from string
        match = re.search(r'(\d+)', str(duration_str))
        return int(match.group(1)) if match else None

    def _parse_yield(self, yield_data) -> Optional[int]:
        if not yield_data:
            return None
        
        if isinstance(yield_data, (int, float)):
            return int(yield_data)
        
        if isinstance(yield_data, str):
            match = re.search(r'(\d+)', yield_data)
            return int(match.group(1)) if match else None
        
        return None

    def _parse_instructions(self, instructions_data) -> list:
        instructions = []
        
        for instruction in instructions_data:
            if isinstance(instruction, str):
                instructions.append(instruction.strip())
            elif isinstance(instruction, dict):
                text = instruction.get('text', '') or instruction.get('name', '')
                if text:
                    instructions.append(text.strip())
        
        return instructions

    def _parse_ingredients(self, ingredients_data) -> list:
        ingredients = []
        
        for ingredient in ingredients_data:
            if isinstance(ingredient, str):
                # Simple parsing of ingredient string
                ingredient_text = ingredient.strip()
                ingredients.append({"name": ingredient_text})
            elif isinstance(ingredient, dict):
                # Structured ingredient data
                name = ingredient.get('name', ingredient.get('text', ''))
                if name:
                    ingredients.append({"name": name.strip()})
        
        return ingredients