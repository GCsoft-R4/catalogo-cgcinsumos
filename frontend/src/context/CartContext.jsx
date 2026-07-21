import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { WHATSAPP_NUMBER } from '../utils/constants';

const CartContext = createContext();

function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (producto, cantidad = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === producto.id);
      if (existing) {
        toast.success(`${producto.nombre} +${cantidad}`, { id: `cart-${producto.id}` });
        return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i);
      }
      toast.success(`${producto.nombre} agregado`, { id: `cart-${producto.id}` });
      return [...prev, {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad
      }];
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);

  const total = items.reduce((acc, i) => acc + (parseFloat(i.precio) * i.cantidad), 0);

  const sendWhatsApp = () => {
    if (items.length === 0) return;
    const lines = items.map(i => {
      const precio = parseFloat(i.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 });
      return `- ${i.nombre} x${i.cantidad} — $${precio}`;
    });
    const totalFmt = total.toLocaleString('es-AR', { minimumFractionDigits: 2 });
    const text = encodeURIComponent(
      `Hola, quiero hacer un pedido:\n\n${lines.join('\n')}\n\n*Total: $${totalFmt}*\n\n¿Me confirmás si tenés stock?`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateCantidad, clearCart, totalItems, total, sendWhatsApp }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  return useContext(CartContext);
}

export { CartProvider, useCart };
