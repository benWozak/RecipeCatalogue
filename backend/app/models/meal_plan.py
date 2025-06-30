from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

meal_type_enum = ENUM('breakfast', 'lunch', 'dinner', 'snack', name='meal_type_enum', create_type=True)

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    name = Column(String, nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    entries = relationship("MealPlanEntry", back_populates="meal_plan", cascade="all, delete-orphan")

class MealPlanEntry(Base):
    __tablename__ = "meal_plan_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meal_plan_id = Column(UUID(as_uuid=True), ForeignKey('meal_plans.id', ondelete='CASCADE'), nullable=False)
    recipe_id = Column(UUID(as_uuid=True), ForeignKey('recipes.id'), nullable=False)
    date = Column(Date)
    meal_type = Column(meal_type_enum)
    servings = Column(Integer, default=1)

    meal_plan = relationship("MealPlan", back_populates="entries")
    recipe = relationship("Recipe")