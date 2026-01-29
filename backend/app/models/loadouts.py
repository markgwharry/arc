from pydantic import BaseModel
from typing import Optional


class WeaponMod(BaseModel):
    id: str
    name: str
    slot: str  # barrel, grip, sight, magazine, etc.
    stats_modifier: dict = {}  # e.g., {"accuracy": 5, "recoil": -3}
    compatible_weapons: list[str] = []


class Weapon(BaseModel):
    id: str
    name: str
    type: str  # assault_rifle, smg, shotgun, sniper, pistol, etc.
    rarity: Optional[str] = None
    base_damage: float
    fire_rate: float  # rounds per minute
    accuracy: float  # percentage
    recoil: float
    range: float
    magazine_size: int
    reload_time: float  # seconds
    mod_slots: list[str] = []  # Available mod slot types
    image_url: Optional[str] = None


class ArmorPiece(BaseModel):
    id: str
    name: str
    slot: str  # head, chest, legs, etc.
    rarity: Optional[str] = None
    armor_value: float
    durability: float
    weight: float
    special_effects: list[str] = []
    image_url: Optional[str] = None


class LoadoutSlot(BaseModel):
    slot_type: str  # primary, secondary, head, chest, legs, backpack
    item_id: Optional[str] = None
    mods: list[str] = []  # Mod IDs attached


class Loadout(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    slots: list[LoadoutSlot] = []
    total_weight: Optional[float] = None
    total_armor: Optional[float] = None
    created_by: Optional[str] = None


class LoadoutStats(BaseModel):
    total_dps: float
    effective_range: float
    total_armor: float
    total_weight: float
    movement_penalty: float
    survivability_score: float


class WeaponDPSCalculation(BaseModel):
    weapon_id: str
    base_dps: float
    modded_dps: float
    effective_dps: float  # Accounting for accuracy/reload
    time_to_kill: dict = {}  # Against different armor levels
