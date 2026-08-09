import { useEffect, useState } from 'react';
import { WifiIcon, Battery50Icon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { ZoneEditor } from '../components/ZoneEditor';
import { fetchCameras } from '../lib/api';

export function LiveView() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [editingZoneFor, setEditingZoneFor] = useState<number | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);

  useEffect(() => {
    fetchCameras().then(data => setCameras(data)).catch(console.error);
  }, []);

  const CAMERA_GROUPS = [
    {
      name: 'All Cameras',
      cameras: cameras.map(c => ({
        id: c.id,
        name: c.name,
        time: new Date(c.created_at || Date.now()).toLocaleString(),
        value: c.status === 'online' ? 100 : 0
      }))
    }
  ];
  
  const filters = ['All', 'Basement', 'Backyard', "Front Door", "Kid's Room", 'Kitchen'];
  
  const visibleGroups = CAMERA_GROUPS.filter(g => activeFilter === 'All' || g.name === activeFilter);

  return (
    <>
      <div className="content-header">
        <div className="filter-pills">
          {filters.map(f => (
            <button 
              key={f} 
              className={`pill ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="content-body" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {visibleGroups.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No cameras in this group</div>
        ) : (
          visibleGroups.map(group => (
            <div key={group.name} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600 }}>{group.name}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
              {group.cameras.map(cam => (
                <div key={cam.id} style={{ 
                  position: 'relative', 
                  aspectRatio: '16/9',
                  background: 'var(--bg-app)', 
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {/* Real MJPEG video stream */}
                  <img 
                    src={`http://localhost:8000/api/v1/streams/live/${cam.id}`} 
                    alt={cam.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22225%22%20fill%3D%22%231f2937%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%3EOffline%3C%2Ftext%3E%3C%2Fsvg%3E';
                    }}
                  />
                  
                  {/* Top Overlays */}
                  <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, color: 'white' }}>
                    <WifiIcon style={{ width: 20, height: 20 }} />
                    <Battery50Icon style={{ width: 20, height: 20 }} />
                  </div>
                  
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{cam.value}</span>
                    <EllipsisHorizontalIcon style={{ width: 24, height: 24 }} />
                  </div>
                  
                  {/* Bottom Overlays */}
                  <div style={{ position: 'absolute', bottom: 16, left: 16, color: 'white', display: 'flex', justifyContent: 'space-between', right: 16, alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{cam.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{cam.time}</div>
                    </div>
                    <button 
                      onClick={() => setEditingZoneFor(cam.id)}
                      style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: 12, backdropFilter: 'blur(4px)' }}
                    >
                      Draw Zones
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          ))
        )}
      </div>

      {editingZoneFor !== null && (
        <ZoneEditor 
          cameraId={editingZoneFor} 
          onClose={() => setEditingZoneFor(null)} 
        />
      )}
    </>
  );
}
