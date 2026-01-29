# Arc Raiders Companion App Feasibility: Xbox Edition

**The short answer: automatic inventory and loadout sync is impossible, but a robust reference app is highly feasible.** Embark Studios has explicitly stated they have "no current plans" for an official API, and Xbox's platform restrictions make any workaround impossible. However, the Arc Raiders community has built surprisingly mature data infrastructure that could power a useful companion app—just not the Destiny 2-style experience you're accustomed to.

## Embark has closed the door on official API support—for now

Design Director Virgil Watkins addressed this directly in an October 2025 interview: "We don't have any current plans to do an API setup... what we really wanted to try to do was to see if that was information that the players would find valuable; we wanted to try to put it in the game first." Embark's philosophy is deliberate self-containment—they want all information accessible within the game itself, reducing reliance on external tools.

The door isn't completely shut. Watkins acknowledged personal appreciation for fan-made resources and noted Embark will "keep an eye out" for community-driven content, suggesting official support could come "if the situation calls for it." With **12 million copies sold** and a Game Awards 2025 Best Multiplayer win, community demand could eventually shift this stance—but nothing is imminent.

## Xbox presents insurmountable technical barriers for automatic sync

Here's the critical problem for your specific use case:

| Data Access Method | PC Feasibility | Xbox Feasibility |
|-------------------|----------------|------------------|
| File system access | Limited (config only) | ❌ Completely blocked |
| Memory reading | Risky but possible | ❌ Hypervisor protected |
| Network interception | Difficult (HTTPS/cert pinning) | ❌ Effectively impossible |
| Log file parsing | Possible | ❌ Not accessible |
| Overwolf overlays | Available | ❌ Not supported |

**All meaningful game data—inventory, loadouts, quest progress, hideout upgrades—is stored server-side**, not locally. Even on PC, local save files only contain graphics settings and keybinds. Without Embark exposing endpoints, there's no path to automatic data retrieval on any platform, and Xbox's sandboxed environment eliminates even the workarounds available to PC users.

## The community has built impressive infrastructure despite these limitations

This is where the news gets better. Arc Raiders has developed a **surprisingly mature ecosystem** of community tools:

**Structured Data Repositories:**
- **RaidTheory/arcraiders-data** (GitHub) — 85 stars, MIT licensed, 491+ items in JSON format covering items, quests, maps, hideout modules, skill trees, and traders
- Active maintenance with 15 contributors and 134+ commits through January 2026

**REST APIs Ready for Integration:**
- **MetaForge API** (`metaforge.app/api/arc-raiders`) — Comprehensive endpoints for items, quests, ARCs, maps, traders, and event schedules with filtering and pagination
- **ARDB API** (`ardb.app/api/`) — Clean JSON endpoints for items, quests, and enemy data

**Existing Companion Apps:**
- **ARC Forge** (Overwolf) — Quest tracking, crafting calculator, trader inventory
- **arc-raiders-companion** (Android/GitHub) — Kotlin app with MetaForge integration, offline caching
- **ARCTracker.io** — Web-based progress tracking and Discord bot

## Your Bungie API experience doesn't transfer—that's the exception, not the rule

Coming from Destiny 2 development, you should recalibrate expectations. Bungie's API is **extraordinarily rare** in gaming—it provides full inventory read/write access, item transfers, vault management, and real-time sync that virtually no other game offers.

Comparable extraction shooters have zero official API support:

- **Escape from Tarkov**: Community built tarkov.dev API through game file extraction and crowdsourcing. RatScanner uses OCR/screenshot detection. No official support from BSG.
- **The Division 2**: Ubisoft explicitly stated "Companion app? No. It's not in the plans." Tools require manual data entry.
- **Gray Zone Warfare**: gzw-tracker.app maintainers note "Every mission had to be entered manually. Madfinger Games offers no public API."
- **The Cycle: Frontier**: One of few examples where the developer formally partnered with thecycledb.com—but even this wasn't a full API.

## What you can actually build for Xbox players

### Highly Feasible Features (data available now)
- **Item database and search** — 491+ items with stats, crafting recipes, recycling yields via MetaForge/ARDB APIs
- **Interactive maps** — All 5 maps (Dam, Spaceport, Buried City, Blue Gate, Stella Montis) with POIs, loot spots, extractions via MetaForge map data
- **Quest reference guide** — Complete quest database with required items, rewards, and locations
- **Loadout builder/planner** — Weapon stats, mod slots, DPS calculations from community data
- **Trader inventory schedules** — Current trader stock and rotation timing
- **Event timers** — Storms, merchant visits, special events via events-schedule endpoint
- **Crafting calculator** — wangyz1999/arcforge has item relationship graph data

### Feasible with Manual Entry
- **Personal quest tracking** — User marks completion manually (ARCTracker.io model)
- **Hideout progress tracking** — User inputs current module levels
- **Session notes/logging** — Manual entry of raid outcomes
- **Wishlist/shopping list** — Track items needed for upgrades

### Not Feasible (requires official API)
- ❌ Automatic inventory sync
- ❌ Real-time loadout management
- ❌ Equipment transfers (like DIM for Destiny 2)
- ❌ Automatic session/raid tracking
- ❌ Live stats integration

## Recommended technical approach

**Primary data sources to integrate:**
1. **RaidTheory/arcraiders-data** (MIT license) — Clone and sync JSON files for local/offline data
2. **MetaForge API** — Live queries for items, maps, events; includes embeddable tooltip scripts
3. **ARDB API** — Backup source with clean individual item endpoints

**Architecture suggestion:**
Given your Python background, a web app with offline-first PWA capabilities would serve Xbox players well since they can't run native apps. Use the community APIs for live data, cache locally for offline reference, and implement manual tracking features that sync to user accounts.

**Attribution requirements:**
- MetaForge: Non-commercial free, contact for commercial
- ARDB: Requires visible attribution linking to ardb.app
- RaidTheory: MIT license (attribution required)

## The path forward

A reference and manual-tracking companion app is **absolutely viable** and could provide real value to Xbox Arc Raiders players. The community data infrastructure is mature, well-maintained, and freely available. However, you should abandon any hope of automatic inventory sync or Destiny 2-style item management until Embark changes their API stance.

If you want to influence that timeline, consider building something valuable with existing data, gaining community traction, and positioning for a potential official partnership—similar to how thecycledb.com obtained formal partner status with YAGER for The Cycle: Frontier. Embark has signaled they're watching community efforts, and a high-quality tool could make the business case for API investment.