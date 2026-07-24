import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageUrl as getImgUrl } from '../services/api';

const DIAS_NUEVO = 3;
const AUTO_INTERVAL = 4000;

function ProductosNuevos({ productos }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const scrolling = useRef(false);

  const nuevos = productos.filter((p) => {
    if (!p.fecha_creacion) return false;
    const diff = Date.now() - new Date(p.fecha_creacion).getTime();
    return diff < DIAS_NUEVO * 24 * 60 * 60 * 1000;
  });

  const cardW = 200;
  const gap = 12;
  const step = cardW + gap;

  const snapToNearest = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / step);
    el.scrollTo({ left: idx * step, behavior: 'smooth' });
  }, [step]);

  const checkLoop = useCallback(() => {
    const el = scrollRef.current;
    if (!el || scrolling.current) return;
    const mid = nuevos.length * step;
    if (el.scrollLeft >= mid - 5) {
      scrolling.current = true;
      el.style.scrollBehavior = 'auto';
      el.scrollLeft -= mid;
      el.style.scrollBehavior = 'smooth';
      requestAnimationFrame(() => { scrolling.current = false; });
    } else if (el.scrollLeft <= -5) {
      scrolling.current = true;
      el.style.scrollBehavior = 'auto';
      el.scrollLeft += mid;
      el.style.scrollBehavior = 'smooth';
      requestAnimationFrame(() => { scrolling.current = false; });
    }
  }, [nuevos.length, step]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || nuevos.length === 0) return;
    const mid = nuevos.length * step;
    el.scrollLeft = mid;
  }, [nuevos.length, step]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkLoop, { passive: true });
    el.addEventListener('scrollend', snapToNearest, { passive: true });
    return () => {
      el.removeEventListener('scroll', checkLoop);
      el.removeEventListener('scrollend', snapToNearest);
    };
  }, [checkLoop, snapToNearest]);

  useEffect(() => {
    if (paused || nuevos.length <= 1) return;
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollBy({ left: step, behavior: 'smooth' });
    }, AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [paused, nuevos.length, step]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (nuevos.length === 0) return null;

  const items = [...nuevos, ...nuevos];

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
        <button
          onClick={() => scroll(-1)}
          style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 3,
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <i className="bi bi-chevron-left" style={{ fontSize: '1rem', color: '#333' }}></i>
        </button>
        <button
          onClick={() => scroll(1)}
          style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 3,
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <i className="bi bi-chevron-right" style={{ fontSize: '1rem', color: '#333' }}></i>
        </button>

        <div
          ref={scrollRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            display: 'flex', gap, overflowX: 'auto', scrollSnapType: 'x mandatory',
            paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}
          className="hide-scrollbar"
        >
          {items.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              style={{
                flex: `0 0 ${cardW}px`, scrollSnapAlign: 'start',
                background: '#fff', borderRadius: 10, overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer',
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
