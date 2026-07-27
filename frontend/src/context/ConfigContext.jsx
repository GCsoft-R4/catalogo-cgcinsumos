import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const ConfigContext = createContext();

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
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

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
