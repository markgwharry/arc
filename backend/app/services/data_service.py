import httpx
from typing import Optional
from cachetools import TTLCache
from ..core.config import get_settings
from ..models.items import Item, ItemStats, CraftingRecipe, RecycleYield

settings = get_settings()

# In-memory cache (fallback when Redis unavailable)
_items_cache: TTLCache = TTLCache(maxsize=1000, ttl=settings.cache_ttl_items)
_events_cache: TTLCache = TTLCache(maxsize=100, ttl=settings.cache_ttl_events)
_traders_cache: TTLCache = TTLCache(maxsize=50, ttl=settings.cache_ttl_traders)


class ArcDataService:
    """Service for fetching Arc Raiders data from community APIs."""

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        self._all_items: list[Item] = []
        self._categories: set[str] = set()
        self._rarities: set[str] = set()

    async def close(self):
        await self.client.aclose()

    async def fetch_items_from_metaforge(self) -> list[dict]:
        """Fetch items from MetaForge API."""
        try:
            response = await self.client.get(
                f"{settings.metaforge_api_url}/items",
                params={"limit": 1000}
            )
            response.raise_for_status()
            data = response.json()
            return data.get("items", data) if isinstance(data, dict) else data
        except Exception as e:
            print(f"MetaForge API error: {e}")
            return []

    async def fetch_items_from_ardb(self) -> list[dict]:
        """Fetch items from ARDB API (backup source)."""
        try:
            response = await self.client.get(f"{settings.ardb_api_url}/items")
            response.raise_for_status()
            data = response.json()
            return data.get("items", data) if isinstance(data, dict) else data
        except Exception as e:
            print(f"ARDB API error: {e}")
            return []

    def _normalize_item(self, raw: dict, source: str) -> Item:
        """Normalize item data from different sources into unified format."""
        # Handle different field names from different APIs
        item_id = raw.get("id") or raw.get("_id") or raw.get("slug", "unknown")

        stats = None
        if raw.get("stats"):
            stats = ItemStats(**raw["stats"])

        crafting = None
        if raw.get("crafting") or raw.get("recipe"):
            craft_data = raw.get("crafting") or raw.get("recipe", {})
            crafting = CraftingRecipe(
                result_quantity=craft_data.get("result_quantity", 1),
                ingredients=craft_data.get("ingredients", {}),
                crafting_time=craft_data.get("time"),
                required_hideout_level=craft_data.get("hideout_level")
            )

        recycle = None
        if raw.get("recycle") or raw.get("recycling"):
            recycle_data = raw.get("recycle") or raw.get("recycling", {})
            recycle = RecycleYield(materials=recycle_data.get("materials", recycle_data))

        return Item(
            id=str(item_id),
            name=raw.get("name", "Unknown"),
            description=raw.get("description") or raw.get("desc"),
            category=raw.get("category", "misc"),
            subcategory=raw.get("subcategory") or raw.get("type"),
            rarity=raw.get("rarity") or raw.get("tier"),
            weight=raw.get("weight"),
            value=raw.get("value") or raw.get("price"),
            stats=stats,
            crafting=crafting,
            recycle=recycle,
            traders=raw.get("traders", []),
            quest_requirements=raw.get("quests", []),
            image_url=raw.get("image") or raw.get("icon")
        )

    async def get_all_items(self, force_refresh: bool = False) -> list[Item]:
        """Get all items, using cache when available."""
        cache_key = "all_items"

        if not force_refresh and cache_key in _items_cache:
            return _items_cache[cache_key]

        # Try MetaForge first, fall back to ARDB
        raw_items = await self.fetch_items_from_metaforge()
        source = "metaforge"

        if not raw_items:
            raw_items = await self.fetch_items_from_ardb()
            source = "ardb"

        if not raw_items:
            # Return cached items if available, even if expired
            return self._all_items if self._all_items else []

        items = [self._normalize_item(raw, source) for raw in raw_items]

        # Update cache and metadata
        self._all_items = items
        self._categories = {item.category for item in items if item.category}
        self._rarities = {item.rarity for item in items if item.rarity}
        _items_cache[cache_key] = items

        return items

    async def search_items(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        subcategory: Optional[str] = None,
        rarity: Optional[str] = None,
        trader: Optional[str] = None,
        min_value: Optional[int] = None,
        max_value: Optional[int] = None,
        limit: int = 50,
        offset: int = 0
    ) -> tuple[list[Item], int]:
        """Search and filter items."""
        items = await self.get_all_items()

        # Apply filters
        filtered = items

        if query:
            query_lower = query.lower()
            filtered = [
                item for item in filtered
                if query_lower in item.name.lower()
                or (item.description and query_lower in item.description.lower())
            ]

        if category:
            filtered = [item for item in filtered if item.category == category]

        if subcategory:
            filtered = [item for item in filtered if item.subcategory == subcategory]

        if rarity:
            filtered = [item for item in filtered if item.rarity == rarity]

        if trader:
            filtered = [item for item in filtered if trader in item.traders]

        if min_value is not None:
            filtered = [item for item in filtered if item.value and item.value >= min_value]

        if max_value is not None:
            filtered = [item for item in filtered if item.value and item.value <= max_value]

        total = len(filtered)
        paginated = filtered[offset:offset + limit]

        return paginated, total

    async def get_item_by_id(self, item_id: str) -> Optional[Item]:
        """Get a single item by ID."""
        items = await self.get_all_items()
        for item in items:
            if item.id == item_id:
                return item
        return None

    async def get_categories(self) -> list[str]:
        """Get all available categories."""
        await self.get_all_items()
        return sorted(list(self._categories))

    async def get_rarities(self) -> list[str]:
        """Get all available rarities."""
        await self.get_all_items()
        return sorted(list(self._rarities))

    async def fetch_events(self) -> list[dict]:
        """Fetch current events and timers."""
        cache_key = "events"
        if cache_key in _events_cache:
            return _events_cache[cache_key]

        try:
            response = await self.client.get(f"{settings.metaforge_api_url}/events")
            response.raise_for_status()
            events = response.json()
            _events_cache[cache_key] = events
            return events
        except Exception as e:
            print(f"Events API error: {e}")
            return []

    async def fetch_traders(self) -> list[dict]:
        """Fetch trader information."""
        cache_key = "traders"
        if cache_key in _traders_cache:
            return _traders_cache[cache_key]

        try:
            response = await self.client.get(f"{settings.metaforge_api_url}/traders")
            response.raise_for_status()
            traders = response.json()
            _traders_cache[cache_key] = traders
            return traders
        except Exception as e:
            print(f"Traders API error: {e}")
            return []


# Singleton instance
data_service = ArcDataService()
