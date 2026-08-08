import { WifiIcon, Battery50Icon, MicrophoneIcon, VideoCameraIcon, CameraIcon, SpeakerWaveIcon, BackwardIcon, ForwardIcon, PlayIcon, Cog6ToothIcon, ArrowsPointingOutIcon, CloudArrowUpIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const CLIPS = [
  { time: '12:19:49 PM', count: 2, offset: '10%' },
  { time: '11:39 AM', count: 3, offset: '30%' },
  { time: '10:56 AM', count: 1, active: true, offset: '50%' },
  { time: '10:25 AM', count: 4, offset: '70%' },
  { time: '09:34 AM', count: 4, offset: '90%' },
];

export function PlaybackView() {
  return (
    <>
      <div className="content-header">
        <div className="filter-pills">
          <button className="pill active">All Events</button>
          <button className="pill">Doorbell Call</button>
          <button className="pill">Intelligent Detection</button>
        </div>
      </div>
      
      <div className="content-body" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}>
            <span>&lt; Home</span>
          </div>
          <div style={{ color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}>
            <span>Next Device &gt;</span>
          </div>
        </div>

        {/* Video Player */}
        <div style={{ 
          position: 'relative', 
          aspectRatio: '16/9', 
          background: 'linear-gradient(45deg, #1f2937, #374151)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Top Overlays */}
          <div style={{ position: 'absolute', top: 24, left: 24, display: 'flex', gap: 12, color: 'white' }}>
            <WifiIcon style={{ width: 24, height: 24 }} />
            <Battery50Icon style={{ width: 24, height: 24 }} />
          </div>
          
          <div style={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 16, color: 'white' }}>
            <MicrophoneIcon style={{ width: 24, height: 24 }} />
            <VideoCameraIcon style={{ width: 24, height: 24 }} />
            <CameraIcon style={{ width: 24, height: 24 }} />
          </div>
          
          {/* Bottom Info Overlay */}
          <div style={{ position: 'absolute', bottom: 70, left: 24, color: 'white' }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Front Door: Camera 2</div>
            <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>15-05-2024 &nbsp; 10:56 AM</div>
          </div>
          
          {/* Scrubber Bar */}
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, 
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
            padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16,
            color: 'white'
          }}>
            <SpeakerWaveIcon style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: 14 }}>01:03 / 02:08</span>
            
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, position: 'relative' }}>
              <div style={{ width: '45%', height: '100%', background: 'white', borderRadius: 2 }} />
              <div style={{ position: 'absolute', left: '45%', top: '50%', transform: 'translate(-50%, -50%)', width: 12, height: 12, background: 'white', borderRadius: '50%' }} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 16 }}>
              <BackwardIcon style={{ width: 20, height: 20, cursor: 'pointer' }} />
              <PlayIcon style={{ width: 24, height: 24, cursor: 'pointer' }} />
              <ForwardIcon style={{ width: 20, height: 20, cursor: 'pointer' }} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Live Video</span>
              <Cog6ToothIcon style={{ width: 20, height: 20, cursor: 'pointer' }} />
              <ArrowsPointingOutIcon style={{ width: 20, height: 20, cursor: 'pointer' }} />
            </div>
          </div>
        </div>

        {/* Timeline Event Scrubber */}
        <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Today ∨</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-icon" style={{ background: 'var(--accent-primary)', color: 'var(--bg-surface)' }}><CloudArrowUpIcon style={{ width: 20, height: 20 }} /></button>
              <button className="btn-icon"><DocumentDuplicateIcon style={{ width: 20, height: 20 }} /></button>
            </div>
          </div>
          
          <div style={{ position: 'relative', height: 120, borderTop: '1px solid var(--border)', marginTop: 8 }}>
            {/* Time markers */}
            {CLIPS.map((clip, i) => (
              <div key={i} style={{ position: 'absolute', left: clip.offset, transform: 'translateX(-50%)', top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 1, height: 12, background: 'var(--border)' }}></div>
                <div style={{ fontSize: 12, color: clip.active ? 'var(--accent-primary)' : 'var(--text-muted)', marginTop: 4, fontWeight: clip.active ? 600 : 400 }}>{clip.time}</div>
                
                {/* Thumbnails */}
                <div style={{ 
                  marginTop: 8, 
                  background: clip.active ? 'var(--border)' : 'var(--bg-app)', 
                  borderRadius: 'var(--radius-sm)',
                  padding: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: clip.active ? 'var(--shadow-md)' : 'none',
                  border: clip.active ? '2px solid var(--accent-primary)' : '1px solid transparent'
                }}>
                  <div style={{ width: 64, height: 48, background: 'var(--text-muted)', borderRadius: 4 }}></div>
                  <div style={{ fontSize: 12, marginTop: 4, fontWeight: 500 }}>{clip.count} clips</div>
                </div>
              </div>
            ))}
            
            {/* Active Line indicator */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'var(--text-main)' }}></div>
          </div>
          
          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
            <span style={{ fontSize: 18 }}>-</span>
            <div style={{ width: 100, height: 4, background: 'var(--border)', borderRadius: 2 }}>
              <div style={{ width: '30%', height: '100%', background: 'var(--text-muted)', borderRadius: 2 }}></div>
            </div>
            <span style={{ fontSize: 18 }}>+</span>
          </div>
        </div>
      </div>
    </>
  );
}
