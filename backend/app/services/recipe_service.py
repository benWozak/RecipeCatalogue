from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from app.models.recipe import Recipe, Ingredient, Tag
from app.schemas.recipe import RecipeCreate, RecipeUpdate
import uuid

class RecipeService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_recipes(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        tags: Optional[List[str]] = None,
        difficulty: Optional[str] = None
    ) -> List[Recipe]:
        query = self.db.query(Recipe).filter(Recipe.user_id == user_id)
        
        if search:
            query = query.filter(
                or_(
                    Recipe.title.ilike(f"%{search}%"),
                    Recipe.description.ilike(f"%{search}%")
                )
            )
        
        if tags:
            query = query.join(Recipe.tags).filter(Tag.name.in_(tags))
        
        if difficulty:
            query = query.filter(Recipe.difficulty == difficulty)
        
        return query.offset(skip).limit(limit).all()

    def get_recipe(self, recipe_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Recipe]:
        return self.db.query(Recipe).filter(
            and_(Recipe.id == recipe_id, Recipe.user_id == user_id)
        ).first()

    def create_recipe(self, recipe_data: RecipeCreate, user_id: uuid.UUID) -> Recipe:
        recipe_dict = recipe_data.dict(exclude={'ingredients', 'tags'})
        recipe = Recipe(**recipe_dict, user_id=user_id)
        
        self.db.add(recipe)
        self.db.flush()

        for ingredient_data in recipe_data.ingredients:
            ingredient = Ingredient(**ingredient_data.dict(), recipe_id=recipe.id)
            self.db.add(ingredient)

        for tag_name in recipe_data.tags:
            tag = self.db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                self.db.add(tag)
                self.db.flush()
            recipe.tags.append(tag)

        self.db.commit()
        self.db.refresh(recipe)
        return recipe

    def update_recipe(
        self, 
        recipe_id: uuid.UUID, 
        recipe_update: RecipeUpdate, 
        user_id: uuid.UUID
    ) -> Optional[Recipe]:
        recipe = self.get_recipe(recipe_id, user_id)
        if not recipe:
            return None

        update_data = recipe_update.dict(exclude_unset=True, exclude={'ingredients', 'tags'})
        for field, value in update_data.items():
            setattr(recipe, field, value)

        if recipe_update.ingredients is not None:
            for ingredient in recipe.ingredients:
                self.db.delete(ingredient)
            
            for ingredient_data in recipe_update.ingredients:
                ingredient = Ingredient(**ingredient_data.dict(), recipe_id=recipe.id)
                self.db.add(ingredient)

        if recipe_update.tags is not None:
            recipe.tags.clear()
            for tag_name in recipe_update.tags:
                tag = self.db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    self.db.add(tag)
                    self.db.flush()
                recipe.tags.append(tag)

        self.db.commit()
        self.db.refresh(recipe)
        return recipe

    def delete_recipe(self, recipe_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        recipe = self.get_recipe(recipe_id, user_id)
        if not recipe:
            return False
        
        self.db.delete(recipe)
        self.db.commit()
        return True