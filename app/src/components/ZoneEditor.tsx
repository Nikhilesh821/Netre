import { useState, useRef, useEffect } from 'react';
import { fetchZones, createZone, deleteZone } from '../lib/api';

export function ZoneEditor({ cameraId, onClose }: { cameraId: number, onClose: () => void }) {
  const [zones, setZones] = useState<any[]>([]);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [mousePos, setMousePos] = useState<[number, number] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoneName, setZoneName] = useState('New Zone');
  const [transform, setTransform] = useState({ rotate: 0, scale: 1 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadZones();
  }, [cameraId]);

  const loadZones = async () => {
    try {
      const data = await fetchZones(cameraId);
      setZones(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getRelativePos = (e: React.MouseEvent): [number, number] | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return [x, y];
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getRelativePos(e);
    if (pos) {
      setCurrentPoints([...currentPoints, pos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const pos = getRelativePos(e);
    if (pos) setMousePos(pos);
  };

  const handleSave = async () => {
    if (currentPoints.length < 3) {
      alert('A zone must have at least 3 points.');
      return;
    }
    try {
      await createZone(cameraId, zoneName, currentPoints);
      setCurrentPoints([]);
      setIsDrawing(false);
      setMousePos(null);
      loadZones();
    } catch (err) {
      console.error(err);
      alert('Failed to save zone');
    }
  };

  const handleDelete = async (zoneId: number) => {
    try {
      await deleteZone(cameraId, zoneId);
      loadZones();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to convert relative points to absolute percentages for SVG
  const toPts = (pts: [number, number][]) => pts.map(p => `${p[0]*100},${p[1]*100}`).join(' ');

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', background: '#09090b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ margin: 0, fontWeight: 600, fontSize: 18, color: 'white' }}>Zone Editor - Camera {cameraId}</h2>
        <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Close</button>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: 380, background: '#18181b', borderRight: '1px solid rgba(255,255,255,0.1)', padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', boxShadow: '10px 0 30px rgba(0,0,0,0.5)', zIndex: 10 }}>
          <div>
            <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '0.05em' }}>Drawing Tools</h3>
            {!isDrawing ? (
              <button 
                onClick={() => { setIsDrawing(true); setCurrentPoints([]); setZoneName('New Zone'); }}
                style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                + Draw New Zone
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input 
                  type="text" 
                  value={zoneName}
                  onChange={e => setZoneName(e.target.value)}
                  placeholder="Zone Name (e.g. Front Door)"
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSave} style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                  <button onClick={() => { setIsDrawing(false); setCurrentPoints([]); }} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>Click on the video to place points. A polygon needs at least 3 points.</p>
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '0.05em' }}>Existing Zones</h3>
            {zones.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No zones defined yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {zones.map(z => (
                  <div key={z.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 500 }}>{z.name}</span>
                    <button onClick={() => handleDelete(z.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, padding: 0 }}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Video Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 40, background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
          
          {/* Transform Controls */}
          <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8, zIndex: 20 }}>
            <button onClick={() => setTransform(p => ({ ...p, rotate: (p.rotate + 90) % 360 }))} title="Rotate 90deg" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 36, height: 36, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
              <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(4, p.scale + 0.2) }))} title="Zoom In" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 36, height: 36, borderRadius: '6px', cursor: 'pointer', fontSize: 18, fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>+</button>
            <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.2, p.scale - 0.2) }))} title="Zoom Out" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: 36, height: 36, borderRadius: '6px', cursor: 'pointer', fontSize: 18, fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>-</button>
          </div>

          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 1280, aspectRatio: '16/9', background: '#000', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', transform: `rotate(${transform.rotate}deg) scale(${transform.scale})`, transition: 'transform 0.2s ease-out' }}>
              <img 
                src={`http://localhost:8000/api/v1/streams/live/${cameraId}`} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                alt="Live Feed"
              />
              <svg 
                ref={svgRef}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: isDrawing ? 'crosshair' : 'default' }}
              onClick={handleClick}
              onMouseMove={handleMouseMove}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Draw saved zones */}
              {zones.map(z => (
                <polygon 
                  key={z.id}
                  points={toPts(z.polygon_points)}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth="0.3"
                />
              ))}

              {/* Draw current active zone */}
              {isDrawing && currentPoints.length > 0 && (
                <polyline 
                  points={`${toPts(currentPoints)}${mousePos ? ` ${mousePos[0]*100},${mousePos[1]*100}` : ''}`}
                  fill="rgba(16, 185, 129, 0.15)"
                  stroke="#10b981"
                  strokeWidth="0.4"
                  strokeDasharray="1 0.5"
                />
              )}
              
              {/* Draw points for active zone */}
              {isDrawing && currentPoints.map((pt, i) => (
                <circle key={i} cx={pt[0]*100} cy={pt[1]*100} r="1.5" fill="#10b981" stroke="#fff" strokeWidth="0.4" />
              ))}
            </svg>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
