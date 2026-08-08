import { WifiIcon, Battery50Icon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const CAMERA_GROUPS = [
  {
    name: 'Basement',
    cameras: [
      { id: 1, name: 'Camera 1', time: '15-05-2024 12:19:49 PM', value: 86 },
      { id: 2, name: 'Camera 2', time: '15-05-2024 12:19:49 PM', value: 56 },
    ]
  },
  {
    name: 'Backyard',
    cameras: [
      { id: 3, name: 'Camera 1', time: '15-05-2024 12:19:49 PM', value: 32 },
      { id: 4, name: 'Camera 2', time: '15-05-2024 12:19:49 PM', value: 18 },
      { id: 5, name: 'Camera 3', time: '15-05-2024 12:19:49 PM', value: 24 },
      { id: 6, name: 'Camera 4', time: '15-05-2024 12:19:49 PM', value: 14 },
    ]
  }
];

export function LiveView() {
  return (
    <>
      <div className="content-header">
        <div className="filter-pills">
          <button className="pill active">All</button>
          <button className="pill">Basement</button>
          <button className="pill">Backyard</button>
          <button className="pill">Front Door</button>
          <button className="pill">Kid's Room</button>
          <button className="pill">Kitchen</button>
        </div>
      </div>
      
      <div className="content-body" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {CAMERA_GROUPS.map(group => (
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
                  {/* Dummy placeholder for video */}
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1f2937, #374151)' }}></div>
                  
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
                  <div style={{ position: 'absolute', bottom: 16, left: 16, color: 'white' }}>
                    <div style={{ fontWeight: 600 }}>{cam.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{cam.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
