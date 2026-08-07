import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const ConfigContext = createContext();

function normalizeHex(hex) {
  let h = String(hex || '').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (!/^[a-f\d]{6}$/i.test(h)) return null;
  return `#${h.toLowerCase()}`;
}

function hexToRgb(hex) {
  const h = normalizeHex(hex);
  if (!h) return null;
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function darken(hex, factor = 0.85) {
  const h = normalizeHex(hex);
  if (!h) return hex;
  const to = v => Math.round(parseInt(v, 16) * factor).toString(16).padStart(2, '0');
  return `#${to(h.slice(1, 3))}${to(h.slice(3, 5))}${to(h.slice(5, 7))}`;
}

function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    nombre_negocio: '',
    logo: '',
    logo_size: 50,
    telefono: '',
    direccion: '',
    horarios: '',
    marquesina: '',
    nosotros: '',
    facebook_url: '',
    instagram_url: '',
    whatsapp_number: '',
    color_primario: '',
    color_secundario: '',
  });

  const fetchConfig = useCallback(() => {
    api.get('/config')
      .then(res => {
        const d = res.data?.data;
        if (d) setConfig({
          nombre_negocio: d.nombre_negocio || '',
          logo: d.logo || '',
          logo_size: d.logo_size || 50,
          telefono: d.telefono || '',
          direccion: d.direccion || '',
          horarios: d.horarios || '',
          marquesina: d.marquesina || '',
          nosotros: d.nosotros || '',
          facebook_url: d.facebook_url || '',
          instagram_url: d.instagram_url || '',
          whatsapp_number: d.whatsapp_number || '',
          color_primario: d.color_primario || '',
          color_secundario: d.color_secundario || '',
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    const root = document.documentElement;
    if (normalizeHex(config.color_primario)) {
      root.style.setProperty('--accent', normalizeHex(config.color_primario));
      root.style.setProperty('--accent-rgb', hexToRgb(config.color_primario));
      root.style.setProperty('--accent-hover', darken(config.color_primario));
    }
    if (normalizeHex(config.color_secundario)) {
      root.style.setProperty('--accent-secondary', normalizeHex(config.color_secundario));
      root.style.setProperty('--accent-secondary-hover', darken(config.color_secundario));
    }
  }, [config.color_primario, config.color_secundario]);

  return (
    <ConfigContext.Provider value={{ ...config, refreshConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

function useConfig() {
  return useContext(ConfigContext);
}

export { ConfigProvider, useConfig };
