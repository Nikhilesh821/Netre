import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BackwardIcon, ForwardIcon, PlayIcon, PauseIcon, Cog6ToothIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import { fetchCameras, fetchEvents } from '../lib/api';

const API_BASE = 'http://localhost:8000/api/v1';

export function PlaybackView() {
  const [searchParams] = useSearchParams();
  const initialCam = searchParams.get('camera');
  const jumpTime = searchParams.get('time');

  const [activeFilter, setActiveFilter] = useState('All Events');
  const [isPlaying, setIsPlaying] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [selectedCamId, setSelectedCamId] = useState<number | null>(initialCam ? Number(initialCam) : null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoError, setVideoError] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const filters = ['All Events', 'Person', 'Car', 'Motion'];

  useEffect(() => {
    fetchCameras().then(cams => {
      setCameras(cams);
      if (!selectedCamId && cams.length > 0) setSelectedCamId(cams[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCamId) return;

    fetchEvents(selectedCamId, 50).then(data => {
      setEvents(data);
    }).catch(console.error);

    fetch(`${API_BASE}/recordings/?camera_id=${selectedCamId}&limit=20`)
      .then(r => r.json())
      .then(recs => {
        setRecordings(recs);
        if (recs.length > 0) {
          setRecordingStartTime(new Date(recs[0].start_time));
        }
      })
      .catch(console.error);

    setVideoError(false);
  }, [selectedCamId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (jumpTime && videoRef.current && recordingStartTime) {
      const jumpDate = new Date(jumpTime);
      const offsetSecs = (jumpDate.getTime() - recordingStartTime.getTime()) / 1000;
      if (offsetSecs >= 0 && offsetSecs < (videoRef.current.duration || Infinity)) {
        videoRef.current.currentTime = offsetSecs;
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [jumpTime, recordingStartTime]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const seekToEvent = (evt: any) => {
    if (!videoRef.current || !recordingStartTime) return;
    const evtTime = new Date(evt.occurred_at);
    const offsetSecs = (evtTime.getTime() - recordingStartTime.getTime()) / 1000;
    const clampedOffset = Math.max(0, Math.min(offsetSecs, videoRef.current.duration || 0));
    videoRef.current.currentTime = clampedOffset;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const seekByClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = ratio * duration;
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const filteredEvents = activeFilter === 'All Events'
    ? events
    : events.filter(e => e.label?.toLowerCase().includes(activeFilter.toLowerCase()));

  const getEventTimelinePos = (evt: any): number => {
    if (!recordingStartTime || !duration) return 0;
    const evtTime = new Date(evt.occurred_at);
    const offsetSecs = (evtTime.getTime() - recordingStartTime.getTime()) / 1000;
    return Math.max(0, Math.min(100, (offsetSecs / duration) * 100));
  };

  const videoSrc = selectedCamId ? `${API_BASE}/streams/playback/${selectedCamId}` : '';

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

      <div className="content-body" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, padding: '24px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <select
              value={selectedCamId || ''}
              onChange={e => setSelectedCamId(Number(e.target.value))}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-main)', fontSize: 16, fontWeight: 500 }}
            >
              {cameras.map(cam => (
                <option key={cam.id} value={cam.id}>{cam.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Speed:</span>
              {[0.5, 1, 2, 4].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackRate(speed)}
                  style={{
                    padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                    background: playbackRate === speed ? 'var(--accent)' : 'var(--bg-app)',
                    color: playbackRate === speed ? 'white' : 'var(--text-main)',
                    fontWeight: 500
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            {videoError || !videoSrc ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: 12 }}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.871v6.258a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                <span style={{ fontSize: 14 }}>No recordings yet for this camera</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Start a live stream to begin recording automatically</span>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onError={() => setVideoError(true)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, color: 'white' }}>
              <span style={{ fontSize: 13, minWidth: 80 }}>{formatTime(currentTime)} / {formatTime(duration)}</span>

              <div
                onClick={seekByClick}
                style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 3, position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                <div style={{ position: 'absolute', left: `${progressPercent}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, background: 'white', borderRadius: '50%', boxShadow: '0 0 4px rgba(0,0,0,0.5)' }} />
                {filteredEvents.map(evt => {
                  const pos = getEventTimelinePos(evt);
                  return (
                    <div
                      key={evt.id}
                      title={`${evt.label} - ${new Date(evt.occurred_at).toLocaleTimeString()}`}
                      style={{ position: 'absolute', left: `${pos}%`, top: -4, width: 4, height: 14, background: 'var(--danger)', borderRadius: 2, cursor: 'pointer', zIndex: 10 }}
                      onClick={e => { e.stopPropagation(); seekToEvent(evt); }}
                    />
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <BackwardIcon style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)} />
                {isPlaying
                  ? <PauseIcon style={{ width: 24, height: 24, cursor: 'pointer' }} onClick={togglePlay} />
                  : <PlayIcon style={{ width: 24, height: 24, cursor: 'pointer' }} onClick={togglePlay} />
                }
                <ForwardIcon style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={() => videoRef.current && (videoRef.current.currentTime += 10)} />
              </div>

              <Cog6ToothIcon style={{ width: 20, height: 20, cursor: 'pointer', marginLeft: 'auto' }} />
              <ArrowsPointingOutIcon style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={() => videoRef.current?.requestFullscreen()} />
            </div>
          </div>

          {recordings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>RECORDINGS</h3>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {recordings.map(rec => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      setRecordingStartTime(new Date(rec.start_time));
                      if (videoRef.current) {
                        videoRef.current.src = `${API_BASE}/streams/playback/recording/${rec.id}`;
                        videoRef.current.load();
                        videoRef.current.play();
                        setIsPlaying(true);
                        setVideoError(false);
                      }
                    }}
                    style={{ padding: '8px 12px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13 }}
                  >
                    {new Date(rec.start_time).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'calc(100vh - 150px)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 16 }}>
            Events — {cameras.find(c => c.id === selectedCamId)?.name || 'Camera'}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredEvents.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 24, fontSize: 14 }}>
                No events detected yet.<br />Draw a zone on a live camera to start AI detection.
              </div>
            ) : (
              filteredEvents.map(evt => (
                <div
                  key={evt.id}
                  onClick={() => seekToEvent(evt)}
                  style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{evt.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>{Math.round(evt.confidence * 100)}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(evt.occurred_at).toLocaleTimeString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>▶ Click to seek</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
