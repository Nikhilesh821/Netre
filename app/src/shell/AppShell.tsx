import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { HomeIcon, PhotoIcon, BellIcon, PlusIcon, MagnifyingGlassIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '../components/ThemeToggle';
import { FeedSidebar } from '../components/FeedSidebar';
import { Logo } from '../components/Logo';

export function AppShell() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <nav className="nav-sidebar surface-panel">
        <div className="nav-links">
          <Logo className="nav-logo-container" />
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Home">
            <HomeIcon style={{ width: 24, height: 24 }} />
          </NavLink>
          <NavLink to="/live" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Gallery">
            <PhotoIcon style={{ width: 24, height: 24 }} />
          </NavLink>
          <NavLink to="/playback" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Notifications">
            <BellIcon style={{ width: 24, height: 24 }} />
          </NavLink>
          <button className="nav-item" title="Add Device" onClick={() => setShowAddModal(true)}>
            <PlusIcon style={{ width: 24, height: 24 }} />
          </button>
          <button className="nav-item" title="Search" onClick={() => alert('Search feature coming soon!')}>
            <MagnifyingGlassIcon style={{ width: 24, height: 24 }} />
          </button>
        </div>
        
        <div className="nav-links">
          <ThemeToggle />
          <button className="nav-item" title="Profile">
            <UserCircleIcon style={{ width: 32, height: 32 }} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content surface-panel">
        <Outlet />
      </main>

      {/* Right Feed Sidebar */}
      <FeedSidebar />

      {/* Add Device Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="surface-panel" style={{ width: 400, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>Add New Camera</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><XMarkIcon style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" placeholder="Camera Name" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
              <input type="text" placeholder="RTSP Stream URL" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
              <button style={{ padding: '10px', background: 'var(--accent-secondary)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }} onClick={() => {
                alert('Camera added!');
                setShowAddModal(false);
              }}>
                Save Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
