import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

export function useItems(initialParams = {}) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    query: '',
    category: '',
    rarity: '',
    limit: 50,
    offset: 0,
    ...initialParams
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchItems(params);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const search = useCallback((query) => {
    setParams(prev => ({ ...prev, query, offset: 0 }));
  }, []);

  const filterByCategory = useCallback((category) => {
    setParams(prev => ({ ...prev, category, offset: 0 }));
  }, []);

  const filterByRarity = useCallback((rarity) => {
    setParams(prev => ({ ...prev, rarity, offset: 0 }));
  }, []);

  const nextPage = useCallback(() => {
    setParams(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  }, []);

  const prevPage = useCallback(() => {
    setParams(prev => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit)
    }));
  }, []);

  return {
    items,
    total,
    loading,
    error,
    params,
    search,
    filterByCategory,
    filterByRarity,
    nextPage,
    prevPage,
    refresh: fetchItems
  };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then(data => setCategories(data.categories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

export function useRarities() {
  const [rarities, setRarities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRarities()
      .then(data => setRarities(data.rarities || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { rarities, loading };
}

export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
