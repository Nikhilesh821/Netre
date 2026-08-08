import { NavLink, Outlet } from 'react-router-dom'
import { VideoCameraIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline'

export function AppShell() {
  return (
    <div className="netre-shell">
      <header className="netre-header">
        <div className="netre-logo">
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <VideoCameraIcon style={{ width: 20, height: 20 }} />
          </div>
          Netre
        </div>
        <nav className="netre-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            <ChartBarIcon style={{ width: 16, height: 16, display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
            Dashboard
          </NavLink>
          <NavLink to="/live" className={({ isActive }) => isActive ? 'active' : ''}>
            <VideoCameraIcon style={{ width: 16, height: 16, display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
            Live View
          </NavLink>
          <NavLink to="/playback" className={({ isActive }) => isActive ? 'active' : ''}>
            <ClockIcon style={{ width: 16, height: 16, display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
            Playback
          </NavLink>
        </nav>
      </header>
      <main className="netre-content">
        <Outlet />
      </main>
    </div>
  )
}
