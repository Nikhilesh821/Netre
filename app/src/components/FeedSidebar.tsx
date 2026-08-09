import { useState, useEffect } from 'react';
import { FunnelIcon, Bars3Icon } from '@heroicons/react/24/outline';

export function FeedSidebar() {
  const [activeDate, setActiveDate] = useState('Wed 15');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/events/?limit=20');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  const isRecent = (dateStr: string) => {
    if (!dateStr) return false;
    const eventTime = new Date(dateStr).getTime();
    const now = new Date().getTime();
    return (now - eventTime) < 5 * 60 * 1000;
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <aside className="feed-sidebar surface-panel">
      <div className="feed-header">
        <span className="feed-title">Feed</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-icon"><FunnelIcon style={{ width: 20, height: 20 }} /></button>
          <button className="btn-icon"><Bars3Icon style={{ width: 20, height: 20 }} /></button>
        </div>
      </div>
      
      <div className="date-selector">
        {['Thu 09', 'Fri 10', 'Sat 11', 'Sun 12', 'Mon 13', 'Tue 14', 'Wed 15'].map(d => {
          const [day, num] = d.split(' ');
          const isActive = d === activeDate;
          return (
            <div key={d} className={`date-item ${isActive ? 'active' : ''}`} onClick={() => setActiveDate(d)}>
              <span className="day">{day}</span>
              <span className="date">{num}</span>
            </div>
          );
        })}
      </div>

      <div className="feed-list">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading events...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No events found</div>
        ) : (
          events.map((ev) => {
            const recent = ev.occurred_at && isRecent(ev.occurred_at);
            return (
              <div key={ev.id} className="feed-card">
                <div className="feed-thumbnail"></div>
                <div className="feed-info">
                  <div className="feed-camera" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Camera {ev.camera_id}
                    {recent && <span style={{ width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />}
                  </div>
                  <div className="feed-type">{ev.label || ev.caption || 'Event'} {ev.confidence ? `(${(ev.confidence * 100).toFixed(0)}%)` : ''}</div>
                  <div className="feed-time">{ev.occurred_at ? formatTime(ev.occurred_at) : ''}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </aside>
  );
}
