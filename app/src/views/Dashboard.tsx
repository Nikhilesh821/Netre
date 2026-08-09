import { useState, useEffect } from 'react';
import { VideoCameraIcon, ExclamationTriangleIcon, ServerIcon, WifiIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { fetchCameras, fetchEvents, searchEvents, fetchSystemStats } from '../lib/api';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [cameraCount, setCameraCount] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [storageUsed, setStorageUsed] = useState('0 MB');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    async function loadData() {
      try {
        const cams = await fetchCameras();
        const evts = await fetchEvents(undefined, 50); // Get latest 50 events
        const stats = await fetchSystemStats();
        
        setCameraCount(cams.length);
        setEvents(evts);
        setStorageUsed(`${stats.storage_used_mb} MB`);
        setStatus('API Connected');
      } catch (err) {
        console.warn('Backend API not reachable, using dummy data.');
        setStatus('Offline');
      }
    }
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      const evts = await fetchEvents(undefined, 50);
      setEvents(evts);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchEvents(searchQuery);
      setEvents(results);
    } catch(err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const metrics = [
    { name: 'Active Cameras', value: cameraCount.toString(), icon: VideoCameraIcon, color: 'var(--success)' },
    { name: 'Total Events', value: events.length.toString(), icon: ExclamationTriangleIcon, color: 'var(--danger)' },
    { name: 'Storage Used', value: storageUsed, icon: ServerIcon, color: 'var(--text-main)' },
    { name: 'System Status', value: status, icon: WifiIcon, color: status === 'Offline' ? 'var(--danger)' : 'var(--success)' },
  ];

  return (
    <>
      <div className="content-header">
        <div className="filter-pills">
          {['Overview', 'Health', 'Storage'].map(tab => (
            <button 
              key={tab} 
              className={`pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="content-body" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>System {activeTab}</h2>

        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {metrics.map(metric => (
              <div key={metric.name} className="surface-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ 
                  width: 56, height: 56, borderRadius: 'var(--radius-md)', 
                  background: 'var(--bg-app)',
                  color: metric.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border)'
                }}>
                  <metric.icon style={{ width: 28, height: 28 }} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{metric.name}</p>
                  <h3 style={{ fontSize: 28, fontWeight: 700 }}>{metric.value}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
        {(activeTab === 'Overview' || activeTab === 'Health') && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            <div className="surface-panel" style={{ padding: 24, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>AI Search & Recent Events</h2>
              </div>
              
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <input 
                  type="text" 
                  placeholder='Natural Language Search (e.g., "find person yesterday")' 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: 14 }}
                />
                <button type="submit" disabled={isSearching} style={{ padding: '10px 20px', background: 'var(--accent-secondary)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                  <MagnifyingGlassIcon style={{ width: 16, height: 16 }} />
                  {isSearching ? 'Searching...' : 'Ask AI'}
                </button>
              </form>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
                {events.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    No events found
                  </div>
                ) : (
                  events.slice(0, 15).map((evt: any) => (
                    <div key={evt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-app)', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} />
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{evt.caption}</span>
                          <span style={{ fontSize: 12, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-secondary)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                            {Math.round(evt.confidence * 100)}% Conf
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          Camera {evt.camera_id} • {new Date(evt.occurred_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="surface-panel" style={{ padding: 24, minHeight: 400 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>System Health</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                    <span style={{ color: 'var(--text-muted)' }}>CPU Usage</span>
                    <span style={{ fontWeight: 600 }}>24%</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-app)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: '24%', height: '100%', background: 'var(--text-main)', borderRadius: 4 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Memory</span>
                    <span style={{ fontWeight: 600 }}>4.2 GB / 8 GB</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-app)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: '52%', height: '100%', background: 'var(--text-main)', borderRadius: 4 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Network</span>
                    <span style={{ fontWeight: 600 }}>12.4 Mbps</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-app)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: '15%', height: '100%', background: 'var(--text-main)', borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
