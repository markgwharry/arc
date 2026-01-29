from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services.data_service import data_service
from ..models.loadouts import Weapon, ArmorPiece, WeaponDPSCalculation

router = APIRouter(prefix="/loadouts", tags=["loadouts"])


@router.get("/weapons")
async def get_weapons(
    type: Optional[str] = Query(None, description="Filter by weapon type"),
    rarity: Optional[str] = Query(None, description="Filter by rarity")
):
    """
    Get all weapons with their stats.

    Filter by type (rifle, smg, shotgun, etc.) or rarity.
    """
    weapons = await data_service.get_weapons()

    if type:
        type_lower = type.lower()
        weapons = [w for w in weapons if w.type and type_lower in w.type.lower()]

    if rarity:
        weapons = [w for w in weapons if w.rarity == rarity]

    # Add DPS calculations
    weapons_with_dps = []
    for weapon in weapons:
        dps = data_service.calculate_weapon_dps(weapon)
        weapons_with_dps.append({
            **weapon.model_dump(),
            "calculated_dps": dps
        })

    # Sort by DPS
    weapons_with_dps.sort(key=lambda x: x["calculated_dps"], reverse=True)

    return {"weapons": weapons_with_dps, "total": len(weapons_with_dps)}


@router.get("/weapons/{weapon_id}")
async def get_weapon(weapon_id: str):
    """Get detailed weapon stats and DPS calculation."""
    weapons = await data_service.get_weapons()
    weapon = next((w for w in weapons if w.id == weapon_id), None)

    if not weapon:
        raise HTTPException(status_code=404, detail="Weapon not found")

    dps = data_service.calculate_weapon_dps(weapon)

    return {
        "weapon": weapon,
        "dps_calculation": WeaponDPSCalculation(
            weapon_id=weapon.id,
            base_dps=round((weapon.base_damage * weapon.fire_rate) / 60, 2) if weapon.fire_rate > 0 else weapon.base_damage,
            modded_dps=dps,  # Same as base for now (no mods applied)
            effective_dps=dps,
            time_to_kill={
                "no_armor": round(100 / dps, 2) if dps > 0 else 0,
                "light_armor": round(150 / dps, 2) if dps > 0 else 0,
                "heavy_armor": round(250 / dps, 2) if dps > 0 else 0
            }
        )
    }


@router.get("/weapons/compare")
async def compare_weapons(
    weapon_ids: str = Query(..., description="Comma-separated weapon IDs")
):
    """Compare multiple weapons side by side."""
    ids = [id.strip() for id in weapon_ids.split(",")]
    weapons = await data_service.get_weapons()

    comparison = []
    for weapon_id in ids:
        weapon = next((w for w in weapons if w.id == weapon_id), None)
        if weapon:
            dps = data_service.calculate_weapon_dps(weapon)
            comparison.append({
                **weapon.model_dump(),
                "calculated_dps": dps
            })

    return {"comparison": comparison}


@router.get("/armor")
async def get_armor(
    slot: Optional[str] = Query(None, description="Filter by armor slot"),
    rarity: Optional[str] = Query(None, description="Filter by rarity")
):
    """
    Get all armor pieces with their stats.

    Filter by slot (head, chest, legs) or rarity.
    """
    armor = await data_service.get_armor()

    if slot:
        slot_lower = slot.lower()
        armor = [a for a in armor if a.slot and slot_lower in a.slot.lower()]

    if rarity:
        armor = [a for a in armor if a.rarity == rarity]

    # Sort by armor value
    armor.sort(key=lambda x: x.armor_value, reverse=True)

    return {"armor": armor, "total": len(armor)}


@router.get("/armor/{armor_id}")
async def get_armor_piece(armor_id: str):
    """Get detailed armor piece stats."""
    armor_list = await data_service.get_armor()
    armor = next((a for a in armor_list if a.id == armor_id), None)

    if not armor:
        raise HTTPException(status_code=404, detail="Armor not found")

    return {"armor": armor}


@router.post("/calculate")
async def calculate_loadout_stats(loadout: dict):
    """
    Calculate total stats for a loadout.

    Expects a loadout object with weapon_ids and armor_ids arrays.
    """
    weapon_ids = loadout.get("weapon_ids", [])
    armor_ids = loadout.get("armor_ids", [])

    weapons = await data_service.get_weapons()
    armor_list = await data_service.get_armor()

    total_dps = 0
    total_armor = 0
    total_weight = 0

    selected_weapons = []
    for wid in weapon_ids:
        weapon = next((w for w in weapons if w.id == wid), None)
        if weapon:
            selected_weapons.append(weapon)
            total_dps += data_service.calculate_weapon_dps(weapon)

    selected_armor = []
    for aid in armor_ids:
        armor = next((a for a in armor_list if a.id == aid), None)
        if armor:
            selected_armor.append(armor)
            total_armor += armor.armor_value
            total_weight += armor.weight

    # Movement penalty based on weight
    movement_penalty = min(total_weight * 0.5, 30)  # Max 30% penalty

    # Survivability score (simplified)
    survivability = total_armor * (1 - movement_penalty / 100)

    return {
        "weapons": selected_weapons,
        "armor": selected_armor,
        "stats": {
            "total_dps": round(total_dps, 2),
            "total_armor": round(total_armor, 2),
            "total_weight": round(total_weight, 2),
            "movement_penalty": round(movement_penalty, 1),
            "survivability_score": round(survivability, 2)
        }
    }


@router.get("/tier-list")
async def get_weapon_tier_list():
    """Get weapons organized by tier based on DPS."""
    weapons = await data_service.get_weapons()

    weapons_with_dps = []
    for weapon in weapons:
        dps = data_service.calculate_weapon_dps(weapon)
        weapons_with_dps.append({
            **weapon.model_dump(),
            "calculated_dps": dps
        })

    # Sort by DPS
    weapons_with_dps.sort(key=lambda x: x["calculated_dps"], reverse=True)

    # Assign tiers based on DPS percentile
    total = len(weapons_with_dps)
    if total == 0:
        return {"tiers": {}}

    tiers = {"S": [], "A": [], "B": [], "C": [], "D": []}

    for i, weapon in enumerate(weapons_with_dps):
        percentile = i / total
        if percentile < 0.1:
            tiers["S"].append(weapon)
        elif percentile < 0.3:
            tiers["A"].append(weapon)
        elif percentile < 0.55:
            tiers["B"].append(weapon)
        elif percentile < 0.8:
            tiers["C"].append(weapon)
        else:
            tiers["D"].append(weapon)

    return {"tiers": tiers}
