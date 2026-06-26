const BASE_URL = '/api';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro de conexão' }));
    throw new Error(err.error || `Erro ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    listUsers: () => request('/auth/users'),
    createUser: (data: Record<string, unknown>) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id: number, data: Record<string, unknown>) =>
      request(`/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id: number) =>
      request(`/auth/users/${id}`, { method: 'DELETE' }),
  },
  players: {
    list: () => request('/players'),
    get: (id: number) => request(`/players/${id}`),
    create: (data: Record<string, unknown>) =>
      request('/players', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) =>
      request(`/players/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request(`/players/${id}`, { method: 'DELETE' }),
    toggleStatus: (id: number, isActive: boolean) =>
      request(`/players/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
    getHistory: (id: number) =>
      request(`/history?entityType=player&entityId=${id}`),
  },
  matches: {
    list: () => request('/matches'),
    create: (data: Record<string, unknown>) =>
      request('/matches', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) =>
      request(`/matches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request(`/matches/${id}`, { method: 'DELETE' }),
    toggleStatus: (id: number, isActive: boolean) =>
      request(`/matches/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
    getHistory: (id: number) =>
      request(`/history?entityType=match&entityId=${id}`),
  },
  news: {
    list: (publishedOnly = false) =>
      request(`/news${publishedOnly ? '?published=true' : ''}`),
    get: (id: number) => request(`/news/${id}`),
    create: (data: Record<string, unknown>) =>
      request('/news', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) =>
      request(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request(`/news/${id}`, { method: 'DELETE' }),
    toggleStatus: (id: number, isActive: boolean) =>
      request(`/news/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
    getHistory: (id: number) =>
      request(`/history?entityType=news&entityId=${id}`),
  },
  galleries: {
    list: () => request('/galleries'),
    get: (id: number) => request(`/galleries/${id}`),
    create: (data: Record<string, unknown>) =>
      request('/galleries', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) =>
      request(`/galleries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request(`/galleries/${id}`, { method: 'DELETE' }),
    toggleStatus: (id: number, isActive: boolean) =>
      request(`/galleries/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
    getImages: (galleryId: number) =>
      request(`/gallery/${galleryId}/images`),
    addImages: (galleryId: number, data: Record<string, unknown>) =>
      request(`/gallery/${galleryId}/images`, { method: 'POST', body: JSON.stringify(data) }),
    updateImage: (galleryId: number, imageId: number, data: Record<string, unknown>) =>
      request(`/gallery/${galleryId}/images/${imageId}`, { method: 'PUT', body: JSON.stringify(data) }),
    toggleImageStatus: (galleryId: number, imageId: number, isActive: boolean) =>
      request(`/gallery/${galleryId}/images/${imageId}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
    deleteImage: (galleryId: number, imageId: number) =>
      request(`/gallery/${galleryId}/images/${imageId}`, { method: 'DELETE' }),
    getImageHistory: (imageId: number) =>
      request(`/history?entityType=gallery_images&entityId=${imageId}`),
    getHistory: (id: number) =>
      request(`/history?entityType=gallery&entityId=${id}`),
  },
  settings: {
    get: () => request('/settings'),
    update: (data: Record<string, string>) =>
      request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
  stats: {
    get: () => request('/stats'),
  },
  contact: {
    send: (data: { name: string; email: string; message: string }) =>
      request('/contact', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request('/contact'),
    markRead: (id: number) =>
      request(`/contact/${id}/read`, { method: 'PATCH' }),
  },
};
