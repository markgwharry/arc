import { NavLink, Outlet } from 'react-router-dom';
import { useStats } from '../hooks/useItems';

const navItems = [
  { path: '/', label: 'Items', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { path: '/quests', label: 'Quests', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { path: '/maps', label: 'Maps', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { path: '/loadouts', label: 'Loadouts', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { path: '/events', label: 'Events', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export default function Layout() {
  const { stats } = useStats();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-arc-dark border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-arc-accent rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-100">
                  Arc Raiders <span className="text-arc-accent">Companion</span>
                </h1>
              </div>
            </div>

            {stats && (
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
                <span><span className="text-arc-accent font-semibold">{stats.total_items}</span> items</span>
                <span><span className="text-arc-blue font-semibold">{stats.total_quests}</span> quests</span>
                <span><span className="text-arc-purple font-semibold">{stats.total_maps}</span> maps</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 pb-2 overflow-x-auto">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                   ${isActive
                     ? 'bg-arc-accent text-white'
                     : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                   }`
                }
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-arc-dark border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Data provided by community APIs: MetaForge, ARDB, RaidTheory</p>
            <p className="mt-1">
              Arc Raiders is a trademark of Embark Studios. This is a fan-made companion app.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
