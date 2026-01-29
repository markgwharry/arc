from pydantic import BaseModel
from typing import Optional


class ItemStats(BaseModel):
    damage: Optional[float] = None
    fire_rate: Optional[float] = None
    accuracy: Optional[float] = None
    range: Optional[float] = None
    armor: Optional[float] = None
    durability: Optional[float] = None
    weight: Optional[float] = None


class CraftingRecipe(BaseModel):
    result_quantity: int = 1
    ingredients: dict[str, int] = {}
    crafting_time: Optional[int] = None
    required_hideout_level: Optional[int] = None


class RecycleYield(BaseModel):
    materials: dict[str, int] = {}


class Item(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    rarity: Optional[str] = None
    weight: Optional[float] = None
    value: Optional[int] = None
    stats: Optional[ItemStats] = None
    crafting: Optional[CraftingRecipe] = None
    recycle: Optional[RecycleYield] = None
    traders: list[str] = []
    quest_requirements: list[str] = []
    image_url: Optional[str] = None


class ItemSearchParams(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    rarity: Optional[str] = None
    trader: Optional[str] = None
    min_value: Optional[int] = None
    max_value: Optional[int] = None
    limit: int = 50
    offset: int = 0


class ItemSearchResponse(BaseModel):
    items: list[Item]
    total: int
    limit: int
    offset: int
