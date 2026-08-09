import { useState, useRef, useEffect } from 'react';
import { WifiIcon, Battery50Icon, MicrophoneIcon, VideoCameraIcon, CameraIcon, SpeakerWaveIcon, BackwardIcon, ForwardIcon, PlayIcon, PauseIcon, Cog6ToothIcon, ArrowsPointingOutIcon, CloudArrowUpIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { fetchEvents } from '../lib/api';

export function PlaybackView() {
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [isPlaying, setIsPlaying] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const filters = ['All Events', 'Doorbell Call', 'Intelligent Detection'];

  useEffect(() => {
    fetchEvents(undefined, 10).then(setEvents).catch(console.error);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

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
      
      <div className="content-body" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}>
            <span>&lt; Home</span>
          </div>
          <div style={{ color: 'var(--text-main)', fontWeight: 500, cursor: 'pointer' }}>
            <span>Next Device &gt;</span>
          </div>
        </div>

        <div style={{ 
          position: 'relative', 
          aspectRatio: '16/9', 
          background: '#000',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Real MP4 video playback */}
          <video 
            ref={videoRef}
            src="http://localhost:8000/api/v1/streams/playback/1" 
            autoPlay muted loop
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLVideoElement).poster = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22225%22%20fill%3D%22%231f2937%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%3ENo%20Recording%20Found%3C%2Ftext%3E%3C%2Fsvg%3E';
            }}
          />
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
              <BackwardIcon style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={() => videoRef.current && (videoRef.current.currentTime -= 5)} />
              {isPlaying ? (
                <PauseIcon style={{ width: 24, height: 24, cursor: 'pointer' }} onClick={togglePlay} />
              ) : (
                <PlayIcon style={{ width: 24, height: 24, cursor: 'pointer' }} onClick={togglePlay} />
              )}
              <ForwardIcon style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={() => videoRef.current && (videoRef.current.currentTime += 5)} />
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
            {events.map((evt, i) => {
              // Distribute events visually across the timeline for demo
              const offset = `${10 + (i * (80 / Math.max(1, events.length - 1)))}%`;
              return (
              <div 
                key={evt.id} 
                style={{ position: 'absolute', left: offset, transform: 'translateX(-50%)', top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', zIndex: 10 }}
                onClick={() => {
                   if (videoRef.current) {
                      videoRef.current.currentTime = Math.random() * (videoRef.current.duration || 10);
                      videoRef.current.play();
                      setIsPlaying(true);
                   }
                }}
              >
                <div style={{ width: 3, height: 16, background: 'var(--danger)', borderRadius: 2 }}></div>
                <div style={{ fontSize: 12, color: 'var(--text-main)', marginTop: 4, fontWeight: 600 }}>
                  {new Date(evt.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                {/* Thumbnails */}
                <div style={{ 
                  marginTop: 8, 
                  background: 'var(--bg-app)', 
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1px solid var(--danger)'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)' }}>{evt.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{Math.round(evt.confidence * 100)}%</div>
                </div>
              </div>
            )})}
            
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
