import { VideoCameraIcon, ExclamationTriangleIcon, ServerIcon, WifiIcon } from '@heroicons/react/24/outline';

export function Dashboard() {
  const metrics = [
    { name: 'Active Cameras', value: '4', icon: VideoCameraIcon, color: 'var(--success)' },
    { name: 'Recent Events', value: '12', icon: ExclamationTriangleIcon, color: 'var(--danger)' },
    { name: 'Storage Used', value: '45%', icon: ServerIcon, color: 'var(--text-main)' },
    { name: 'System Status', value: 'Online', icon: WifiIcon, color: 'var(--success)' },
  ];

  return (
    <>
      <div className="content-header">
        <div className="filter-pills">
          <button className="pill active">Overview</button>
          <button className="pill">Health</button>
          <button className="pill">Storage</button>
        </div>
      </div>
      
      <div className="content-body" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>System Overview</h2>

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

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div className="surface-panel" style={{ padding: 24, minHeight: 400 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Activity Chart</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
              Chart Data Unavailable
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
                  <span style={{ fontWeight: 600 }}>4.2 GB / 16 GB</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--bg-app)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '26%', height: '100%', background: 'var(--text-main)', borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
