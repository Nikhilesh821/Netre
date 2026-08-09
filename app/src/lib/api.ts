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
}

export async function fetchZones(cameraId: number) {
  const res = await fetch(`${API_BASE}/cameras/${cameraId}/zones`);
  if (!res.ok) throw new Error('Failed to fetch zones');
  return res.json();
}

export async function createZone(cameraId: number, name: string, points: [number, number][]) {
  const res = await fetch(`${API_BASE}/cameras/${cameraId}/zones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, polygon_points: points })
  });
  if (!res.ok) throw new Error('Failed to create zone');
  return res.json();
}

export async function deleteZone(cameraId: number, zoneId: number) {
  const res = await fetch(`${API_BASE}/cameras/${cameraId}/zones/${zoneId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete zone');
  return res.json();
}
