const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      message = payload.detail || message;
    } catch {
      // Keep the status-based message when the response is not JSON.
    }
    throw new Error(message);
  }

  return response.json();
}

export const listWards = () => request('/api/wards');

export const getWard = (wardCode, { signal } = {}) =>
  request(`/api/wards/${encodeURIComponent(wardCode)}`, { signal });

export const generateWardSummary = (wardCode) =>
  request(`/api/wards/${encodeURIComponent(wardCode)}/summary`, {
    method: 'POST',
  });
