const baseUrl = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Cannot reach API server. Is it running on port 5000?');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.detail ? ` (${data.detail})` : '';
    throw new Error((data.message || 'Request failed') + detail);
  }

  return data;
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  getReports: () => request('/api/reports'),
  getReport: (id) => request(`/api/reports/${id}`),
  createReport: (body) => request('/api/reports', { method: 'POST', body: JSON.stringify(body) }),
  updateReport: (id, body) =>
    request(`/api/reports/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteReport: (id) => request(`/api/reports/${id}`, { method: 'DELETE' }),
  uploadAttachment: (reportId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/api/reports/${reportId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  },
};
