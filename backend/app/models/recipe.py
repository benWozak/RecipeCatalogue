from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Table, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

source_type_enum = ENUM('manual', 'website', 'instagram', 'image', name='source_type_enum', create_type=True)

recipe_tags = Table(
    'recipe_tags',
    Base.metadata,
    Column('recipe_id', UUID(as_uuid=True), ForeignKey('recipes.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', UUID(as_uuid=True), ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    prep_time = Column(Integer)
    cook_time = Column(Integer)
    total_time = Column(Integer)
    servings = Column(Integer)
    difficulty = Column(String)
    source_type = Column(source_type_enum, default='manual')
    source_url = Column(String)
    media = Column(JSONB)
    instructions = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    ingredients = relationship("Ingredient", back_populates="recipe", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=recipe_tags, back_populates="recipes")

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipe_id = Column(UUID(as_uuid=True), ForeignKey('recipes.id', ondelete='CASCADE'), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(DECIMAL)
    unit = Column(String)
    notes = Column(Text)
    order_index = Column(Integer)

    recipe = relationship("Recipe", back_populates="ingredients")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    color = Column(String)

    recipes = relationship("Recipe", secondary=recipe_tags, back_populates="tags")

