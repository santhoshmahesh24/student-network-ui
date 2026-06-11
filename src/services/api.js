import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const users = {
  me: () => api.get('/users/me'),
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/me', data),
  search: (q) => api.get(`/users/search?q=${q}`),
  getConnections: (id) => api.get(`/users/${id}/connections`),
  sendRequest: (id) => api.post(`/users/${id}/connect`),
  getPendingRequests: () => api.get('/users/me/connection-requests'),
  respondToRequest: (id, accept) => api.put(`/users/me/connection-requests/${id}?accept=${accept}`),
  removeConnection: (id) => api.delete(`/users/me/connections/${id}`),
};

export const posts = {
  feed: (page = 0) => api.get(`/posts/feed?page=${page}&size=20`),
  all: (page = 0) => api.get(`/posts?page=${page}&size=20`),
  create: (data) => api.post('/posts', data),
  like: (id) => api.post(`/posts/${id}/like`),
  delete: (id) => api.delete(`/posts/${id}`),
  getComments: (id) => api.get(`/posts/${id}/comments`),
  addComment: (id, content) => api.post(`/posts/${id}/comments`, { content }),
  search: (q) => api.get(`/posts/search?q=${q}`),
};

export const opportunities = {
  all: (page = 0) => api.get(`/opportunities?page=${page}&size=20`),
  byType: (type) => api.get(`/opportunities/type/${type}`),
  search: (q) => api.get(`/opportunities/search?q=${q}`),
  create: (data) => api.post('/opportunities', data),
  close: (id) => api.put(`/opportunities/${id}/close`),
};

export default api;
