import { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
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

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

function useConfig() {
  return useContext(ConfigContext);
}

export { ConfigProvider, useConfig };
