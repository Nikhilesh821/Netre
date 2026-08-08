const API_BASE = 'http://localhost:8000/api/v1';

export async function fetchCameras() {
  const res = await fetch(`${API_BASE}/cameras/`);
  if (!res.ok) throw new Error('Failed to fetch cameras');
  return res.json();
}

export async function fetchEvents(limit = 100) {
  const res = await fetch(`${API_BASE}/events/?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchRecordings(cameraId?: string) {
  const url = cameraId ? `${API_BASE}/recordings/?camera_id=${cameraId}` : `${API_BASE}/recordings/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch recordings');
  return res.json();
}
