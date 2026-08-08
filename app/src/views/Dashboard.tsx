import { VideoCameraIcon, ExclamationTriangleIcon, ServerIcon, WifiIcon } from '@heroicons/react/24/outline'

export function Dashboard() {
  const metrics = [
    { name: 'Active Cameras', value: '4', icon: VideoCameraIcon, color: 'var(--success)' },
    { name: 'Recent Events', value: '12', icon: ExclamationTriangleIcon, color: 'var(--danger)' },
    { name: 'Storage Used', value: '45%', icon: ServerIcon, color: 'var(--accent-primary)' },
    { name: 'System Status', value: 'Online', icon: WifiIcon, color: 'var(--success)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>System overview and recent activity</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        {metrics.map(metric => (
          <div key={metric.name} className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ 
              width: 56, height: 56, borderRadius: 16, 
              background: `color-mix(in srgb, ${metric.color} 15%, transparent)`,
              color: metric.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
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
        <div className="glass-panel" style={{ padding: 24, minHeight: 400 }}>
          <h2 style={{ fontSize: 20, marginBottom: 24 }}>Recent Camera Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--text-muted)' }}>
            <div style={{ padding: 16, background: 'var(--bg-panel)', borderRadius: 12, border: '1px solid var(--border)' }}>
              No recent activity recorded.
            </div>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: 24, minHeight: 400 }}>
          <h2 style={{ fontSize: 20, marginBottom: 24 }}>System Health</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>CPU Usage</span>
                <span>24%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'var(--bg-panel)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '24%', height: '100%', background: 'var(--accent-primary)', borderRadius: 3 }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Memory</span>
                <span>4.2 GB / 16 GB</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'var(--bg-panel)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '26%', height: '100%', background: 'var(--accent-secondary)', borderRadius: 3 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
