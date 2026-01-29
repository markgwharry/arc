from pydantic import BaseModel
from typing import Optional


class QuestObjective(BaseModel):
    description: str
    type: str  # kill, collect, deliver, explore, etc.
    target: Optional[str] = None
    count: Optional[int] = None
    location: Optional[str] = None


class QuestReward(BaseModel):
    experience: Optional[int] = None
    currency: Optional[int] = None
    items: list[dict] = []
    reputation: Optional[dict] = None


class Quest(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    giver: Optional[str] = None  # NPC/trader who gives the quest
    type: Optional[str] = None  # main, side, daily, weekly
    level_requirement: Optional[int] = None
    prerequisites: list[str] = []  # Quest IDs required before this one
    objectives: list[QuestObjective] = []
    required_items: list[dict] = []  # Items needed to complete
    rewards: Optional[QuestReward] = None
    location: Optional[str] = None  # Primary map/area
    image_url: Optional[str] = None


class QuestSearchParams(BaseModel):
    query: Optional[str] = None
    giver: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    limit: int = 50
    offset: int = 0


class QuestSearchResponse(BaseModel):
    quests: list[Quest]
    total: int
    limit: int
    offset: int
