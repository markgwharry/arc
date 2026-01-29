from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services.data_service import data_service
from ..models.maps import GameMap, MapListResponse

router = APIRouter(prefix="/maps", tags=["maps"])


@router.get("", response_model=MapListResponse)
async def get_maps():
    """
    Get all available maps.

    Returns basic info for each map including name, description, and thumbnail.
    """
    maps = await data_service.get_all_maps()
    return MapListResponse(maps=maps, total=len(maps))


@router.get("/{map_id}", response_model=GameMap)
async def get_map(map_id: str):
    """
    Get detailed map data including all markers, zones, and extractions.
    """
    game_map = await data_service.get_map_by_id(map_id)
    if not game_map:
        raise HTTPException(status_code=404, detail="Map not found")
    return game_map


@router.get("/{map_id}/markers")
async def get_map_markers(
    map_id: str,
    type: Optional[str] = Query(None, description="Filter by marker type")
):
    """
    Get markers for a specific map.

    Filter by type: extraction, loot, enemy, quest, trader, landmark
    """
    game_map = await data_service.get_map_by_id(map_id)
    if not game_map:
        raise HTTPException(status_code=404, detail="Map not found")

    markers = game_map.markers + game_map.extractions

    if type:
        markers = [m for m in markers if m.type == type]

    return {"markers": markers, "total": len(markers)}


@router.get("/{map_id}/extractions")
async def get_map_extractions(map_id: str):
    """Get all extraction points for a map."""
    game_map = await data_service.get_map_by_id(map_id)
    if not game_map:
        raise HTTPException(status_code=404, detail="Map not found")

    return {"extractions": game_map.extractions}


@router.get("/{map_id}/zones")
async def get_map_zones(map_id: str):
    """Get all zones for a map."""
    game_map = await data_service.get_map_by_id(map_id)
    if not game_map:
        raise HTTPException(status_code=404, detail="Map not found")

    return {"zones": game_map.zones}


@router.get("/{map_id}/loot")
async def get_map_loot_locations(map_id: str):
    """Get all loot spawn locations for a map."""
    game_map = await data_service.get_map_by_id(map_id)
    if not game_map:
        raise HTTPException(status_code=404, detail="Map not found")

    loot_markers = [m for m in game_map.markers if m.type in ("loot", "container", "spawn")]

    return {"loot_locations": loot_markers}


@router.get("/{map_id}/quests")
async def get_map_quests(map_id: str):
    """Get all quests associated with a map."""
    game_map = await data_service.get_map_by_id(map_id)
    if not game_map:
        raise HTTPException(status_code=404, detail="Map not found")

    # Get quests for this location
    quests, _ = await data_service.search_quests(location=game_map.name)

    # Also get quests referenced by map markers
    quest_ids_from_markers = set()
    for marker in game_map.markers:
        quest_ids_from_markers.update(marker.quests)

    marker_quests = []
    for quest_id in quest_ids_from_markers:
        quest = await data_service.get_quest_by_id(quest_id)
        if quest and quest not in quests:
            marker_quests.append(quest)

    return {
        "map_id": map_id,
        "map_name": game_map.name,
        "quests": quests + marker_quests
    }
