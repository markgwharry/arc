from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import get_settings
from .api import items, events, quests, maps, loadouts
from .services.data_service import data_service

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: pre-load caches
    print("Loading Arc Raiders data...")
    await data_service.get_all_items()
    await data_service.get_all_quests()
    await data_service.get_all_maps()
    print("Data loaded successfully!")
    yield
    # Shutdown: cleanup
    await data_service.close()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
    Arc Raiders Companion API - A community-powered reference app for Arc Raiders.

    ## Features
    - **Item Database**: Search and browse 491+ items with stats, crafting recipes, and recycling yields
    - **Quest Guide**: Complete quest database with objectives, requirements, and rewards
    - **Interactive Maps**: All 5 maps with markers, extractions, and loot locations
    - **Loadout Builder**: Weapon stats, DPS calculations, and tier lists
    - **Events**: Current storms, merchant visits, and special events
    - **Traders**: Trader inventory and rotation schedules

    ## Data Sources
    - MetaForge API (metaforge.app)
    - ARDB API (ardb.app)
    - RaidTheory/arcraiders-data (GitHub)

    ## Attribution
    This app uses community-maintained data. Thanks to all contributors!
    """,
    lifespan=lifespan
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(items.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(quests.router, prefix="/api")
app.include_router(maps.router, prefix="/api")
app.include_router(loadouts.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/stats")
async def get_stats():
    """Get database statistics."""
    items_list = await data_service.get_all_items()
    categories = await data_service.get_categories()
    rarities = await data_service.get_rarities()
    quests_list = await data_service.get_all_quests()
    maps_list = await data_service.get_all_maps()
    weapons = await data_service.get_weapons()

    return {
        "total_items": len(items_list),
        "total_quests": len(quests_list),
        "total_maps": len(maps_list),
        "total_weapons": len(weapons),
        "categories": len(categories),
        "rarities": len(rarities),
        "data_sources": ["MetaForge", "ARDB", "RaidTheory"]
    }
