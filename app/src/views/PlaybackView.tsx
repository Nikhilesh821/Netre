import { ClockIcon, CalendarIcon, PlayIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/outline'

export function PlaybackView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Playback</h1>
          <p style={{ color: 'var(--text-muted)' }}>Scrub through recorded footage and AI events</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="glass-panel" style={{ padding: '10px 16px', color: 'var(--text-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'var(--bg-panel)' }}>
            <CalendarIcon style={{ width: 20, height: 20 }} />
            Select Date
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <PlayIcon style={{ width: 64, height: 64, opacity: 0.5 }} />
            <span style={{ letterSpacing: '0.1em' }}>SELECT A RECORDING TO PLAY</span>
          </div>
        </div>

        {/* Timeline Control Bar */}
        <div style={{ height: 120, background: 'var(--bg-dark)', borderTop: '1px solid var(--border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                <BackwardIcon style={{ width: 24, height: 24 }} />
              </button>
              <button style={{ background: 'var(--text-main)', color: 'var(--bg-dark)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <PlayIcon style={{ width: 20, height: 20, marginLeft: 2 }} />
              </button>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                <ForwardIcon style={{ width: 24, height: 24 }} />
              </button>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 16, fontFamily: 'monospace' }}>14:32:05 / 24:00:00</span>
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
               {/* Event Markers Legend */}
               <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} /> Intrusion
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)' }} /> Motion
               </div>
            </div>
          </div>
          
          {/* Scrub Bar */}
          <div style={{ height: 32, background: 'var(--bg-panel)', borderRadius: 4, position: 'relative', cursor: 'pointer' }}>
             {/* Example Event Markers */}
             <div style={{ position: 'absolute', top: 0, bottom: 0, left: '20%', width: 2, background: 'var(--danger)' }} />
             <div style={{ position: 'absolute', top: 0, bottom: 0, left: '45%', width: 2, background: 'var(--accent-primary)' }} />
             <div style={{ position: 'absolute', top: 0, bottom: 0, left: '78%', width: 2, background: 'var(--danger)' }} />
             
             {/* Playhead */}
             <div style={{ position: 'absolute', top: -4, bottom: -4, left: '35%', width: 2, background: 'var(--text-main)', zIndex: 10 }}>
               <div style={{ position: 'absolute', top: -6, left: -4, width: 10, height: 10, borderRadius: '50%', background: 'var(--text-main)' }} />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
