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

export const schemesApi = {
  list: (params) => client.get('/schemes', { params }),
  bySlug: (slug) => client.get(`/schemes/${slug}`),
};

export const eligibilityApi = {
  check: (profile) => client.post('/eligibility/check', profile),
  history: () => client.get('/eligibility/history'),
};

export const syncApi = {
  push: (events) => client.post('/sync/push', { events }),
  pull: (since) => client.get('/sync/pull', { params: { since } }),
};

export default client;
