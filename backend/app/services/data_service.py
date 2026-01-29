import httpx
from typing import Optional, List, Set
from cachetools import TTLCache
from ..core.config import get_settings
from ..models.items import Item, ItemStats, CraftingRecipe, RecycleYield
from ..models.quests import Quest, QuestObjective, QuestReward
from ..models.maps import GameMap, MapMarker, MapZone
from ..models.loadouts import Weapon, ArmorPiece, WeaponMod

settings = get_settings()

# In-memory cache (fallback when Redis unavailable)
_items_cache: TTLCache = TTLCache(maxsize=1000, ttl=settings.cache_ttl_items)
_events_cache: TTLCache = TTLCache(maxsize=100, ttl=settings.cache_ttl_events)
_traders_cache: TTLCache = TTLCache(maxsize=50, ttl=settings.cache_ttl_traders)
_quests_cache: TTLCache = TTLCache(maxsize=500, ttl=settings.cache_ttl_items)
_maps_cache: TTLCache = TTLCache(maxsize=20, ttl=settings.cache_ttl_items)


class ArcDataService:
    """Service for fetching Arc Raiders data from community APIs."""

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        self._all_items: List[Item] = []
        self._categories: Set[str] = set()
        self._rarities: Set[str] = set()

    async def close(self):
        await self.client.aclose()

    async def fetch_items_from_metaforge(self) -> List[dict]:
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

    async def fetch_items_from_ardb(self) -> List[dict]:
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

    async def get_all_items(self, force_refresh: bool = False) -> List[Item]:
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

        # Filter to only include valid dict items
        valid_items = [raw for raw in raw_items if isinstance(raw, dict)]
        items = [self._normalize_item(raw, source) for raw in valid_items]

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
    ) -> tuple:
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

    async def get_categories(self) -> List[str]:
        """Get all available categories."""
        await self.get_all_items()
        return sorted(list(self._categories))

    async def get_rarities(self) -> List[str]:
        """Get all available rarities."""
        await self.get_all_items()
        return sorted(list(self._rarities))

    async def fetch_events(self) -> List[dict]:
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

    async def fetch_traders(self) -> List[dict]:
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

    # ===== QUESTS =====

    async def fetch_quests_from_metaforge(self) -> List[dict]:
        """Fetch quests from MetaForge API."""
        try:
            response = await self.client.get(
                f"{settings.metaforge_api_url}/quests",
                params={"limit": 500}
            )
            response.raise_for_status()
            data = response.json()
            return data.get("quests", data) if isinstance(data, dict) else data
        except Exception as e:
            print(f"MetaForge quests API error: {e}")
            return []

    def _normalize_quest(self, raw: dict) -> Quest:
        """Normalize quest data into unified format."""
        quest_id = raw.get("id") or raw.get("_id") or raw.get("slug", "unknown")

        objectives = []
        for obj in raw.get("objectives", []):
            objectives.append(QuestObjective(
                description=obj.get("description", ""),
                type=obj.get("type", "unknown"),
                target=obj.get("target"),
                count=obj.get("count"),
                location=obj.get("location")
            ))

        rewards = None
        if raw.get("rewards"):
            r = raw["rewards"]
            rewards = QuestReward(
                experience=r.get("experience") or r.get("xp"),
                currency=r.get("currency") or r.get("credits"),
                items=r.get("items", []),
                reputation=r.get("reputation")
            )

        return Quest(
            id=str(quest_id),
            name=raw.get("name", "Unknown Quest"),
            description=raw.get("description"),
            giver=raw.get("giver") or raw.get("trader") or raw.get("npc"),
            type=raw.get("type") or raw.get("quest_type"),
            level_requirement=raw.get("level_requirement") or raw.get("min_level"),
            prerequisites=raw.get("prerequisites", []),
            objectives=objectives,
            required_items=raw.get("required_items", []),
            rewards=rewards,
            location=raw.get("location") or raw.get("map"),
            image_url=raw.get("image") or raw.get("icon")
        )

    async def get_all_quests(self, force_refresh: bool = False) -> List[Quest]:
        """Get all quests."""
        cache_key = "all_quests"

        if not force_refresh and cache_key in _quests_cache:
            return _quests_cache[cache_key]

        raw_quests = await self.fetch_quests_from_metaforge()

        if not raw_quests:
            return []

        # Filter to only include valid dict items
        valid_quests = [raw for raw in raw_quests if isinstance(raw, dict)]
        quests = [self._normalize_quest(raw) for raw in valid_quests]
        _quests_cache[cache_key] = quests
        return quests

    async def search_quests(
        self,
        query: Optional[str] = None,
        giver: Optional[str] = None,
        quest_type: Optional[str] = None,
        location: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> tuple:
        """Search and filter quests."""
        quests = await self.get_all_quests()
        filtered = quests

        if query:
            query_lower = query.lower()
            filtered = [
                q for q in filtered
                if query_lower in q.name.lower()
                or (q.description and query_lower in q.description.lower())
            ]

        if giver:
            filtered = [q for q in filtered if q.giver == giver]

        if quest_type:
            filtered = [q for q in filtered if q.type == quest_type]

        if location:
            filtered = [q for q in filtered if q.location == location]

        total = len(filtered)
        paginated = filtered[offset:offset + limit]
        return paginated, total

    async def get_quest_by_id(self, quest_id: str) -> Optional[Quest]:
        """Get a single quest by ID."""
        quests = await self.get_all_quests()
        for quest in quests:
            if quest.id == quest_id:
                return quest
        return None

    async def get_quest_givers(self) -> List[str]:
        """Get all quest givers."""
        quests = await self.get_all_quests()
        givers = {q.giver for q in quests if q.giver}
        return sorted(list(givers))

    # ===== MAPS =====

    async def fetch_maps_from_metaforge(self) -> List[dict]:
        """Fetch maps from MetaForge API."""
        try:
            response = await self.client.get(f"{settings.metaforge_api_url}/maps")
            response.raise_for_status()
            data = response.json()
            return data.get("maps", data) if isinstance(data, dict) else data
        except Exception as e:
            print(f"MetaForge maps API error: {e}")
            return []

    def _normalize_map(self, raw: dict) -> GameMap:
        """Normalize map data into unified format."""
        map_id = raw.get("id") or raw.get("_id") or raw.get("slug", "unknown")

        markers = []
        for m in raw.get("markers", []) + raw.get("pois", []):
            markers.append(MapMarker(
                id=m.get("id", str(len(markers))),
                name=m.get("name", "Unknown"),
                type=m.get("type", "landmark"),
                x=m.get("x", 0),
                y=m.get("y", 0),
                description=m.get("description"),
                icon=m.get("icon"),
                items=m.get("items", []),
                quests=m.get("quests", [])
            ))

        extractions = []
        for e in raw.get("extractions", []) + raw.get("exits", []):
            extractions.append(MapMarker(
                id=e.get("id", str(len(extractions))),
                name=e.get("name", "Extraction"),
                type="extraction",
                x=e.get("x", 0),
                y=e.get("y", 0),
                description=e.get("description")
            ))

        zones = []
        for z in raw.get("zones", []):
            zones.append(MapZone(
                id=z.get("id", str(len(zones))),
                name=z.get("name", "Zone"),
                type=z.get("type", "unknown"),
                bounds=z.get("bounds", []),
                threat_level=z.get("threat_level"),
                description=z.get("description")
            ))

        return GameMap(
            id=str(map_id),
            name=raw.get("name", "Unknown Map"),
            description=raw.get("description"),
            image_url=raw.get("image") or raw.get("map_image"),
            thumbnail_url=raw.get("thumbnail"),
            width=raw.get("width"),
            height=raw.get("height"),
            markers=markers,
            zones=zones,
            extractions=extractions
        )

    async def get_all_maps(self, force_refresh: bool = False) -> List[GameMap]:
        """Get all maps."""
        cache_key = "all_maps"

        if not force_refresh and cache_key in _maps_cache:
            return _maps_cache[cache_key]

        raw_maps = await self.fetch_maps_from_metaforge()

        if not raw_maps:
            return []

        # Filter to only include valid dict items
        valid_maps = [raw for raw in raw_maps if isinstance(raw, dict)]
        maps = [self._normalize_map(raw) for raw in valid_maps]
        _maps_cache[cache_key] = maps
        return maps

    async def get_map_by_id(self, map_id: str) -> Optional[GameMap]:
        """Get a single map by ID."""
        maps = await self.get_all_maps()
        for game_map in maps:
            if game_map.id == map_id:
                return game_map
        return None

    # ===== WEAPONS & LOADOUTS =====

    async def get_weapons(self) -> List[Weapon]:
        """Get all weapons from items database."""
        items = await self.get_all_items()
        weapons = []

        weapon_categories = {"weapon", "weapons", "primary", "secondary", "pistol",
                           "rifle", "smg", "shotgun", "sniper"}

        for item in items:
            if item.category and item.category.lower() in weapon_categories:
                stats = item.stats or ItemStats()
                weapons.append(Weapon(
                    id=item.id,
                    name=item.name,
                    type=item.subcategory or item.category,
                    rarity=item.rarity,
                    base_damage=stats.damage or 0,
                    fire_rate=stats.fire_rate or 0,
                    accuracy=stats.accuracy or 0,
                    recoil=0,  # May not be in stats
                    range=stats.range or 0,
                    magazine_size=30,  # Default
                    reload_time=2.0,  # Default
                    mod_slots=[],
                    image_url=item.image_url
                ))

        return weapons

    async def get_armor(self) -> List[ArmorPiece]:
        """Get all armor from items database."""
        items = await self.get_all_items()
        armor_list = []

        armor_categories = {"armor", "helmet", "vest", "chest", "legs", "gear"}

        for item in items:
            if item.category and item.category.lower() in armor_categories:
                stats = item.stats or ItemStats()
                armor_list.append(ArmorPiece(
                    id=item.id,
                    name=item.name,
                    slot=item.subcategory or "chest",
                    rarity=item.rarity,
                    armor_value=stats.armor or 0,
                    durability=stats.durability or 100,
                    weight=item.weight or 0,
                    special_effects=[],
                    image_url=item.image_url
                ))

        return armor_list

    def calculate_weapon_dps(self, weapon: Weapon) -> float:
        """Calculate DPS for a weapon."""
        if weapon.fire_rate <= 0:
            return weapon.base_damage  # Single-shot weapon

        # DPS = (Damage * Fire Rate / 60) * (Accuracy / 100)
        raw_dps = (weapon.base_damage * weapon.fire_rate) / 60
        effective_dps = raw_dps * (weapon.accuracy / 100) if weapon.accuracy > 0 else raw_dps
        return round(effective_dps, 2)


# Singleton instance
data_service = ArcDataService()
