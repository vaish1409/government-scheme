import axios from 'axios';

// Set VITE_API_URL in your .env file to your deployed backend URL,
// e.g. https://health-finance-backend.onrender.com
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({ baseURL: `${API_URL}/api` });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  signup: (data) => client.post('/auth/signup', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
  updateMe: (data) => client.patch('/auth/me', data),
};

export const lessonsApi = {
  list: (params) => client.get('/lessons', { params }),
  progress: () => client.get('/lessons/progress'),
};

export const livelihoodApi = {
  meta: () => client.get('/livelihood/meta'),
  turn: (body) => client.post('/livelihood/turn', body),
  recommend: (body) => client.post('/livelihood/recommend', body),
  deleteSession: (id) => client.delete(`/livelihood/sessions/${id}`),
  // officer / counsellor (key is sent per request, never stored in localStorage)
  dashboard: (key, lang) => client.get('/livelihood/dashboard', { params: { lang }, headers: { 'x-officer-key': key } }),
  sessions: (key, params) => client.get('/livelihood/sessions', { params, headers: { 'x-officer-key': key } }),
  updateSession: (key, id, body) => client.patch(`/livelihood/sessions/${id}`, body, { headers: { 'x-officer-key': key } }),
};

export const syncApi = {
  push: (events) => client.post('/sync/push', { events }),
  pull: (since) => client.get('/sync/pull', { params: { since } }),
};

export default client;
