import json
from typing import Dict, Any
from .base_parser import BaseParser, ParsedRecipe

try:
    import httpx
    from bs4 import BeautifulSoup
    HTTP_AVAILABLE = True
except ImportError:
    httpx = None
    BeautifulSoup = None
    HTTP_AVAILABLE = False


class URLParser(BaseParser):
    """Parser for recipe websites using URL scraping"""
    
    async def parse(self, url: str, **kwargs) -> ParsedRecipe:
        """Parse recipe from URL"""
        if not HTTP_AVAILABLE:
            raise ImportError("httpx and BeautifulSoup4 are required for URL parsing")
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=30.0)
                response.raise_for_status()
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Try to extract structured data first (JSON-LD)
            json_ld = soup.find('script', {'type': 'application/ld+json'})
            if json_ld:
                try:
                    data = json.loads(json_ld.string)
                    if isinstance(data, list):
                        data = data[0]
                    
                    if data.get('@type') == 'Recipe':
                        return self._parse_json_ld_recipe(data, url)
                except:
                    pass
            
            # Fallback to HTML parsing
            return self._parse_html_recipe(soup, url)
            
        except Exception as e:
            raise Exception(f"Failed to parse recipe from URL: {str(e)}")
    
    def _parse_json_ld_recipe(self, data: Dict[str, Any], url: str) -> ParsedRecipe:
        """Parse recipe from JSON-LD structured data"""
        parsed_data = ParsedRecipe(
            title=data.get("name", ""),
            description=data.get("description", ""),
            source_type="website",
            source_url=url,
            prep_time=self._parse_duration(data.get("prepTime")),
            cook_time=self._parse_duration(data.get("cookTime")),
            total_time=self._parse_duration(data.get("totalTime")),
            servings=self._parse_yield(data.get("recipeYield")),
            instructions={"steps": self._parse_instructions(data.get("recipeInstructions", []))},
            ingredients=self._parse_ingredients(data.get("recipeIngredient", []))
        )
        
        return self._validate_parsed_data(parsed_data)
    
    def _parse_html_recipe(self, soup: BeautifulSoup, url: str) -> ParsedRecipe:
        """Parse recipe from HTML using common selectors"""
        # Basic HTML parsing fallback
        title = soup.find('title')
        title_text = title.get_text().strip() if title else "Recipe from Web"
        
        # Try to find ingredients
        ingredients = []
        ingredient_selectors = [
            '.recipe-ingredient',
            '.ingredient',
            '[itemprop="recipeIngredient"]',
            '.ingredients li',
            '.recipe-ingredients li',
            '.ingredient-list li'
        ]
        
        for selector in ingredient_selectors:
            elements = soup.select(selector)
            if elements:
                ingredients = [elem.get_text().strip() for elem in elements if elem.get_text().strip()]
                break
        
        # Try to find instructions
        instructions = []
        instruction_selectors = [
            '.recipe-instruction',
            '.instruction',
            '[itemprop="recipeInstructions"]',
            '.instructions li',
            '.directions li',
            '.recipe-directions li',
            '.method li'
        ]
        
        for selector in instruction_selectors:
            elements = soup.select(selector)
            if elements:
                instructions = [elem.get_text().strip() for elem in elements if elem.get_text().strip()]
                break
        
        # Try to find description
        description = ""
        description_selectors = [
            '.recipe-description',
            '.description',
            '[itemprop="description"]',
            '.recipe-summary'
        ]
        
        for selector in description_selectors:
            element = soup.select_one(selector)
            if element:
                description = element.get_text().strip()
                break
        
        # Try to find timing information
        prep_time = self._extract_time_from_html(soup, ['prep-time', 'prepTime', 'prep_time'])
        cook_time = self._extract_time_from_html(soup, ['cook-time', 'cookTime', 'cook_time'])
        total_time = self._extract_time_from_html(soup, ['total-time', 'totalTime', 'total_time'])
        
        # Try to find servings
        servings = self._extract_servings_from_html(soup)
        
        parsed_data = ParsedRecipe(
            title=title_text,
            description=description,
            source_type="website",
            source_url=url,
            prep_time=prep_time,
            cook_time=cook_time,
            total_time=total_time,
            servings=servings,
            instructions={"steps": instructions},
            ingredients=[{"name": ing} for ing in ingredients]
        )
        
        return self._validate_parsed_data(parsed_data)
    
    def _extract_time_from_html(self, soup: BeautifulSoup, class_names: list) -> int:
        """Extract timing information from HTML"""
        for class_name in class_names:
            # Try class selectors
            element = soup.find(class_=class_name)
            if element:
                time_text = element.get_text().strip()
                parsed_time = self._parse_duration(time_text)
                if parsed_time:
                    return parsed_time
            
            # Try itemprop selectors
            element = soup.find(attrs={'itemprop': class_name})
            if element:
                time_text = element.get('datetime') or element.get_text().strip()
                parsed_time = self._parse_duration(time_text)
                if parsed_time:
                    return parsed_time
        
        return None
    
    def _extract_servings_from_html(self, soup: BeautifulSoup) -> int:
        """Extract serving information from HTML"""
        serving_selectors = [
            '.servings',
            '.serves',
            '.recipe-yield',
            '[itemprop="recipeYield"]'
        ]
        
        for selector in serving_selectors:
            element = soup.select_one(selector)
            if element:
                servings_text = element.get_text().strip()
                parsed_servings = self._parse_yield(servings_text)
                if parsed_servings:
                    return parsed_servings
        
        return None