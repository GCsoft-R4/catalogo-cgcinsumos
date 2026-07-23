import { createContext, useContext, useState, useEffect } from 'react';

const FavoritosContext = createContext();

function FavoritosProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favoritos')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('favoritos', JSON.stringify(ids));
  }, [ids]);

  const toggle = (productoId) => {
    setIds(prev =>
      prev.includes(productoId)
        ? prev.filter(id => id !== productoId)
        : [...prev, productoId]
    );
  };

  const isFavorito = (productoId) => ids.includes(productoId);

  const totalFavoritos = ids.length;

  return (
    <FavoritosContext.Provider value={{ ids, toggle, isFavorito, totalFavoritos }}>
      {children}
    </FavoritosContext.Provider>
  );
}

function useFavoritos() {
  return useContext(FavoritosContext);
}

export { FavoritosProvider, useFavoritos };
