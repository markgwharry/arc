import { useState, useEffect } from 'react';
import * as api from '../services/api';

function WeaponCard({ weapon, selected, onToggle }) {
  const getRarityClass = (rarity) => {
    const classes = {
      common: 'border-gray-500',
      uncommon: 'border-green-500',
      rare: 'border-arc-blue',
      epic: 'border-arc-purple',
      legendary: 'border-arc-gold',
    };
    return classes[(rarity || '').toLowerCase()] || 'border-gray-600';
  };

  return (
    <div
      onClick={() => onToggle(weapon)}
      className={`bg-arc-dark border-l-4 ${getRarityClass(weapon.rarity)} rounded-lg p-3
                  cursor-pointer transition-all ${selected ? 'ring-2 ring-arc-accent' : 'hover:bg-gray-800'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-100">{weapon.name}</h4>
          <span className="text-xs text-gray-500">{weapon.type}</span>
        </div>
        <div className="text-right">
          <div className="text-arc-accent font-bold">{weapon.calculated_dps?.toFixed(1) || '?'}</div>
          <div className="text-xs text-gray-500">DPS</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
        <div className="bg-arc-darker rounded px-2 py-1">
          <span className="text-gray-500">DMG: </span>
          <span className="text-gray-300">{weapon.base_damage}</span>
        </div>
        <div className="bg-arc-darker rounded px-2 py-1">
          <span className="text-gray-500">RPM: </span>
          <span className="text-gray-300">{weapon.fire_rate}</span>
        </div>
        <div className="bg-arc-darker rounded px-2 py-1">
          <span className="text-gray-500">ACC: </span>
          <span className="text-gray-300">{weapon.accuracy}%</span>
        </div>
      </div>
    </div>
  );
}

function TierList({ tiers }) {
  const tierColors = {
    S: 'bg-arc-gold/20 border-arc-gold',
    A: 'bg-arc-purple/20 border-arc-purple',
    B: 'bg-arc-blue/20 border-arc-blue',
    C: 'bg-green-500/20 border-green-500',
    D: 'bg-gray-500/20 border-gray-500',
  };

  return (
    <div className="space-y-4">
      {Object.entries(tiers).map(([tier, weapons]) => (
        <div key={tier} className={`rounded-lg border-l-4 ${tierColors[tier]} p-4`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-bold text-gray-100">{tier}</span>
            <span className="text-sm text-gray-500">{weapons.length} weapons</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {weapons.map(weapon => (
              <div
                key={weapon.id}
                className="bg-arc-dark rounded px-3 py-2 text-sm"
              >
                <span className="text-gray-200">{weapon.name}</span>
                <span className="text-arc-accent ml-2">{weapon.calculated_dps?.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadoutBuilder({ weapons, selectedWeapons, onToggleWeapon, stats }) {
  return (
    <div className="bg-arc-dark rounded-lg p-4">
      <h3 className="text-lg font-bold text-gray-100 mb-4">Loadout Builder</h3>

      {/* Selected Weapons */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Selected Weapons</h4>
        {selectedWeapons.length === 0 ? (
          <p className="text-gray-500 text-sm">Click weapons to add them to your loadout</p>
        ) : (
          <div className="space-y-2">
            {selectedWeapons.map(weapon => (
              <div key={weapon.id} className="flex items-center justify-between bg-arc-darker rounded p-2">
                <span className="text-gray-200">{weapon.name}</span>
                <button
                  onClick={() => onToggleWeapon(weapon)}
                  className="text-red-400 hover:text-red-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Loadout Stats</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-arc-darker rounded p-3">
              <div className="text-2xl font-bold text-arc-accent">{stats.total_dps?.toFixed(1)}</div>
              <div className="text-xs text-gray-500">Total DPS</div>
            </div>
            <div className="bg-arc-darker rounded p-3">
              <div className="text-2xl font-bold text-arc-blue">{stats.total_armor?.toFixed(0)}</div>
              <div className="text-xs text-gray-500">Total Armor</div>
            </div>
            <div className="bg-arc-darker rounded p-3">
              <div className="text-2xl font-bold text-gray-300">{stats.total_weight?.toFixed(1)} kg</div>
              <div className="text-xs text-gray-500">Total Weight</div>
            </div>
            <div className="bg-arc-darker rounded p-3">
              <div className="text-2xl font-bold text-red-400">-{stats.movement_penalty?.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Movement</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoadoutsPage() {
  const [tab, setTab] = useState('weapons');
  const [weapons, setWeapons] = useState([]);
  const [armor, setArmor] = useState([]);
  const [tiers, setTiers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeapons, setSelectedWeapons] = useState([]);
  const [loadoutStats, setLoadoutStats] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getWeapons(),
      api.getArmor(),
      api.getWeaponTierList()
    ])
      .then(([weaponsData, armorData, tiersData]) => {
        setWeapons(weaponsData.weapons || []);
        setArmor(armorData.armor || []);
        setTiers(tiersData.tiers || {});
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Calculate loadout stats when selection changes
  useEffect(() => {
    if (selectedWeapons.length === 0) {
      setLoadoutStats(null);
      return;
    }

    api.calculateLoadout({
      weapon_ids: selectedWeapons.map(w => w.id),
      armor_ids: []
    })
      .then(data => setLoadoutStats(data.stats))
      .catch(console.error);
  }, [selectedWeapons]);

  const toggleWeapon = (weapon) => {
    setSelectedWeapons(prev => {
      const exists = prev.find(w => w.id === weapon.id);
      if (exists) {
        return prev.filter(w => w.id !== weapon.id);
      }
      return [...prev, weapon];
    });
  };

  const weaponTypes = [...new Set(weapons.map(w => w.type).filter(Boolean))];
  const filteredWeapons = typeFilter
    ? weapons.filter(w => w.type?.toLowerCase().includes(typeFilter.toLowerCase()))
    : weapons;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('weapons')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors
                     ${tab === 'weapons' ? 'bg-arc-accent text-white' : 'bg-arc-dark text-gray-400 hover:text-white'}`}
        >
          Weapons
        </button>
        <button
          onClick={() => setTab('tierlist')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors
                     ${tab === 'tierlist' ? 'bg-arc-accent text-white' : 'bg-arc-dark text-gray-400 hover:text-white'}`}
        >
          Tier List
        </button>
        <button
          onClick={() => setTab('armor')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors
                     ${tab === 'armor' ? 'bg-arc-accent text-white' : 'bg-arc-dark text-gray-400 hover:text-white'}`}
        >
          Armor
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-arc-dark rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Weapons Tab */}
      {tab === 'weapons' && !loading && (
        <div className="flex gap-6">
          <div className="flex-1">
            {/* Filter */}
            <div className="mb-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-arc-dark border border-gray-700 rounded-lg text-gray-100"
              >
                <option value="">All Weapon Types</option>
                {weaponTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <span className="ml-4 text-sm text-gray-500">
                {filteredWeapons.length} weapons
              </span>
            </div>

            {/* Weapons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredWeapons.map(weapon => (
                <WeaponCard
                  key={weapon.id}
                  weapon={weapon}
                  selected={selectedWeapons.some(w => w.id === weapon.id)}
                  onToggle={toggleWeapon}
                />
              ))}
            </div>
          </div>

          {/* Loadout Builder Sidebar */}
          <div className="w-80 flex-shrink-0">
            <LoadoutBuilder
              weapons={weapons}
              selectedWeapons={selectedWeapons}
              onToggleWeapon={toggleWeapon}
              stats={loadoutStats}
            />
          </div>
        </div>
      )}

      {/* Tier List Tab */}
      {tab === 'tierlist' && !loading && tiers && (
        <div>
          <p className="text-gray-400 mb-4">
            Weapons ranked by effective DPS. S-tier weapons are the top 10% performers.
          </p>
          <TierList tiers={tiers} />
        </div>
      )}

      {/* Armor Tab */}
      {tab === 'armor' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {armor.map(piece => (
            <div key={piece.id} className="bg-arc-dark rounded-lg p-4">
              <h4 className="font-medium text-gray-100">{piece.name}</h4>
              <span className="text-xs text-gray-500">{piece.slot}</span>
              <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                <div className="bg-arc-darker rounded px-2 py-1">
                  <span className="text-gray-500">Armor: </span>
                  <span className="text-arc-blue">{piece.armor_value}</span>
                </div>
                <div className="bg-arc-darker rounded px-2 py-1">
                  <span className="text-gray-500">Weight: </span>
                  <span className="text-gray-300">{piece.weight}kg</span>
                </div>
                <div className="bg-arc-darker rounded px-2 py-1">
                  <span className="text-gray-500">Dur: </span>
                  <span className="text-gray-300">{piece.durability}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
