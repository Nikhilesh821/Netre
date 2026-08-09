import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiIcon, Battery50Icon, EllipsisHorizontalIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ZoneEditor } from '../components/ZoneEditor';
import { fetchCameras, fetchRecentAlerts } from '../lib/api';

export function LiveView() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [editingZoneFor, setEditingZoneFor] = useState<number | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [transforms, setTransforms] = useState<Record<number, { rotate: number, scale: number }>>({});
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [expandedCam, setExpandedCam] = useState<number | null>(null);
  const navigate = useNavigate();

  const updateTransform = (id: number, rotateDelta: number, scaleDelta: number) => {
    setTransforms(prev => {
      const current = prev[id] || { rotate: 0, scale: 1 };
      return {
        ...prev,
        [id]: {
          rotate: (current.rotate + rotateDelta) % 360,
          scale: Math.max(0.2, Math.min(4, current.scale + scaleDelta))
        }
      };
    });
  };

  useEffect(() => {
    fetchCameras().then(data => setCameras(data)).catch(console.error);
    const loadAlerts = () => {
      fetchRecentAlerts().then(setRecentAlerts).catch(console.error);
    };
    loadAlerts();
    const interval = setInterval(loadAlerts, 15000);
    return () => clearInterval(interval);
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
            
            <div style={{ display: expandedCam ? 'flex' : 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16, height: expandedCam ? '80vh' : 'auto' }}>
              {group.cameras.filter(c => expandedCam === null || c.id === expandedCam).map(cam => (
                <div key={cam.id} style={{ 
                  position: 'relative', 
                  flex: expandedCam ? 1 : 'unset',
                  aspectRatio: expandedCam ? 'unset' : '16/9',
                  background: 'var(--bg-app)', 
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: expandedCam ? 'default' : 'pointer'
                }} onClick={() => !expandedCam && setExpandedCam(cam.id)}>
                  {/* Real MJPEG video stream */}
                  <img 
                    src={`http://localhost:8000/api/v1/streams/live/${cam.id}`} 
                    alt={cam.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transform: `rotate(${transforms[cam.id]?.rotate || 0}deg) scale(${transforms[cam.id]?.scale || 1})`,
                      transition: 'transform 0.2s ease-out'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22225%22%20fill%3D%22%231f2937%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%3EOffline%3C%2Ftext%3E%3C%2Fsvg%3E';
                    }}
                  />
                  
                  {/* Top Overlays */}
                  <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, color: 'white', alignItems: 'center' }}>
                    <WifiIcon style={{ width: 20, height: 20 }} />
                    <Battery50Icon style={{ width: 20, height: 20 }} />
                    {recentAlerts.some(a => a.camera_id === cam.id) && (
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} title="Recent Alert" />
                    )}
                  </div>
                  
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, color: 'white' }}>
                    {expandedCam === cam.id && (
                      <button onClick={(e) => { e.stopPropagation(); setExpandedCam(null); }} title="Close Fullscreen" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 28, height: 28, borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', marginRight: 8 }}>
                        <XMarkIcon style={{ width: 16, height: 16 }} />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); updateTransform(cam.id, 90, 0); }} title="Rotate 90deg" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 28, height: 28, borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                      <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); updateTransform(cam.id, 0, 0.2); }} title="Zoom In" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 28, height: 28, borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', fontWeight: 'bold' }}>+</button>
                    <button onClick={(e) => { e.stopPropagation(); updateTransform(cam.id, 0, -0.2); }} title="Zoom Out" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 28, height: 28, borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', fontWeight: 'bold' }}>-</button>
                    <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.3)', margin: '0 4px' }} />
                    <span style={{ fontSize: 13, fontWeight: 500, marginRight: 4 }}>{cam.value}</span>
                    <EllipsisHorizontalIcon style={{ width: 24, height: 24 }} />
                  </div>
                  
                  {/* Bottom Overlays */}
                  <div style={{ position: 'absolute', bottom: 16, left: 16, color: 'white', display: 'flex', justifyContent: 'space-between', right: 16, alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{cam.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{cam.time}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/playback?camera=${cam.id}`); }}
                        style={{ padding: '6px 12px', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <PlayIcon style={{ width: 14, height: 14 }} /> Playback
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingZoneFor(cam.id); }}
                        style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: 12, backdropFilter: 'blur(4px)' }}
                      >
                        Draw Zones
                      </button>
                    </div>
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
