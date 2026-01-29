import { useState, useEffect } from 'react';
import * as api from '../services/api';

function CountdownTimer({ targetTime, label }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetTime);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Active Now!');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-arc-accent">{timeLeft}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function EventCard({ event }) {
  const getEventTypeStyle = (type) => {
    const styles = {
      storm: 'border-arc-purple bg-arc-purple/10',
      merchant: 'border-arc-gold bg-arc-gold/10',
      special: 'border-arc-accent bg-arc-accent/10',
      daily: 'border-green-500 bg-green-500/10',
      weekly: 'border-arc-blue bg-arc-blue/10',
    };
    return styles[(type || '').toLowerCase()] || 'border-gray-600 bg-gray-600/10';
  };

  return (
    <div className={`rounded-lg border-l-4 ${getEventTypeStyle(event.type)} p-4`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-100">{event.name || event.title}</h3>
          <span className="text-sm text-gray-500">{event.type}</span>
          {event.description && (
            <p className="text-sm text-gray-400 mt-2">{event.description}</p>
          )}
          {event.location && (
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {event.location}
            </div>
          )}
        </div>
        {event.start_time && (
          <CountdownTimer targetTime={event.start_time} label="Starts in" />
        )}
        {event.end_time && !event.start_time && (
          <CountdownTimer targetTime={event.end_time} label="Ends in" />
        )}
      </div>

      {event.rewards && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <span className="text-xs text-gray-500">Rewards: </span>
          <span className="text-sm text-arc-gold">{event.rewards}</span>
        </div>
      )}
    </div>
  );
}

function TraderCard({ trader }) {
  return (
    <div className="bg-arc-dark rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        {trader.image_url ? (
          <img src={trader.image_url} alt={trader.name} className="w-12 h-12 rounded-full" />
        ) : (
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-100">{trader.name}</h3>
          {trader.location && (
            <span className="text-sm text-gray-500">{trader.location}</span>
          )}
        </div>
      </div>

      {trader.description && (
        <p className="text-sm text-gray-400 mb-4">{trader.description}</p>
      )}

      {trader.specialization && (
        <div className="text-sm mb-3">
          <span className="text-gray-500">Specializes in: </span>
          <span className="text-arc-accent">{trader.specialization}</span>
        </div>
      )}

      {trader.inventory && trader.inventory.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">Current Stock</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {trader.inventory.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-arc-darker rounded px-3 py-2 text-sm">
                <span className="text-gray-300">{item.name || item}</span>
                {item.price && (
                  <span className="text-arc-gold">{item.price}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {trader.reset_time && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <CountdownTimer targetTime={trader.reset_time} label="Stock resets in" />
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('events');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getEvents(),
      api.getTraders()
    ])
      .then(([eventsData, tradersData]) => {
        setEvents(eventsData.events || []);
        setTraders(tradersData.traders || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Simulated events for demo (when API returns empty)
  const demoEvents = events.length > 0 ? events : [
    {
      id: '1',
      name: 'Ion Storm',
      type: 'storm',
      description: 'Dangerous electrical storm affecting the Spaceport region',
      location: 'Spaceport',
      start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Wandering Merchant',
      type: 'merchant',
      description: 'Rare trader with exclusive items',
      location: 'Blue Gate',
      start_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Weekly Challenge',
      type: 'weekly',
      description: 'Complete raids with limited gear for bonus rewards',
      end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      rewards: '2x XP, Exclusive Weapon Skin',
    },
  ];

  const demoTraders = traders.length > 0 ? traders : [
    {
      id: '1',
      name: 'Viktor',
      location: 'Hideout',
      specialization: 'Weapons & Attachments',
      description: 'Your main arms dealer. Stocks common to rare weapons.',
      inventory: [
        { name: 'AK-47', price: '15,000' },
        { name: 'M4A1', price: '18,500' },
        { name: 'Suppressor', price: '5,200' },
      ],
      reset_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Elena',
      location: 'Hideout',
      specialization: 'Medical Supplies',
      description: 'Medic specializing in healing items and stims.',
      inventory: [
        { name: 'Medkit', price: '3,500' },
        { name: 'Bandage', price: '500' },
        { name: 'Combat Stim', price: '8,000' },
      ],
      reset_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('events')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors
                     ${tab === 'events' ? 'bg-arc-accent text-white' : 'bg-arc-dark text-gray-400 hover:text-white'}`}
        >
          Events & Timers
        </button>
        <button
          onClick={() => setTab('traders')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors
                     ${tab === 'traders' ? 'bg-arc-accent text-white' : 'bg-arc-dark text-gray-400 hover:text-white'}`}
        >
          Traders
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-arc-dark rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Events Tab */}
      {tab === 'events' && !loading && (
        <div>
          <p className="text-gray-400 text-sm mb-4">
            Live event timers and schedules. Times update in real-time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {demoEvents.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-400">No active events</h3>
              <p className="text-sm text-gray-500 mt-1">Check back later for upcoming events</p>
            </div>
          )}
        </div>
      )}

      {/* Traders Tab */}
      {tab === 'traders' && !loading && (
        <div>
          <p className="text-gray-400 text-sm mb-4">
            Trader inventory and restock timers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoTraders.map(trader => (
              <TraderCard key={trader.id} trader={trader} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
