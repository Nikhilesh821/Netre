const API_BASE = 'http://localhost:8000/api/v1';

export async function fetchCameras() {
  const res = await fetch(`${API_BASE}/cameras/`);
  if (!res.ok) throw new Error('Failed to fetch cameras');
  return res.json();
}


export async function fetchRecordings(cameraId?: string) {
  const url = cameraId ? `${API_BASE}/recordings/?camera_id=${cameraId}` : `${API_BASE}/recordings/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch recordings');
}

export async function fetchSystemStats() {
  const res = await fetch(`${API_BASE}/events/system-stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchEvents(cameraId?: number, limit: number = 100) {
  let url = `${API_BASE}/events/?limit=${limit}`;
  if (cameraId) url += `&camera_id=${cameraId}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function searchEvents(query: string) {
  const res = await fetch(`${API_BASE}/events/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error('Failed to search events');
  return res.json();
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
