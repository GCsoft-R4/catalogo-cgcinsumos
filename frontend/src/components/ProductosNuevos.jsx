import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageUrl as getImgUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { WHATSAPP_NUMBER } from '../utils/constants';

const DIAS_NUEVO = 3;
const AUTO_INTERVAL = 4000;

function ProductosNuevos({ productos }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const nuevos = productos.filter((p) => {
    if (!p.fecha_creacion) return false;
    const diff = Date.now() - new Date(p.fecha_creacion).getTime();
    return diff < DIAS_NUEVO * 24 * 60 * 60 * 1000;
  });

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 5);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, nuevos.length]);

  useEffect(() => {
    if (paused || nuevos.length <= 1) return;
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const cardW = el.querySelector('div')?.offsetWidth || 220;
      const gap = 12;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardW + gap, behavior: 'smooth' });
      }
    }, AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [paused, nuevos.length]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.querySelector('div')?.offsetWidth || 220;
    el.scrollBy({ left: dir * (cardW + 12), behavior: 'smooth' });
  };

  if (nuevos.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ background: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Nuevo
        </span>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1a1a1a' }}>
          Recién llegados
        </h2>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>
          Últimos {DIAS_NUEVO} días
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        {canLeft && (
          <button
            onClick={() => scroll(-1)}
            style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 3,
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
          >
            <i className="bi bi-chevron-left" style={{ fontSize: '1rem', color: '#333' }}></i>
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scroll(1)}
            style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 3,
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
          >
            <i className="bi bi-chevron-right" style={{ fontSize: '1rem', color: '#333' }}></i>
          </button>
        )}

        <div
          ref={scrollRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth', paddingBottom: 4,
            scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}
          className="hide-scrollbar"
        >
          {nuevos.map((p) => (
            <div
              key={p.id}
              style={{
                flex: '0 0 200px', scrollSnapAlign: 'start',
                background: '#fff', borderRadius: 10, overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              className="carousel-card"
              onClick={() => navigate(`/producto/${p.id}`)}
            >
              <div style={{ position: 'relative', width: '100%', height: 160, background: '#f9f9f9' }}>
                <img
                  src={getImgUrl(p.imagen)}
                  alt={p.nombre}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <span style={{
                  position: 'absolute', top: 6, left: 6,
                  background: '#10b981', color: '#fff',
                  fontSize: '0.55rem', fontWeight: 700,
                  padding: '2px 6px', borderRadius: 3,
                  textTransform: 'uppercase',
                }}>Nuevo</span>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.nombre}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>
                  ${Number(p.precio).toLocaleString('es-AR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductosNuevos;
