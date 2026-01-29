from pydantic import BaseModel
from typing import Optional


class MapMarker(BaseModel):
    id: str
    name: str
    type: str  # extraction, loot, enemy, quest, trader, landmark
    x: float  # coordinate
    y: float  # coordinate
    description: Optional[str] = None
    icon: Optional[str] = None
    items: list[str] = []  # Items that can be found here
    quests: list[str] = []  # Related quest IDs


class MapZone(BaseModel):
    id: str
    name: str
    type: str  # safe, danger, raid, etc.
    bounds: list[dict] = []  # Polygon coordinates
    threat_level: Optional[int] = None
    description: Optional[str] = None


class GameMap(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    markers: list[MapMarker] = []
    zones: list[MapZone] = []
    extractions: list[MapMarker] = []


class MapListResponse(BaseModel):
    maps: list[GameMap]
    total: int
