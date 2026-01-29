from fastapi import APIRouter
from ..services.data_service import data_service

router = APIRouter(prefix="/events", tags=["events"])


@router.get("")
async def get_events():
    """
    Get current and upcoming events.

    Includes storm schedules, merchant visits, and special events.
    """
    events = await data_service.fetch_events()
    return {"events": events}


@router.get("/traders")
async def get_traders():
    """
    Get trader information and current inventory.

    Includes trader locations, stock, and rotation schedules.
    """
    traders = await data_service.fetch_traders()
    return {"traders": traders}
