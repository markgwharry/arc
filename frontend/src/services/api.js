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
