# Arc Raiders Companion App - Development Plan

## Executive Summary

Based on the feasibility analysis, we can build a **reference and manual-tracking companion app** that provides real value to Xbox (and all platform) Arc Raiders players. While automatic inventory sync is impossible without an official API, the community has built mature data infrastructure we can leverage.

---

## Phase 1: Foundation (MVP)

### 1.1 Core Data Integration
- [ ] Set up project repository with Python backend (Flask/FastAPI)
- [ ] Integrate **RaidTheory/arcraiders-data** (MIT licensed)
  - Clone and sync 491+ items in JSON format
  - Items, quests, maps, hideout modules, skill trees, traders
- [ ] Connect to **MetaForge API** (`metaforge.app/api/arc-raiders`)
  - Items, quests, ARCs, maps, traders, event schedules
- [ ] Set up **ARDB API** as backup data source
- [ ] Implement local caching for offline functionality

### 1.2 Item Database & Search
- [ ] Full-text search across all 491+ items
- [ ] Filter by category, rarity, trader, quest requirements
- [ ] Display stats, crafting recipes, recycling yields
- [ ] Item comparison tool

### 1.3 Basic UI/Frontend
- [ ] PWA (Progressive Web App) architecture for Xbox browser access
- [ ] Responsive mobile-first design
- [ ] Offline-first capability with service workers
- [ ] Dark theme (gaming aesthetic)

**Deliverable:** Working item database with search functionality

---

## Phase 2: Reference Features

### 2.1 Interactive Maps
- [ ] All 5 maps: Dam, Spaceport, Buried City, Blue Gate, Stella Montis
- [ ] POI markers (loot spots, extractions, quest locations)
- [ ] Layer toggles (loot types, enemy spawns, extract points)
- [ ] Search locations by item drops

### 2.2 Quest Reference Guide
- [ ] Complete quest database
- [ ] Required items checklist view
- [ ] Reward information
- [ ] Quest chains and prerequisites
- [ ] Location markers on maps

### 2.3 Loadout Builder/Planner
- [ ] Weapon stats database
- [ ] Mod slot configuration
- [ ] DPS calculations
- [ ] Save/share loadout builds
- [ ] Export loadout as image

### 2.4 Trader System
- [ ] Current trader inventory display
- [ ] Rotation schedules and timers
- [ ] Price comparisons
- [ ] Restock notifications (browser push)

### 2.5 Event Timers
- [ ] Storm schedules
- [ ] Merchant visit timers
- [ ] Special event countdowns
- [ ] Calendar integration (iCal export)

**Deliverable:** Full reference app with maps, quests, loadouts, traders

---

## Phase 3: Personal Tracking (Manual Entry)

### 3.1 User Account System
- [ ] User registration/authentication
- [ ] Profile management
- [ ] Data sync across devices
- [ ] Privacy controls

### 3.2 Quest Tracking
- [ ] Mark quests as complete/in-progress
- [ ] Track required items collected
- [ ] Personal notes per quest
- [ ] Progress statistics

### 3.3 Hideout Progress Tracker
- [ ] Input current module levels
- [ ] Upgrade requirements calculator
- [ ] Resource planning
- [ ] Total investment tracking

### 3.4 Inventory Wishlist
- [ ] Create shopping lists
- [ ] Track items needed for upgrades
- [ ] Prioritization system
- [ ] Share wishlists

### 3.5 Session Logging
- [ ] Manual raid outcome logging
- [ ] Loot tracking per session
- [ ] Death/survival statistics
- [ ] Map preferences analytics

**Deliverable:** Full personal tracking system with user accounts

---

## Phase 4: Community Features

### 4.1 Crafting Calculator
- [ ] Full crafting tree visualization
- [ ] Material requirements calculator
- [ ] Optimal crafting paths
- [ ] Cost analysis

### 4.2 Build Sharing
- [ ] Public loadout gallery
- [ ] Community ratings/votes
- [ ] Build guides with descriptions
- [ ] Meta tier lists

### 4.3 Discord Integration
- [ ] Bot for quick lookups
- [ ] Webhook notifications
- [ ] Share to Discord button

**Deliverable:** Community-enhanced app with sharing features

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (PWA)                        │
│  React/Vue + TailwindCSS + Service Workers               │
│  - Offline-first architecture                            │
│  - Mobile responsive                                     │
│  - Xbox Edge browser compatible                          │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Python)                        │
│  FastAPI + SQLAlchemy + Redis Cache                      │
│  - REST API endpoints                                    │
│  - User authentication (JWT)                             │
│  - Data aggregation layer                                │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  MetaForge   │ │    ARDB      │ │  RaidTheory  │
    │     API      │ │     API      │ │    GitHub    │
    │  (Primary)   │ │   (Backup)   │ │   (Static)   │
    └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Data Source Attribution

| Source | License | Requirements |
|--------|---------|--------------|
| RaidTheory/arcraiders-data | MIT | Attribution required |
| MetaForge API | Non-commercial free | Contact for commercial use |
| ARDB API | Free | Visible attribution linking to ardb.app |

---

## Technology Stack

### Backend
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **Database:** PostgreSQL (user data) + Redis (caching)
- **ORM:** SQLAlchemy

### Frontend
- **Framework:** React or Vue 3
- **Styling:** TailwindCSS
- **Maps:** Leaflet.js with custom tiles
- **State:** Zustand or Pinia
- **PWA:** Workbox

### Infrastructure
- **Hosting:** Vercel (frontend) + Railway/Fly.io (backend)
- **CDN:** Cloudflare
- **Monitoring:** Sentry

---

## Timeline Estimates

| Phase | Scope | Priority |
|-------|-------|----------|
| Phase 1 | MVP - Item Database | High |
| Phase 2 | Reference Features | High |
| Phase 3 | Personal Tracking | Medium |
| Phase 4 | Community Features | Low |

---

## Success Metrics

1. **User Adoption:** Active users, session duration
2. **Data Accuracy:** Community feedback on data correctness
3. **Performance:** Load times, offline reliability
4. **Community Impact:** Potential for Embark partnership

---

## Future Possibilities

If Embark ever releases an official API (they've hinted they're "watching" community efforts):
- Automatic inventory sync
- Real-time loadout management
- Equipment transfers (DIM-style)
- Live session tracking
- Integrated stats

Building a high-quality app with existing data positions us for potential official partnership, similar to how thecycledb.com gained formal partner status with YAGER.

---

## Next Steps

1. Initialize project repository structure
2. Set up development environment
3. Create API integration layer for community data sources
4. Build basic item search MVP
5. Deploy PWA proof of concept
