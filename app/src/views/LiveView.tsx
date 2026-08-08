import { useState, useEffect } from 'react'
import { VideoCameraIcon, MagnifyingGlassPlusIcon, ExclamationCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export function LiveView() {
  const [cameras, setCameras] = useState([{ id: 1, name: 'Front Door Camera', status: 'Live', type: 'Live Stream' }])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Live View</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor your active camera feeds in real-time</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cog6ToothIcon style={{ width: 20, height: 20 }} />
          Configure Zones
        </button>
      </div>

      <div className="dashboard-grid">
        {cameras.map(cam => (
          <div key={cam.id} className="camera-card glass-panel">
            <div className="camera-preview">
              {/* Premium Placeholder for the video feed */}
              <div className="camera-preview-placeholder" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <VideoCameraIcon style={{ width: 48, height: 48, opacity: 0.5 }} />
                <span style={{ letterSpacing: '0.1em' }}>WAITING FOR STREAM</span>
              </div>
              
              {/* Overlay elements */}
              <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                <span className="status-badge status-live">
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'currentColor', marginRight: 6, verticalAlign: 'middle', animation: 'pulse 2s infinite' }} />
                  {cam.status}
                </span>
              </div>
            </div>
            <div className="camera-info">
              <div className="camera-name">
                {cam.name}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <MagnifyingGlassPlusIcon style={{ width: 20, height: 20 }} />
                  </button>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{cam.type}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
