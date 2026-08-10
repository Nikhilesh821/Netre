import { useState, useRef, useEffect } from 'react';
import { fetchZones, createZone, deleteZone } from '../lib/api';

type DrawingMode = 'polygon' | 'rectangle' | 'circle' | 'freeform';

export function ZoneEditor({ cameraId, onClose }: { cameraId: number, onClose: () => void }) {
  const [zones, setZones] = useState<any[]>([]);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [mousePos, setMousePos] = useState<[number, number] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('polygon');
  const [zoneName, setZoneName] = useState('New Zone');
  const [transform, setTransform] = useState({ rotate: 0, scale: 1 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  const getRelativePos = (e: React.MouseEvent | React.TouchEvent): [number, number] | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    return [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))]; // clamp to 0-1
  };

  const generateCirclePoints = (center: [number, number], radiusX: number, radiusY: number, numPoints = 32): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      pts.push([
        center[0] + radiusX * Math.cos(angle),
        center[1] + radiusY * Math.sin(angle)
      ]);
    }
    return pts;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getRelativePos(e);
    if (!pos) return;

    if (drawingMode === 'polygon') {
      setCurrentPoints([...currentPoints, pos]);
    } else {
      // Drag-based shapes
      setIsDragging(true);
      setDragStart(pos);
      if (drawingMode === 'freeform') {
        setCurrentPoints([pos]);
      } else {
        // Rectangle and circle start with 0 area
        setCurrentPoints([]);
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getRelativePos(e);
    if (!pos) return;
    
    setMousePos(pos);

    if (!isDragging || !dragStart) return;

    if (drawingMode === 'rectangle') {
      const minX = Math.min(dragStart[0], pos[0]);
      const maxX = Math.max(dragStart[0], pos[0]);
      const minY = Math.min(dragStart[1], pos[1]);
      const maxY = Math.max(dragStart[1], pos[1]);
      setCurrentPoints([
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY]
      ]);
    } else if (drawingMode === 'circle') {
      const radiusX = Math.abs(pos[0] - dragStart[0]);
      const radiusY = Math.abs(pos[1] - dragStart[1]);
      setCurrentPoints(generateCirclePoints(dragStart, radiusX, radiusY));
    } else if (drawingMode === 'freeform') {
      // Only add point if moved far enough to avoid thousands of points
      const lastPoint = currentPoints[currentPoints.length - 1];
      if (lastPoint) {
        const dist = Math.hypot(pos[0] - lastPoint[0], pos[1] - lastPoint[1]);
        if (dist > 0.01) { // roughly 1% of screen size distance required
          setCurrentPoints([...currentPoints, pos]);
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
    }
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

  const getToolStyle = (mode: DrawingMode) => ({
    padding: '12px 8px',
    background: drawingMode === mode ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${drawingMode === mode ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 8,
    color: 'white',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 500,
    transition: 'all 0.15s'
  });

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
                onClick={() => { setIsDrawing(true); setCurrentPoints([]); setZoneName('New Zone'); setDrawingMode('polygon'); }}
                style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                + Draw New Zone
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* MS-Paint Style Toolbar */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={getToolStyle('polygon')} onClick={() => { setDrawingMode('polygon'); setCurrentPoints([]); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 22h20L12 2z"/></svg>
                    Polygon
                  </button>
                  <button style={getToolStyle('rectangle')} onClick={() => { setDrawingMode('rectangle'); setCurrentPoints([]); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                    Rect
                  </button>
                  <button style={getToolStyle('circle')} onClick={() => { setDrawingMode('circle'); setCurrentPoints([]); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    Circle
                  </button>
                  <button style={getToolStyle('freeform')} onClick={() => { setDrawingMode('freeform'); setCurrentPoints([]); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                    Pen
                  </button>
                </div>

                <div style={{ padding: 12, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {drawingMode === 'polygon' && 'Click points to create a polygon. At least 3 points required.'}
                  {drawingMode === 'rectangle' && 'Click and drag to draw a rectangular zone.'}
                  {drawingMode === 'circle' && 'Click at the center and drag outward to draw a circle.'}
                  {drawingMode === 'freeform' && 'Hold click and draw freely like a pen. Automatically converts to polygon points.'}
                </div>

                <input 
                  type="text" 
                  value={zoneName}
                  onChange={e => setZoneName(e.target.value)}
                  placeholder="Zone Name (e.g. Front Door)"
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSave} disabled={currentPoints.length < 3} style={{ flex: 1, padding: '10px', background: currentPoints.length >= 3 ? '#10b981' : 'rgba(16, 185, 129, 0.3)', color: '#fff', border: 'none', borderRadius: '8px', cursor: currentPoints.length >= 3 ? 'pointer' : 'not-allowed', fontWeight: 600 }}>Save</button>
                  <button onClick={() => { setIsDrawing(false); setCurrentPoints([]); }} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
                
                {currentPoints.length > 0 && drawingMode === 'polygon' && (
                  <button 
                    onClick={() => setCurrentPoints(pts => pts.slice(0, -1))}
                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Undo Last Point
                  </button>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                  <span>{currentPoints.length} points</span>
                  <span>(min 3 to save)</span>
                </div>
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
            <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: 1280, aspectRatio: '16/9', background: '#000', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', transform: `rotate(${transform.rotate}deg) scale(${transform.scale})`, transition: 'transform 0.2s ease-out', overflow: 'hidden', touchAction: 'none' }}>
              <img 
                src={`http://localhost:8000/api/v1/streams/live/${cameraId}`} 
                style={{ width: '100%', height: '100%', objectFit: 'fill', position: 'absolute', inset: 0 }}
                alt="Live Feed"
                draggable={false}
              />
              <svg 
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: isDrawing ? 'crosshair' : 'default' }}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                viewBox="0 0 100 100"
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
                <polygon 
                  points={`${toPts(currentPoints)}${drawingMode === 'polygon' && mousePos ? ` ${mousePos[0]*100},${mousePos[1]*100}` : ''}`}
                  fill="rgba(16, 185, 129, 0.15)"
                  stroke="#10b981"
                  strokeWidth="0.4"
                  strokeDasharray="1 0.5"
                />
              )}
              
              {/* Draw points for active zone (polygon and freeform only) */}
              {isDrawing && (drawingMode === 'polygon' || drawingMode === 'freeform') && currentPoints.map((pt, i) => (
                <circle 
                  key={i} 
                  cx={pt[0]*100} 
                  cy={pt[1]*100} 
                  r="0.8" 
                  fill="#10b981" 
                />
              ))}
            </svg>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
