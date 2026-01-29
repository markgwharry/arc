from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services.data_service import data_service
from ..models.quests import Quest, QuestSearchResponse

router = APIRouter(prefix="/quests", tags=["quests"])


@router.get("", response_model=QuestSearchResponse)
async def search_quests(
    q: Optional[str] = Query(None, description="Search query"),
    giver: Optional[str] = Query(None, description="Filter by quest giver"),
    type: Optional[str] = Query(None, description="Filter by quest type"),
    location: Optional[str] = Query(None, description="Filter by location/map"),
    limit: int = Query(50, ge=1, le=200, description="Results per page"),
    offset: int = Query(0, ge=0, description="Pagination offset")
):
    """
    Search and filter quests.

    - Full-text search across quest names and descriptions
    - Filter by giver, type, and location
    - Paginated results
    """
    quests, total = await data_service.search_quests(
        query=q,
        giver=giver,
        quest_type=type,
        location=location,
        limit=limit,
        offset=offset
    )

    return QuestSearchResponse(
        quests=quests,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/givers")
async def get_quest_givers():
    """Get all quest givers (NPCs/traders)."""
    givers = await data_service.get_quest_givers()
    return {"givers": givers}


@router.get("/types")
async def get_quest_types():
    """Get all quest types."""
    quests = await data_service.get_all_quests()
    types = {q.type for q in quests if q.type}
    return {"types": sorted(list(types))}


@router.get("/locations")
async def get_quest_locations():
    """Get all quest locations."""
    quests = await data_service.get_all_quests()
    locations = {q.location for q in quests if q.location}
    return {"locations": sorted(list(locations))}


@router.get("/{quest_id}", response_model=Quest)
async def get_quest(quest_id: str):
    """Get a specific quest by ID."""
    quest = await data_service.get_quest_by_id(quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    return quest


@router.get("/{quest_id}/requirements")
async def get_quest_requirements(quest_id: str):
    """Get all items required for a quest."""
    quest = await data_service.get_quest_by_id(quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    # Get full item details for required items
    required_items = []
    for item_req in quest.required_items:
        item_id = item_req.get("id") or item_req.get("item_id")
        if item_id:
            item = await data_service.get_item_by_id(item_id)
            if item:
                required_items.append({
                    "item": item,
                    "count": item_req.get("count", 1)
                })

    return {
        "quest_id": quest_id,
        "quest_name": quest.name,
        "required_items": required_items
    }


@router.get("/{quest_id}/chain")
async def get_quest_chain(quest_id: str):
    """Get the full quest chain (prerequisites and follow-ups)."""
    quest = await data_service.get_quest_by_id(quest_id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    all_quests = await data_service.get_all_quests()

    # Find prerequisites
    prerequisites = []
    for prereq_id in quest.prerequisites:
        prereq = await data_service.get_quest_by_id(prereq_id)
        if prereq:
            prerequisites.append(prereq)

    # Find quests that have this quest as a prerequisite
    follow_ups = [
        q for q in all_quests
        if quest_id in q.prerequisites
    ]

    return {
        "quest": quest,
        "prerequisites": prerequisites,
        "follow_ups": follow_ups
    }
