import { useState } from 'react';
import { FunnelIcon, Bars3Icon } from '@heroicons/react/24/outline';

const DUMMY_EVENTS = [
  { id: 1, cam: 'Front Door 2', type: 'PIR Alarm', time: '12:19:49 PM', date: 'Wed 15' },
  { id: 2, cam: 'Front Door 2', type: 'PIR Alarm', time: '12:01:03 PM', date: 'Wed 15' },
  { id: 3, cam: 'Front Door 2', type: 'PIR Alarm', time: '11:34:50 AM', date: 'Wed 15' },
  { id: 4, cam: 'Front Door 1', type: 'PIR Alarm', time: '11:28:15 AM', date: 'Wed 15' },
  { id: 5, cam: 'Front Door 1', type: 'PIR Alarm', time: '11:34:50 AM', date: 'Wed 15' },
  { id: 6, cam: 'Front Door 1', type: 'PIR Alarm', time: '11:31:48 AM', date: 'Wed 15' },
];

export function FeedSidebar() {
  const [activeDate, setActiveDate] = useState('Wed 15');

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
        {DUMMY_EVENTS.map((ev, i) => (
          <div key={ev.id} className={`feed-card ${i < 2 ? 'unread' : ''}`}>
            <div className="feed-thumbnail"></div>
            <div className="feed-info">
              <div className="feed-camera">{ev.cam}</div>
              <div className="feed-type">{ev.type}</div>
              <div className="feed-time">{ev.time}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
