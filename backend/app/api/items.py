from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services.data_service import data_service
from ..models.items import Item, ItemSearchResponse

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=ItemSearchResponse)
async def search_items(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    subcategory: Optional[str] = Query(None, description="Filter by subcategory"),
    rarity: Optional[str] = Query(None, description="Filter by rarity"),
    trader: Optional[str] = Query(None, description="Filter by trader"),
    min_value: Optional[int] = Query(None, description="Minimum value"),
    max_value: Optional[int] = Query(None, description="Maximum value"),
    limit: int = Query(50, ge=1, le=200, description="Results per page"),
    offset: int = Query(0, ge=0, description="Pagination offset")
):
    """
    Search and filter items from the Arc Raiders database.

    - Full-text search across item names and descriptions
    - Filter by category, rarity, trader, and value range
    - Paginated results
    """
    items, total = await data_service.search_items(
        query=q,
        category=category,
        subcategory=subcategory,
        rarity=rarity,
        trader=trader,
        min_value=min_value,
        max_value=max_value,
        limit=limit,
        offset=offset
    )

    return ItemSearchResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/categories")
async def get_categories():
    """Get all available item categories."""
    categories = await data_service.get_categories()
    return {"categories": categories}


@router.get("/rarities")
async def get_rarities():
    """Get all available item rarities."""
    rarities = await data_service.get_rarities()
    return {"rarities": rarities}


@router.get("/{item_id}", response_model=Item)
async def get_item(item_id: str):
    """Get a specific item by ID."""
    item = await data_service.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.get("/{item_id}/related")
async def get_related_items(item_id: str, limit: int = Query(5, ge=1, le=20)):
    """Get items related to this one (same category, used in same quests, etc.)."""
    item = await data_service.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Find related items by category and quest requirements
    all_items = await data_service.get_all_items()
    related = []

    for other in all_items:
        if other.id == item_id:
            continue

        score = 0
        if other.category == item.category:
            score += 2
        if other.subcategory == item.subcategory:
            score += 1
        if other.rarity == item.rarity:
            score += 1
        if set(other.quest_requirements) & set(item.quest_requirements):
            score += 3

        if score > 0:
            related.append((score, other))

    related.sort(key=lambda x: x[0], reverse=True)
    return {"related": [item for _, item in related[:limit]]}
