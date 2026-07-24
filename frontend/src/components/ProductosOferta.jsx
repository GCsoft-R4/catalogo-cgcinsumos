import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageUrl as getImgUrl } from '../services/api';

const AUTO_INTERVAL = 5000;

function ProductosOferta({ productos }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const scrolling = useRef(false);

  const ofertas = productos.filter(p => p.oferta === true);

  const cardW = 220;
  const gap = 16;
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
    const mid = ofertas.length * step;
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
  }, [ofertas.length, step]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || ofertas.length === 0) return;
    el.scrollLeft = ofertas.length * step;
  }, [ofertas.length, step]);

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
    if (paused || ofertas.length <= 1) return;
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollBy({ left: step, behavior: 'smooth' });
    }, AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [paused, ofertas.length, step]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (ofertas.length === 0) return null;

  const items = [...ofertas, ...ofertas];

  return (
    <div className="nuevos-section" style={{ marginBottom: 20 }}>
      <div className="nuevos-header">
        <div className="nuevos-badge-wrap">
          <span className="nuevos-badge" style={{ background: '#ef4444' }}>Oferta</span>
          <span className="nuevos-badge-pulse" style={{ background: 'rgba(239, 68, 68, 0.25)' }}></span>
        </div>
        <div>
          <h2 className="nuevos-title">Ofertas especiales</h2>
          <p className="nuevos-sub">¡No te las pierdas!</p>
        </div>
      </div>

      <div className="nuevos-track-wrap">
        <button className="nuevos-arrow nuevos-arrow-left" onClick={() => scroll(-1)}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <button className="nuevos-arrow nuevos-arrow-right" onClick={() => scroll(1)}>
          <i className="bi bi-chevron-right"></i>
        </button>

        <div
          ref={scrollRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="nuevos-track hide-scrollbar"
        >
          {items.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              className="nuevos-card"
              onClick={() => navigate(`/producto/${p.id}`)}
            >
              <div className="nuevos-card-img">
                <img
                  src={getImgUrl(p.imagen)}
                  alt={p.nombre}
                  loading="lazy"
                />
                <div className="nuevos-card-overlay"></div>
              </div>
              <div className="nuevos-card-body">
                <span className="nuevos-card-name">{p.nombre}</span>
                <span className="nuevos-card-price" style={{ color: '#ef4444' }}>
                  ${Number(p.precio).toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductosOferta;
