import axios from 'axios';

// Build API base URL. If VITE_API_URL already ends with /api, don't append another segment.
const envUrl = import.meta.env.VITE_API_URL;
const normalizedBase = envUrl
  ? envUrl.replace(/\/$/, '') // drop trailing slash
  : 'http://localhost:5000';
const API_BASE_URL = normalizedBase.endsWith('/api')
  ? normalizedBase
  : `${normalizedBase}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
};

// Pokemon API
export const pokemonAPI = {
  getAll: () => api.get('/pokemon'),
  getOne: (id) => api.get(`/pokemon/${id}`),
  create: (data) => api.post('/pokemon', data),
  update: (id, data) => api.put(`/pokemon/${id}`, data),
  delete: (id) => api.delete(`/pokemon/${id}`),
};

export default api;
