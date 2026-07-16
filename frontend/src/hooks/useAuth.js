import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.post('/login', { username, password });
    localStorage.setItem('token', res.data.data.token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, loading, login, logout };
}
