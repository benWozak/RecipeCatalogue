from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
import uuid

class MealType(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"

class MealPlanEntryBase(BaseModel):
    recipe_id: uuid.UUID
    date: date
    meal_type: MealType
    servings: int = 1

class MealPlanEntryCreate(MealPlanEntryBase):
    pass

class MealPlanEntry(MealPlanEntryBase):
    id: uuid.UUID
    meal_plan_id: uuid.UUID

    class Config:
        from_attributes = True

class MealPlanBase(BaseModel):
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class MealPlanCreate(MealPlanBase):
    entries: List[MealPlanEntryCreate] = []

class MealPlanUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    entries: Optional[List[MealPlanEntryCreate]] = None

class MealPlan(MealPlanBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    entries: List[MealPlanEntry] = []

    class Config:
        from_attributes = True