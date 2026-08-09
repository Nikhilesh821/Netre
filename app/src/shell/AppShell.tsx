import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { HomeIcon, PhotoIcon, BellIcon, PlusIcon, MagnifyingGlassIcon, UserCircleIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '../components/ThemeToggle';
import { FeedSidebar } from '../components/FeedSidebar';
import { Logo } from '../components/Logo';

export function AppShell() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCamName, setNewCamName] = useState('');
  const [newCamUrl, setNewCamUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/events/recent-alerts');
        if (res.ok) {
          const data = await res.json();
          setAlertCount(data.count || 0);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <nav className={`nav-sidebar surface-panel ${!isSidebarExpanded ? 'collapsed' : ''}`}>
        <div className="nav-links">
          <Logo className="nav-logo-container" />
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Dashboard">
            <HomeIcon style={{ width: 24, height: 24 }} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/live" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Live View">
            <PhotoIcon style={{ width: 24, height: 24 }} />
            <span>Live View</span>
          </NavLink>
          <NavLink to="/playback" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Events & Playback">
            <BellIcon style={{ width: 24, height: 24 }} />
            <span>Events & Playback</span>
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Events Log">
            <div style={{ position: 'relative' }}>
              <ExclamationTriangleIcon style={{ width: 24, height: 24 }} />
              {alertCount > 0 && (
                <div style={{ position: 'absolute', top: -4, right: -4, width: 12, height: 12, borderRadius: '50%', background: 'var(--danger)', border: '2px solid var(--bg-surface)' }} />
              )}
            </div>
            <span>Events</span>
          </NavLink>
          <button className="nav-item" title="Add Device" onClick={() => setShowAddModal(true)}>
            <PlusIcon style={{ width: 24, height: 24 }} />
            <span>Add Device</span>
          </button>
          <button className="nav-item" title="Natural-Language Search" onClick={() => alert('Search feature coming soon!')}>
            <MagnifyingGlassIcon style={{ width: 24, height: 24 }} />
            <span>AI Search</span>
          </button>
        </div>
        
        <div className="nav-links">
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, marginBottom: 8 }}>
             <ThemeToggle />
             {isSidebarExpanded && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Theme</span>}
          </div>
          <button className="nav-item" title="Profile">
            <UserCircleIcon style={{ width: 24, height: 24 }} />
            <span>Account</span>
          </button>
          <button className="nav-item" title="Toggle Sidebar" onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} style={{ marginTop: 16 }}>
            <svg style={{ width: 24, height: 24, transform: isSidebarExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span>Collapse</span>
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
              <input type="text" placeholder="Camera Name (e.g. Phone Camera)" value={newCamName} onChange={e => setNewCamName(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
              <input type="text" placeholder="IP Camera Stream URL (e.g. http://192.168.1.5:8080/video)" value={newCamUrl} onChange={e => setNewCamUrl(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }} />
              <button disabled={isSubmitting} style={{ padding: '10px', background: 'var(--accent-secondary)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 500, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }} onClick={async () => {
                if (!newCamName || !newCamUrl) return alert("Please fill all fields");
                setIsSubmitting(true);
                try {
                  const res = await fetch('http://localhost:8000/api/v1/cameras/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newCamName, stream_url: newCamUrl, source_type: 'live', status: 'online' })
                  });
                  if (!res.ok) throw new Error('Failed to save');
                  alert('Camera added successfully! Refresh to see changes.');
                  setShowAddModal(false);
                  setNewCamName('');
                  setNewCamUrl('');
                } catch(e) {
                  alert('Error adding camera. Is the backend running?');
                } finally {
                  setIsSubmitting(false);
                }
              }}>
                {isSubmitting ? 'Saving...' : 'Save Camera'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
