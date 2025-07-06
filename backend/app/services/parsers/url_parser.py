import json
import re
from typing import Dict, Any, List, Tuple, Optional
from .base_parser import BaseParser, ParsedRecipe


class WebsiteProtectionError(Exception):
    """Raised when a website blocks automated access with anti-bot protection"""
    pass

try:
    import httpx
    HTTP_AVAILABLE = True
except ImportError as e:
    print(f"Warning: httpx not available: {e}")
    httpx = None
    HTTP_AVAILABLE = False

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError as e:
    print(f"Warning: BeautifulSoup not available: {e}")
    BeautifulSoup = None
    BS4_AVAILABLE = False

try:
    from recipe_scrapers import scrape_me
    RECIPE_SCRAPERS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: recipe-scrapers not available: {e}")
    scrape_me = None
    RECIPE_SCRAPERS_AVAILABLE = False

# Ensure HTTP_AVAILABLE is properly set
HTTP_AVAILABLE = HTTP_AVAILABLE and BS4_AVAILABLE


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
                return result
            except Exception as e:
                # If recipe-scrapers fails, fall back to manual parsing
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
            result = self._parse_html_recipe(soup, url)
            
            # Check if we got a very low confidence result, which might indicate
            # we received a blocked/login page instead of the actual recipe
            if (result.confidence_score is not None and 
                result.confidence_score <= 0.3 and 
                (not result.ingredients or len(result.ingredients.strip()) < 50) and
                (not result.instructions or len(result.instructions.strip()) < 100)):
                
                # Check if the page content suggests it's a blocked page
                page_text = soup.get_text().lower()
                blocked_indicators = [
                    'access denied', 'forbidden', 'blocked', 'sign in', 'login', 
                    'subscribe', 'membership required', 'unauthorized access',
                    'please enable javascript', 'verify you are human'
                ]
                
                if any(indicator in page_text for indicator in blocked_indicators):
                    raise WebsiteProtectionError("This website requires authentication or blocks automated access. The recipe may be behind a login wall or subscription.")
                
                # If confidence is very low (0.3 or less) and we have minimal content,
                # it's likely the site is blocking us even without explicit indicators
                raise WebsiteProtectionError("Unable to parse recipe from this website. The site may be blocking automated access or the recipe content may not be accessible to our parser.")
            
            return result
            
        except WebsiteProtectionError as e:
            # Re-raise the website protection error as-is for special handling
            raise e
        except httpx.HTTPStatusError as e:
            # Handle HTTP status errors specifically
            if e.response.status_code == 403:
                raise WebsiteProtectionError("This website blocks automated access. The recipe may be available, but the site prevents our parser from reading it.")
            elif e.response.status_code == 404:
                raise Exception("Recipe page not found. The page may have moved or been deleted. Please check the URL and try again.")
            else:
                raise Exception(f"HTTP {e.response.status_code} error: {str(e)}")
        except Exception as e:
            error_msg = str(e)
            
            # Provide helpful suggestions for common issues
            if "403" in error_msg or "Forbidden" in error_msg:
                raise WebsiteProtectionError("This website blocks automated access. The recipe may be available, but the site prevents our parser from reading it.")
            elif "404" in error_msg or "Not Found" in error_msg:
                raise Exception("Recipe page not found. The page may have moved or been deleted. Please check the URL and try again.")
            elif "timeout" in error_msg.lower():
                raise Exception("The website is taking too long to respond. Please try again later.")
            else:
                raise Exception(f"Failed to parse recipe from URL: {error_msg}")
    
    async def _parse_with_recipe_scrapers(self, url: str) -> ParsedRecipe:
        """Parse recipe using recipe-scrapers library"""
        try:
            # Recipe-scrapers is synchronous, so we run it in a thread pool
            import asyncio
            loop = asyncio.get_event_loop()
            
            # Try with different request strategies for recipe-scrapers
            def scrape_with_headers():
                # recipe-scrapers uses requests internally, but we can try different approaches
                try:
                    return scrape_me(url)
                except Exception as e:
                    # If regular scraping fails, the error might be 403
                    # recipe-scrapers doesn't expose header customization easily
                    # so we'll let it fail and fall back to manual parsing
                    raise e
            
            scraper = await loop.run_in_executor(None, scrape_with_headers)
            
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
            
            # Create structured image data
            images = []
            if image_url:
                images.append({
                    "url": image_url,
                    "alt": "Recipe image",
                    "source": "recipe-scrapers"
                })
            
            # Safely get description with fallback
            description = ""
            try:
                description = scraper.description() or ""
            except (NotImplementedError, AttributeError):
                description = ""
            
            parsed_data = ParsedRecipe(
                title=scraper.title() or "Recipe from Web",
                description=description,
                source_type="website",
                source_url=url,
                prep_time=prep_time,
                cook_time=cook_time,
                total_time=total_time,
                servings=servings,
                instructions=instructions_html,
                ingredients=ingredients_html,
                media={"images": images} if images else None
            )
            
            validated_data = self._validate_parsed_data(parsed_data)
            
            # Check if recipe-scrapers failed to get meaningful content
            if (validated_data.confidence_score is not None and 
                validated_data.confidence_score <= 0.2 and 
                (not validated_data.ingredients or len(validated_data.ingredients.strip()) < 50) and
                (not validated_data.instructions or len(validated_data.instructions.strip()) < 100)):
                
                raise WebsiteProtectionError("Unable to parse recipe from this website. The site may be blocking automated access or the recipe content may not be accessible to our parser.")
            
            return validated_data
            
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
        
        validated_data = self._validate_parsed_data(parsed_data)
        
        # Check if JSON-LD parsing failed to get meaningful content
        if (validated_data.confidence_score is not None and 
            validated_data.confidence_score <= 0.2 and 
            (not validated_data.ingredients or len(validated_data.ingredients.strip()) < 50) and
            (not validated_data.instructions or len(validated_data.instructions.strip()) < 100)):
            
            raise WebsiteProtectionError("Unable to parse recipe from this website. The site may be blocking automated access or the recipe content may not be accessible to our parser.")
        
        return validated_data
    
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
        
        # Extract images from page
        image_urls = self._extract_images_from_page(soup, url)
        images = [{"url": img_url, "alt": "Recipe image", "source": "page-fallback"} for img_url in image_urls]
        
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
            ingredients=self._ingredients_to_html([(None, ingredients)]),
            media={"images": images} if images else None
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
        
        # Extract images from recipe section
        image_urls = self._extract_images_from_section(recipe_section, url)
        images = [{"url": img_url, "alt": "Recipe image", "source": "recipe-section"} for img_url in image_urls]
        
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
            ingredients=ingredients_html,
            media={"images": images} if images else None
        )
        
        validated_data = self._validate_parsed_data(parsed_data)
        
        # Check if recipe section parsing failed to get meaningful content
        if (validated_data.confidence_score is not None and 
            validated_data.confidence_score <= 0.2 and 
            (not validated_data.ingredients or len(validated_data.ingredients.strip()) < 50) and
            (not validated_data.instructions or len(validated_data.instructions.strip()) < 100)):
            
            raise WebsiteProtectionError("Unable to parse recipe from this website. The site may be blocking automated access or the recipe content may not be accessible to our parser.")
        
        return validated_data
    
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
    
    def _extract_images_from_section(self, section: BeautifulSoup, base_url: str) -> List[str]:
        """Extract images from recipe section with quality filtering"""
        images = []
        
        # Recipe-specific image selectors
        image_selectors = [
            '.recipe-image img',
            '.recipe-photo img', 
            '.wprm-recipe-image img',
            '.wp-block-recipe-image img',
            '.recipe-card-image img',
            '[itemprop="image"]',
            '.entry-content img',
            'img'  # Fallback to all images in section
        ]
        
        for selector in image_selectors:
            img_elements = section.select(selector)
            for img in img_elements:
                img_url = self._get_image_url(img, base_url)
                if img_url and self._is_valid_recipe_image(img, img_url):
                    if img_url not in images:  # Avoid duplicates
                        images.append(img_url)
                        if len(images) >= 3:  # Limit to 3 images
                            break
            if images:
                break  # Stop after finding images with first successful selector
        
        return images
    
    def _extract_images_from_page(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract images from entire page with comprehensive detection"""
        images = []
        
        # 1. Try meta tags first (usually highest quality)
        meta_images = self._extract_meta_tag_images(soup, base_url)
        images.extend(meta_images)
        
        # 2. Try JSON-LD structured data
        if not images:
            jsonld_images = self._extract_jsonld_images(soup, base_url)
            images.extend(jsonld_images)
        
        # 3. Look for recipe-specific images in the page
        if len(images) < 2:  # Get a few more if we don't have enough
            recipe_images = self._extract_recipe_images_from_page(soup, base_url)
            for img in recipe_images:
                if img not in images:
                    images.append(img)
                    if len(images) >= 3:
                        break
        
        return images[:3]  # Limit to 3 images max
    
    def _extract_meta_tag_images(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract images from meta tags (Open Graph, Twitter, etc.)"""
        images = []
        
        # Open Graph image
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            img_url = self._make_absolute_url(og_image.get('content'), base_url)
            if img_url:
                images.append(img_url)
        
        # Twitter Card image
        twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
        if twitter_image and twitter_image.get('content'):
            img_url = self._make_absolute_url(twitter_image.get('content'), base_url)
            if img_url and img_url not in images:
                images.append(img_url)
        
        # Schema.org meta image
        schema_image = soup.find('meta', attrs={'itemprop': 'image'})
        if schema_image and schema_image.get('content'):
            img_url = self._make_absolute_url(schema_image.get('content'), base_url)
            if img_url and img_url not in images:
                images.append(img_url)
        
        return images
    
    def _extract_jsonld_images(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract images from JSON-LD structured data"""
        images = []
        
        json_ld_scripts = soup.find_all('script', {'type': 'application/ld+json'})
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0]
                
                if data.get('@type') == 'Recipe':
                    image_data = data.get('image')
                    if image_data:
                        if isinstance(image_data, str):
                            img_url = self._make_absolute_url(image_data, base_url)
                            if img_url:
                                images.append(img_url)
                        elif isinstance(image_data, list):
                            for img in image_data:
                                img_url = img if isinstance(img, str) else img.get('url', '')
                                img_url = self._make_absolute_url(img_url, base_url)
                                if img_url and img_url not in images:
                                    images.append(img_url)
                                    if len(images) >= 3:
                                        break
                        elif isinstance(image_data, dict):
                            img_url = image_data.get('url', '')
                            img_url = self._make_absolute_url(img_url, base_url)
                            if img_url:
                                images.append(img_url)
            except:
                continue
        
        return images
    
    def _extract_recipe_images_from_page(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract recipe images from page content"""
        images = []
        
        # Look for images in recipe-related containers
        recipe_containers = [
            '.recipe', '.recipe-card', '.recipe-content', '.recipe-container',
            '.entry-content', '.post-content', '.main-content',
            '[itemtype*="Recipe"]', '.wp-block-recipe'
        ]
        
        for container_selector in recipe_containers:
            containers = soup.select(container_selector)
            for container in containers:
                img_elements = container.find_all('img')
                for img in img_elements:
                    img_url = self._get_image_url(img, base_url)
                    if img_url and self._is_valid_recipe_image(img, img_url):
                        if img_url not in images:
                            images.append(img_url)
                            if len(images) >= 3:
                                return images
        
        return images
    
    def _get_image_url(self, img_element, base_url: str) -> Optional[str]:
        """Extract image URL from img element, handling various attributes"""
        # Try different image URL attributes
        url_attrs = ['src', 'data-src', 'data-lazy-src', 'data-original']
        
        for attr in url_attrs:
            img_url = img_element.get(attr)
            if img_url:
                return self._make_absolute_url(img_url, base_url)
        
        return None
    
    def _make_absolute_url(self, url: str, base_url: str) -> Optional[str]:
        """Convert relative URLs to absolute URLs"""
        if not url:
            return None
        
        # Already absolute
        if url.startswith(('http://', 'https://')):
            return url
        
        # Protocol relative
        if url.startswith('//'):
            base_protocol = 'https:' if base_url.startswith('https:') else 'http:'
            return base_protocol + url
        
        # Relative URL
        from urllib.parse import urljoin
        return urljoin(base_url, url)
    
    def _is_valid_recipe_image(self, img_element, img_url: str) -> bool:
        """Determine if an image is likely a valid recipe image"""
        # Skip very small images (likely icons or thumbnails)
        width = img_element.get('width')
        height = img_element.get('height')
        
        if width and height:
            try:
                w, h = int(width), int(height)
                if w < 200 or h < 150:  # Skip small images
                    return False
            except:
                pass
        
        # Skip images that are likely ads or social media icons
        src_lower = img_url.lower()
        if any(skip in src_lower for skip in [
            'avatar', 'profile', 'icon', 'logo', 'banner', 'ad-', 'advertisement',
            'social', 'facebook', 'twitter', 'instagram', 'pinterest'
        ]):
            return False
        
        # Check alt text for recipe relevance
        alt_text = img_element.get('alt', '').lower()
        if alt_text:
            # Positive indicators
            if any(good in alt_text for good in [
                'recipe', 'food', 'dish', 'cooking', 'baked', 'cooked',
                'ingredients', 'meal', 'dinner', 'lunch', 'breakfast'
            ]):
                return True
            
            # Negative indicators
            if any(bad in alt_text for bad in [
                'author', 'profile', 'logo', 'icon', 'social', 'share',
                'advertisement', 'ad', 'banner'
            ]):
                return False
        
        # Check image file extension
        if any(ext in src_lower for ext in ['.jpg', '.jpeg', '.png', '.webp']):
            return True
        
        return True  # Default to true if no negative indicators