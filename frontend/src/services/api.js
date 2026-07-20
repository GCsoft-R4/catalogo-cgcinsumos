import axios from 'axios';
import { navigate } from './navigation';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api` : '/api',
});

export function imageUrl(filename) {
  if (!filename) return 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+imagen';
  if (filename.startsWith('http')) return filename;
  return API_BASE ? `${API_BASE}/uploads/${filename}` : `/uploads/${filename}`;
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/admin/login');
    }

    return Promise.reject(error);
  }
);

export default api;