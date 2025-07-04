import json
import re
from typing import Dict, Any, List, Tuple, Optional
from .base_parser import BaseParser, ParsedRecipe

try:
    import httpx
    from bs4 import BeautifulSoup
    from recipe_scrapers import scrape_me
    HTTP_AVAILABLE = True
    RECIPE_SCRAPERS_AVAILABLE = True
except ImportError:
    httpx = None
    BeautifulSoup = None
    scrape_me = None
    HTTP_AVAILABLE = False
    RECIPE_SCRAPERS_AVAILABLE = False


class URLParser(BaseParser):
    """Parser for recipe websites using URL scraping"""
    
    async def parse(self, url: str, **kwargs) -> ParsedRecipe:
        """Parse recipe from URL"""
        if not HTTP_AVAILABLE:
            raise ImportError("httpx and BeautifulSoup4 are required for URL parsing")
        
        # Try recipe-scrapers first (supports 500+ sites)
        if RECIPE_SCRAPERS_AVAILABLE:
            try:
                result = await self._parse_with_recipe_scrapers(url)
                print(f"Recipe-scrapers succeeded for {url}")
                return result
            except Exception as e:
                # If recipe-scrapers fails, fall back to manual parsing
                print(f"Recipe-scrapers failed for {url}: {str(e)}")
                import traceback
                print(f"Full traceback: {traceback.format_exc()}")
                pass
        
        # Fallback to manual parsing
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=30.0)
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
            
            # Try Jump to Recipe approach
            recipe_section = self._find_recipe_section_via_jump_link(soup)
            if recipe_section:
                return self._parse_recipe_section(recipe_section, url)
            
            # Fallback to HTML parsing
            return self._parse_html_recipe(soup, url)
            
        except Exception as e:
            raise Exception(f"Failed to parse recipe from URL: {str(e)}")
    
    async def _parse_with_recipe_scrapers(self, url: str) -> ParsedRecipe:
        """Parse recipe using recipe-scrapers library"""
        try:
            # Recipe-scrapers is synchronous, so we run it in a thread pool
            import asyncio
            loop = asyncio.get_event_loop()
            scraper = await loop.run_in_executor(None, scrape_me, url)
            
            # Extract ingredients and convert to HTML
            ingredients = scraper.ingredients() or []
            ingredients_html = self._ingredients_to_html([(None, ingredients)])
            
            # Extract instructions and convert to HTML
            instructions = scraper.instructions_list() or []
            # Split concatenated instructions if they come as a single string
            instructions = self._split_instructions(instructions)
            instructions_html = self._instructions_to_html(instructions)
            
            # Parse timing information
            prep_time = None
            cook_time = None
            total_time = None
            
            try:
                prep_time = scraper.prep_time()
            except:
                pass
            
            try:
                cook_time = scraper.cook_time()
            except:
                pass
            
            try:
                total_time = scraper.total_time()
            except:
                pass
            
            # Parse servings
            servings = None
            try:
                servings = scraper.yields()
                # Convert to integer if it's a string like "4 servings"
                if isinstance(servings, str):
                    servings = self._parse_yield(servings)
            except:
                pass
            
            # Extract image URL
            image_url = None
            try:
                image_url = scraper.image()
            except:
                pass
            
            parsed_data = ParsedRecipe(
                title=scraper.title() or "Recipe from Web",
                description=scraper.description() or "",
                source_type="website",
                source_url=url,
                prep_time=prep_time,
                cook_time=cook_time,
                total_time=total_time,
                servings=servings,
                instructions=instructions_html,
                ingredients=ingredients_html,
                media={"images": [image_url]} if image_url else None
            )
            
            return self._validate_parsed_data(parsed_data)
            
        except Exception as e:
            raise Exception(f"Recipe-scrapers parsing failed: {str(e)}")
    
    def _parse_json_ld_recipe(self, data: Dict[str, Any], url: str) -> ParsedRecipe:
        """Parse recipe from JSON-LD structured data"""
        # Parse ingredients and instructions as structured data first
        ingredients_list = self._parse_ingredients(data.get("recipeIngredient", []))
        instructions_list = self._parse_instructions(data.get("recipeInstructions", []))
        
        parsed_data = ParsedRecipe(
            title=data.get("name", ""),
            description=data.get("description", ""),
            source_type="website",
            source_url=url,
            prep_time=self._parse_duration(data.get("prepTime")),
            cook_time=self._parse_duration(data.get("cookTime")),
            total_time=self._parse_duration(data.get("totalTime")),
            servings=self._parse_yield(data.get("recipeYield")),
            instructions=self._instructions_to_html(instructions_list),
            ingredients=self._ingredients_to_html([(None, [ing["name"] for ing in ingredients_list])])
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
            # Schema.org structured data
            '[itemprop="recipeIngredient"]',
            # Common class names
            '.recipe-ingredient',
            '.ingredient',
            '.recipe-ingredients li',
            '.ingredients li',
            '.ingredient-list li',
            '.recipe-ingredient-list li',
            # Modern recipe sites
            '[data-ingredient]',
            '.wp-block-recipe-ingredient',
            '.recipe-card-ingredients li',
            '.entry-summary .ingredients li',
            # JSON-LD alternative selectors
            '.recipe-summary .ingredient',
            '.recipe-directions .ingredient',
            # Fallback patterns
            'ul li:contains("cup")',
            'ul li:contains("tablespoon")',
            'ul li:contains("teaspoon")'
        ]
        
        for selector in ingredient_selectors:
            elements = soup.select(selector)
            if elements:
                ingredients = [elem.get_text().strip() for elem in elements if elem.get_text().strip()]
                break
        
        # Try to find instructions
        instructions = []
        instruction_selectors = [
            # Schema.org structured data
            '[itemprop="recipeInstructions"]',
            # Common class names
            '.recipe-instruction',
            '.instruction',
            '.instructions li',
            '.directions li',
            '.recipe-directions li',
            '.method li',
            '.recipe-method li',
            # Modern recipe sites
            '.wp-block-recipe-instruction',
            '.recipe-card-instructions li',
            '.recipe-card-directions li',
            '.entry-summary .instructions li',
            '[data-instruction]',
            # Alternative patterns
            '.recipe-summary .direction',
            '.preparation-steps li',
            '.cooking-directions li',
            # Numbered step patterns
            '.step',
            '.recipe-step',
            '[class*="step-"]'
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
            instructions=self._instructions_to_html(instructions),
            ingredients=self._ingredients_to_html([(None, ingredients)])
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
    
    def _ingredients_to_html(self, categorized_ingredients: List[Tuple[Optional[str], List[str]]]) -> str:
        """Convert categorized ingredients to HTML with enhanced processing"""
        if not categorized_ingredients:
            return ""
        
        html_parts = []
        
        for category, items in categorized_ingredients:
            if category:
                # Add category as heading
                html_parts.append(f"<h3>{category}</h3>")
            
            if items:
                # Clean and enhance ingredients
                cleaned_items = []
                for item in items:
                    cleaned_item = self._clean_ingredient_text(item)
                    if cleaned_item:
                        cleaned_items.append(cleaned_item)
                
                if cleaned_items:
                    # Add ingredients as unordered list
                    list_items = "".join(f"<li>{item}</li>" for item in cleaned_items)
                    html_parts.append(f"<ul>{list_items}</ul>")
        
        return "".join(html_parts)
    
    def _clean_ingredient_text(self, ingredient: str) -> str:
        """Clean and enhance ingredient text"""
        if not ingredient:
            return ""
        
        # Remove extra whitespace
        ingredient = ingredient.strip()
        
        # Remove common prefixes that might come from parsing
        prefixes_to_remove = ['- ', '• ', '* ', '◦ ', '▪ ', '▫ ']
        for prefix in prefixes_to_remove:
            if ingredient.startswith(prefix):
                ingredient = ingredient[len(prefix):].strip()
        
        # Remove trailing punctuation (except for important ones like ".")
        ingredient = ingredient.rstrip(',:;')
        
        # Capitalize first letter if it's not already
        if ingredient and ingredient[0].islower():
            ingredient = ingredient[0].upper() + ingredient[1:]
        
        return ingredient
    
    def _instructions_to_html(self, instructions: List[str]) -> str:
        """Convert instructions to HTML ordered list with enhanced processing"""
        if not instructions:
            return ""
        
        # Clean and enhance instructions
        cleaned_instructions = []
        for instruction in instructions:
            cleaned = self._clean_instruction_text(instruction)
            if cleaned:
                cleaned_instructions.append(cleaned)
        
        if not cleaned_instructions:
            return ""
        
        # Create ordered list
        list_items = "".join(f"<li>{instruction}</li>" for instruction in cleaned_instructions)
        return f"<ol>{list_items}</ol>"
    
    def _clean_instruction_text(self, instruction: str) -> str:
        """Clean and enhance instruction text"""
        if not instruction:
            return ""
        
        # Remove extra whitespace
        instruction = instruction.strip()
        
        # Remove existing numbering (1., 2., Step 1, etc.)
        instruction = re.sub(r'^\d+\.\s*', '', instruction)
        instruction = re.sub(r'^Step\s*\d+:?\s*', '', instruction, flags=re.IGNORECASE)
        instruction = re.sub(r'^\d+\)\s*', '', instruction)
        
        # Remove common prefixes
        prefixes_to_remove = ['- ', '• ', '* ', '◦ ', '▪ ', '▫ ']
        for prefix in prefixes_to_remove:
            if instruction.startswith(prefix):
                instruction = instruction[len(prefix):].strip()
        
        # Capitalize first letter if it's not already
        if instruction and instruction[0].islower():
            instruction = instruction[0].upper() + instruction[1:]
        
        # Ensure proper sentence ending
        if instruction and not instruction.endswith(('.', '!', '?')):
            instruction += '.'
        
        # Clean up extra spaces
        instruction = re.sub(r'\s+', ' ', instruction)
        
        return instruction
    
    def _split_instructions(self, instructions: List[str]) -> List[str]:
        """Split concatenated instructions into individual steps"""
        if not instructions:
            return []
        
        # If we only have one instruction but it contains numbered steps, split it
        if len(instructions) == 1 and instructions[0]:
            instruction_text = instructions[0]
            
            # Look for numbered patterns: "1. " "2. " etc.
            # Split on numbered steps but keep the numbers
            parts = re.split(r'(\d+\.)', instruction_text)
            
            if len(parts) > 2:  # We found numbered steps
                split_instructions = []
                current_step = ""
                
                for i, part in enumerate(parts):
                    if re.match(r'\d+\.', part):  # This is a step number
                        if current_step.strip():  # Save previous step
                            split_instructions.append(current_step.strip())
                        current_step = ""  # Start new step (don't include the number)
                    else:
                        current_step += part
                
                # Add the last step
                if current_step.strip():
                    split_instructions.append(current_step.strip())
                
                # Filter out empty steps
                split_instructions = [step for step in split_instructions if step.strip()]
                
                if len(split_instructions) > 1:
                    return split_instructions
        
        return instructions
    
    def _find_recipe_section_via_jump_link(self, soup: BeautifulSoup) -> Optional[BeautifulSoup]:
        """Find recipe section by following 'Jump to Recipe' links"""
        jump_to_recipe_patterns = [
            'jump to recipe',
            'skip to recipe', 
            'go to recipe',
            'recipe card',
            'jump to card',
            'recipe below',
            'scroll to recipe',
            'view recipe',
            'get recipe'
        ]
        
        # Look for links with jump to recipe text
        for link in soup.find_all('a', href=True):
            link_text = link.get_text().lower().strip()
            if any(pattern in link_text for pattern in jump_to_recipe_patterns):
                href = link.get('href')
                if href.startswith('#'):
                    target_id = href[1:]  # Remove the #
                    target_element = soup.find(id=target_id)
                    if target_element:
                        print(f"Found recipe section via jump link: #{target_id}")
                        return target_element
        
        # Also look for buttons with data attributes
        for button in soup.find_all('button'):
            button_text = button.get_text().lower().strip()
            if any(pattern in button_text for pattern in jump_to_recipe_patterns):
                # Look for data-target or similar attributes
                for attr in ['data-target', 'data-href', 'data-anchor']:
                    target = button.get(attr, '')
                    if target.startswith('#'):
                        target_id = target[1:]
                        target_element = soup.find(id=target_id)
                        if target_element:
                            print(f"Found recipe section via button: #{target_id}")
                            return target_element
        
        return None
    
    def _parse_recipe_section(self, recipe_section: BeautifulSoup, url: str) -> ParsedRecipe:
        """Parse recipe data from a targeted recipe section"""
        # Extract title - look in the section first, then fall back to page title
        title = ""
        title_selectors = ['h1', 'h2', '.recipe-title', '.wprm-recipe-name', '[itemprop="name"]']
        for selector in title_selectors:
            title_elem = recipe_section.select_one(selector)
            if title_elem:
                title = title_elem.get_text().strip()
                break
        
        if not title:
            # Fallback to page title
            page_title = recipe_section.find_parent().find('title')
            title = page_title.get_text().strip() if page_title else "Recipe from Web"
        
        # Extract description
        description = ""
        desc_selectors = ['.recipe-description', '.wprm-recipe-summary', '[itemprop="description"]', '.recipe-summary']
        for selector in desc_selectors:
            desc_elem = recipe_section.select_one(selector)
            if desc_elem:
                description = desc_elem.get_text().strip()
                break
        
        # Extract timing information
        prep_time = self._extract_time_from_section(recipe_section, ['prep', 'preparation'])
        cook_time = self._extract_time_from_section(recipe_section, ['cook', 'cooking', 'bake', 'baking'])
        total_time = self._extract_time_from_section(recipe_section, ['total', 'ready'])
        
        # Extract servings
        servings = self._extract_servings_from_section(recipe_section)
        
        # Extract ingredients with better section targeting
        ingredients = self._extract_ingredients_from_section(recipe_section)
        ingredients_html = self._ingredients_to_html([(None, ingredients)])
        
        # Extract instructions with better section targeting
        instructions = self._extract_instructions_from_section(recipe_section)
        instructions_html = self._instructions_to_html(instructions)
        
        parsed_data = ParsedRecipe(
            title=title,
            description=description,
            source_type="website",
            source_url=url,
            prep_time=prep_time,
            cook_time=cook_time,
            total_time=total_time,
            servings=servings,
            instructions=instructions_html,
            ingredients=ingredients_html
        )
        
        return self._validate_parsed_data(parsed_data)
    
    def _extract_time_from_section(self, section: BeautifulSoup, time_types: List[str]) -> Optional[int]:
        """Extract timing information from recipe section"""
        for time_type in time_types:
            # Look for various patterns
            selectors = [
                f'.{time_type}-time',
                f'.wprm-recipe-{time_type}-time',
                f'[itemprop="{time_type}Time"]',
                f'[class*="{time_type}"]'
            ]
            
            for selector in selectors:
                elements = section.select(selector)
                for elem in elements:
                    # Look for time value in element or nearby elements
                    time_text = elem.get_text().strip()
                    
                    # Also check data attributes
                    for attr in ['data-minutes', 'data-value', 'datetime']:
                        attr_value = elem.get(attr)
                        if attr_value:
                            parsed_time = self._parse_duration(attr_value)
                            if parsed_time:
                                return parsed_time
                    
                    # Parse the text content
                    parsed_time = self._parse_duration(time_text)
                    if parsed_time:
                        return parsed_time
        
        return None
    
    def _extract_servings_from_section(self, section: BeautifulSoup) -> Optional[int]:
        """Extract serving information from recipe section"""
        selectors = [
            '.servings',
            '.serves', 
            '.wprm-recipe-servings',
            '[itemprop="recipeYield"]',
            '.recipe-yield',
            '.yield'
        ]
        
        for selector in selectors:
            elements = section.select(selector)
            for elem in elements:
                # Check data attributes first
                for attr in ['data-servings', 'data-serves', 'data-value']:
                    attr_value = elem.get(attr)
                    if attr_value:
                        parsed_servings = self._parse_yield(attr_value)
                        if parsed_servings:
                            return parsed_servings
                
                # Parse text content
                servings_text = elem.get_text().strip()
                parsed_servings = self._parse_yield(servings_text)
                if parsed_servings:
                    return parsed_servings
        
        return None
    
    def _extract_ingredients_from_section(self, section: BeautifulSoup) -> List[str]:
        """Extract ingredients from recipe section with better targeting"""
        ingredients = []
        
        # Look for ingredient containers first
        ingredient_containers = [
            '.wprm-recipe-ingredients',
            '.recipe-ingredients',
            '.ingredients',
            '[itemprop="recipeIngredient"]'
        ]
        
        for container_selector in ingredient_containers:
            container = section.select_one(container_selector)
            if container:
                # Look for individual ingredients within the container
                ingredient_items = container.select('li, .ingredient, .wprm-recipe-ingredient')
                if ingredient_items:
                    for item in ingredient_items:
                        ingredient_text = item.get_text().strip()
                        if ingredient_text and len(ingredient_text) > 2:
                            ingredients.append(ingredient_text)
                    break
        
        # If no container found, look for ingredients directly
        if not ingredients:
            ingredient_selectors = [
                '.wprm-recipe-ingredient',
                '[itemprop="recipeIngredient"]',
                '.recipe-ingredient'
            ]
            
            for selector in ingredient_selectors:
                elements = section.select(selector)
                if elements:
                    for elem in elements:
                        ingredient_text = elem.get_text().strip()
                        if ingredient_text and len(ingredient_text) > 2:
                            ingredients.append(ingredient_text)
                    break
        
        return ingredients
    
    def _extract_instructions_from_section(self, section: BeautifulSoup) -> List[str]:
        """Extract instructions from recipe section with better targeting"""
        instructions = []
        
        # Look for instruction containers first
        instruction_containers = [
            '.wprm-recipe-instructions',
            '.recipe-instructions',
            '.instructions',
            '.directions',
            '.method'
        ]
        
        for container_selector in instruction_containers:
            container = section.select_one(container_selector)
            if container:
                # Look for individual instructions within the container
                instruction_items = container.select('li, .instruction, .wprm-recipe-instruction, .direction, .step')
                if instruction_items:
                    for item in instruction_items:
                        instruction_text = item.get_text().strip()
                        if instruction_text and len(instruction_text) > 10:  # Instructions are usually longer
                            instructions.append(instruction_text)
                    break
        
        # If no container found, look for instructions directly
        if not instructions:
            instruction_selectors = [
                '.wprm-recipe-instruction',
                '[itemprop="recipeInstructions"]',
                '.recipe-instruction',
                '.direction'
            ]
            
            for selector in instruction_selectors:
                elements = section.select(selector)
                if elements:
                    for elem in elements:
                        instruction_text = elem.get_text().strip()
                        if instruction_text and len(instruction_text) > 10:
                            instructions.append(instruction_text)
                    break
        
        return instructions