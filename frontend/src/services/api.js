const API_BASE = '/api';

// Cache for offline support
const cache = new Map();

async function fetchWithCache(url, options = {}) {
  const cacheKey = url;

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // Store in cache for offline use
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  } catch (error) {
    // Return cached data if available
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Using cached data for:', url);
      return cached.data;
    }
    throw error;
  }
}

export async function searchItems(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set('q', params.query);
  if (params.category) searchParams.set('category', params.category);
  if (params.rarity) searchParams.set('rarity', params.rarity);
  if (params.limit) searchParams.set('limit', params.limit);
  if (params.offset) searchParams.set('offset', params.offset);

  const url = `${API_BASE}/items?${searchParams.toString()}`;
  return fetchWithCache(url);
}

export async function getItem(itemId) {
  return fetchWithCache(`${API_BASE}/items/${itemId}`);
}

export async function getCategories() {
  return fetchWithCache(`${API_BASE}/items/categories`);
}

export async function getRarities() {
  return fetchWithCache(`${API_BASE}/items/rarities`);
}

export async function getRelatedItems(itemId) {
  return fetchWithCache(`${API_BASE}/items/${itemId}/related`);
}

export async function getEvents() {
  return fetchWithCache(`${API_BASE}/events`);
}

export async function getTraders() {
  return fetchWithCache(`${API_BASE}/events/traders`);
}

export async function getStats() {
  return fetchWithCache(`${API_BASE}/stats`);
}

// ===== QUESTS =====

export async function searchQuests(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set('q', params.query);
  if (params.giver) searchParams.set('giver', params.giver);
  if (params.type) searchParams.set('type', params.type);
  if (params.location) searchParams.set('location', params.location);
  if (params.limit) searchParams.set('limit', params.limit);
  if (params.offset) searchParams.set('offset', params.offset);

  const url = `${API_BASE}/quests?${searchParams.toString()}`;
  return fetchWithCache(url);
}

export async function getQuest(questId) {
  return fetchWithCache(`${API_BASE}/quests/${questId}`);
}

export async function getQuestGivers() {
  return fetchWithCache(`${API_BASE}/quests/givers`);
}

export async function getQuestChain(questId) {
  return fetchWithCache(`${API_BASE}/quests/${questId}/chain`);
}

// ===== MAPS =====

export async function getMaps() {
  return fetchWithCache(`${API_BASE}/maps`);
}

export async function getMap(mapId) {
  return fetchWithCache(`${API_BASE}/maps/${mapId}`);
}

export async function getMapMarkers(mapId, type = null) {
  const url = type
    ? `${API_BASE}/maps/${mapId}/markers?type=${type}`
    : `${API_BASE}/maps/${mapId}/markers`;
  return fetchWithCache(url);
}

// ===== LOADOUTS =====

export async function getWeapons(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set('type', params.type);
  if (params.rarity) searchParams.set('rarity', params.rarity);

  const url = `${API_BASE}/loadouts/weapons?${searchParams.toString()}`;
  return fetchWithCache(url);
}

export async function getWeapon(weaponId) {
  return fetchWithCache(`${API_BASE}/loadouts/weapons/${weaponId}`);
}

export async function getArmor(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.slot) searchParams.set('slot', params.slot);
  if (params.rarity) searchParams.set('rarity', params.rarity);

  const url = `${API_BASE}/loadouts/armor?${searchParams.toString()}`;
  return fetchWithCache(url);
}

export async function getWeaponTierList() {
  return fetchWithCache(`${API_BASE}/loadouts/tier-list`);
}

export async function calculateLoadout(loadout) {
  const response = await fetch(`${API_BASE}/loadouts/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loadout)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
