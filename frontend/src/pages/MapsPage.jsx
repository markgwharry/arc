import { useState, useEffect } from 'react';
import * as api from '../services/api';

const MARKER_ICONS = {
  extraction: { color: 'text-green-400', bg: 'bg-green-400/20' },
  loot: { color: 'text-arc-gold', bg: 'bg-arc-gold/20' },
  enemy: { color: 'text-red-400', bg: 'bg-red-400/20' },
  quest: { color: 'text-arc-blue', bg: 'bg-arc-blue/20' },
  trader: { color: 'text-arc-purple', bg: 'bg-arc-purple/20' },
  landmark: { color: 'text-gray-400', bg: 'bg-gray-400/20' },
};

function MapCard({ map, onClick, selected }) {
  return (
    <div
      onClick={() => onClick(map)}
      className={`bg-arc-dark rounded-lg overflow-hidden cursor-pointer transition-all
                  ${selected ? 'ring-2 ring-arc-accent' : 'hover:bg-gray-800'}`}
    >
      {map.thumbnail_url || map.image_url ? (
        <img
          src={map.thumbnail_url || map.image_url}
          alt={map.name}
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 bg-gray-700 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
      )}
      <div className="p-3">
        <h3 className="font-semibold text-gray-100">{map.name}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          {map.markers?.length > 0 && (
            <span>{map.markers.length} POIs</span>
          )}
          {map.extractions?.length > 0 && (
            <span className="text-green-400">{map.extractions.length} extracts</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MarkerList({ markers, type, title }) {
  const filtered = type ? markers.filter(m => m.type === type) : markers;
  if (filtered.length === 0) return null;

  const style = MARKER_ICONS[type] || MARKER_ICONS.landmark;

  return (
    <div className="mb-4">
      <h4 className={`text-sm font-semibold uppercase mb-2 ${style.color}`}>
        {title} ({filtered.length})
      </h4>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {filtered.map((marker, i) => (
          <div key={marker.id || i} className={`${style.bg} rounded px-3 py-2 text-sm`}>
            <span className="text-gray-200">{marker.name}</span>
            {marker.description && (
              <p className="text-xs text-gray-400 mt-0.5">{marker.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MapViewer({ map }) {
  const [filter, setFilter] = useState('all');

  if (!map) {
    return (
      <div className="flex-1 flex items-center justify-center bg-arc-darker rounded-lg">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-400">Select a map to view details</p>
        </div>
      </div>
    );
  }

  const allMarkers = [...(map.markers || []), ...(map.extractions || [])];
  const markerTypes = [...new Set(allMarkers.map(m => m.type))];

  return (
    <div className="flex-1 flex flex-col bg-arc-darker rounded-lg overflow-hidden">
      {/* Map Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-gray-100">{map.name}</h2>
        {map.description && (
          <p className="text-sm text-gray-400 mt-1">{map.description}</p>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Map Image / Placeholder */}
        <div className="flex-1 relative bg-gray-900">
          {map.image_url ? (
            <img
              src={map.image_url}
              alt={map.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-gray-600 mt-2">Map image not available</p>
                <p className="text-xs text-gray-700 mt-1">Community map data may add images later</p>
              </div>
            </div>
          )}

          {/* Filter Buttons Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors
                         ${filter === 'all' ? 'bg-arc-accent text-white' : 'bg-black/50 text-gray-300 hover:bg-black/70'}`}
            >
              All
            </button>
            {markerTypes.map(type => {
              const style = MARKER_ICONS[type] || MARKER_ICONS.landmark;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors
                             ${filter === type ? 'bg-arc-accent text-white' : `bg-black/50 ${style.color} hover:bg-black/70`}`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Markers List */}
        <div className="w-72 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Points of Interest</h3>

          {filter === 'all' ? (
            <>
              <MarkerList markers={allMarkers} type="extraction" title="Extractions" />
              <MarkerList markers={allMarkers} type="loot" title="Loot Spots" />
              <MarkerList markers={allMarkers} type="quest" title="Quest Locations" />
              <MarkerList markers={allMarkers} type="enemy" title="Enemy Spawns" />
              <MarkerList markers={allMarkers} type="trader" title="Traders" />
              <MarkerList markers={allMarkers} type="landmark" title="Landmarks" />
            </>
          ) : (
            <MarkerList markers={allMarkers} type={filter} title={filter} />
          )}

          {allMarkers.length === 0 && (
            <p className="text-gray-500 text-sm">No markers available for this map yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MapsPage() {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getMaps()
      .then(data => {
        setMaps(data.maps || []);
        if (data.maps?.length > 0) {
          setSelectedMap(data.maps[0]);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Map List Sidebar */}
        <div className="w-64 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Maps</h2>

          {loading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-arc-dark rounded-lg animate-pulse">
                  <div className="h-32 bg-gray-700 rounded-t-lg" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {maps.map(map => (
              <MapCard
                key={map.id}
                map={map}
                onClick={setSelectedMap}
                selected={selectedMap?.id === map.id}
              />
            ))}
          </div>

          {!loading && maps.length === 0 && !error && (
            <p className="text-gray-500 text-sm">No maps available.</p>
          )}
        </div>

        {/* Map Viewer */}
        <MapViewer map={selectedMap} />
      </div>
    </div>
  );
}
