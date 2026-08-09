import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FunnelIcon, PlayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function EventsView() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraFilter, setCameraFilter] = useState('All');
  const [labelFilter, setLabelFilter] = useState('All');
  const navigate = useNavigate();

  const fetchEventsData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/events/?limit=100');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
    const interval = setInterval(fetchEventsData, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter(evt => {
    if (cameraFilter !== 'All' && evt.camera_id.toString() !== cameraFilter) return false;
    if (labelFilter !== 'All' && evt.label !== labelFilter) return false;
    return true;
  });

  const uniqueCameras = Array.from(new Set(events.map(e => e.camera_id)));
  const uniqueLabels = Array.from(new Set(events.map(e => e.label)));

  return (
    <>
      <div className="content-header">
        <div className="filter-pills" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
            <FunnelIcon style={{ width: 20, height: 20 }} />
            <span style={{ fontWeight: 500 }}>Filters:</span>
          </div>
          <select 
            value={cameraFilter} 
            onChange={e => setCameraFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }}
          >
            <option value="All">All Cameras</option>
            {uniqueCameras.map(cam => <option key={String(cam)} value={String(cam)}>Camera {String(cam)}</option>)}
          </select>
          <select 
            value={labelFilter} 
            onChange={e => setLabelFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)' }}
          >
            <option value="All">All Labels</option>
            {uniqueLabels.map(label => <option key={String(label)} value={String(label)}>{String(label)}</option>)}
          </select>
        </div>
      </div>
      
      <div className="content-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>Event Log</h2>
        
        <div className="surface-panel" style={{ padding: 24, minHeight: 400 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', gap: 12 }}>
              <ExclamationTriangleIcon style={{ width: 48, height: 48, opacity: 0.5 }} />
              <p>No events found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredEvents.map(evt => (
                <div key={evt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-app)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                      Cam {evt.camera_id}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 16 }}>{evt.caption || evt.label}</span>
                        <span style={{ fontSize: 12, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-secondary)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                          {evt.label}
                        </span>
                        <span style={{ fontSize: 12, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                          {Math.round(evt.confidence * 100)}%
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {new Date(evt.occurred_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/playback?camera=${evt.camera_id}&time=${evt.occurred_at}`)}
                    style={{ padding: '8px 16px', background: 'var(--accent-primary)', color: 'var(--bg-surface)', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}
                  >
                    <PlayIcon style={{ width: 16, height: 16 }} />
                    Play
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
