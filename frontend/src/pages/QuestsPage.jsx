import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

function QuestCard({ quest, onClick }) {
  const getTypeColor = (type) => {
    const colors = {
      main: 'border-arc-gold bg-arc-gold/10',
      side: 'border-arc-blue bg-arc-blue/10',
      daily: 'border-green-500 bg-green-500/10',
      weekly: 'border-arc-purple bg-arc-purple/10',
    };
    return colors[(type || '').toLowerCase()] || 'border-gray-600 bg-gray-600/10';
  };

  return (
    <div
      onClick={() => onClick?.(quest)}
      className="bg-arc-dark rounded-lg p-4 cursor-pointer hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-100 truncate">{quest.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {quest.type && (
              <span className={`text-xs px-2 py-0.5 rounded border ${getTypeColor(quest.type)}`}>
                {quest.type}
              </span>
            )}
            {quest.giver && (
              <span className="text-xs text-gray-500">from {quest.giver}</span>
            )}
          </div>
          {quest.description && (
            <p className="text-sm text-gray-400 mt-2 line-clamp-2">{quest.description}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        {quest.objectives?.length > 0 && (
          <span>{quest.objectives.length} objective{quest.objectives.length !== 1 ? 's' : ''}</span>
        )}
        {quest.location && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {quest.location}
          </span>
        )}
        {quest.rewards?.experience && (
          <span className="text-arc-gold">+{quest.rewards.experience} XP</span>
        )}
      </div>
    </div>
  );
}

function QuestDetail({ quest, onClose }) {
  if (!quest) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
         onClick={onClose}>
      <div className="bg-arc-dark rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-arc-dark border-b border-gray-700 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100">{quest.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {quest.type && (
                <span className="text-sm text-arc-accent">{quest.type}</span>
              )}
              {quest.giver && (
                <span className="text-sm text-gray-500">from {quest.giver}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Description */}
          {quest.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Description</h3>
              <p className="text-gray-300">{quest.description}</p>
            </div>
          )}

          {/* Objectives */}
          {quest.objectives?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Objectives</h3>
              <ul className="space-y-2">
                {quest.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 bg-arc-darker rounded p-3">
                    <div className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-gray-500">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-gray-300">{obj.description}</p>
                      {obj.count && (
                        <span className="text-sm text-arc-accent">x{obj.count}</span>
                      )}
                      {obj.location && (
                        <span className="text-sm text-gray-500 ml-2">at {obj.location}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Items */}
          {quest.required_items?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Required Items</h3>
              <div className="grid grid-cols-2 gap-2">
                {quest.required_items.map((item, i) => (
                  <div key={i} className="bg-arc-darker rounded p-2 flex items-center justify-between">
                    <span className="text-gray-300">{item.name || item.id}</span>
                    {item.count && <span className="text-arc-accent">x{item.count}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewards */}
          {quest.rewards && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Rewards</h3>
              <div className="flex flex-wrap gap-3">
                {quest.rewards.experience && (
                  <div className="bg-arc-darker rounded px-3 py-2">
                    <span className="text-gray-500">XP: </span>
                    <span className="text-arc-gold font-semibold">{quest.rewards.experience}</span>
                  </div>
                )}
                {quest.rewards.currency && (
                  <div className="bg-arc-darker rounded px-3 py-2">
                    <span className="text-gray-500">Credits: </span>
                    <span className="text-green-400 font-semibold">{quest.rewards.currency}</span>
                  </div>
                )}
                {quest.rewards.items?.map((item, i) => (
                  <div key={i} className="bg-arc-darker rounded px-3 py-2">
                    <span className="text-gray-300">{item.name || item.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {quest.location && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Location</h3>
              <div className="bg-arc-darker rounded p-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-arc-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-gray-300">{quest.location}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuestsPage() {
  const [quests, setQuests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [filters, setFilters] = useState({
    query: '',
    giver: '',
    type: '',
    location: ''
  });
  const [givers, setGivers] = useState([]);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchQuests(filters);
      setQuests(data.quests || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  useEffect(() => {
    api.getQuestGivers().then(data => setGivers(data.givers || [])).catch(console.error);
  }, []);

  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, query }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search quests..."
            value={filters.query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-arc-dark border border-gray-700 rounded-lg
                       text-gray-100 placeholder-gray-500 focus:outline-none focus:border-arc-accent"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <select
            value={filters.giver}
            onChange={(e) => setFilters(prev => ({ ...prev, giver: e.target.value }))}
            className="px-3 py-2 bg-arc-dark border border-gray-700 rounded-lg text-gray-100"
          >
            <option value="">All Quest Givers</option>
            {givers.map(giver => (
              <option key={giver} value={giver}>{giver}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 bg-arc-dark border border-gray-700 rounded-lg text-gray-100"
          >
            <option value="">All Types</option>
            <option value="main">Main</option>
            <option value="side">Side</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          {loading ? 'Loading...' : `${total} quests found`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-400">Error loading quests: {error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && quests.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-arc-dark rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Quest Grid */}
      {quests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onClick={setSelectedQuest}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && quests.length === 0 && !error && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-400">No quests found</h3>
        </div>
      )}

      {/* Quest Detail Modal */}
      <QuestDetail quest={selectedQuest} onClose={() => setSelectedQuest(null)} />
    </div>
  );
}
