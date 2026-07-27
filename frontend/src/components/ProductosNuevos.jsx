import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { imageUrl as getImgUrl } from '../services/api';

const AUTO_INTERVAL = 3000;

function ProductosNuevos() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [nuevos, setNuevos] = useState([]);
  const [paused, setPaused] = useState(false);
  const scrolling = useRef(false);

  useEffect(() => {
    api.get('/productos?nuevos=true').then(res => {
      setNuevos(res.data?.data || []);
    }).catch(() => {});
  }, []);

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
    el.scrollLeft = nuevos.length * step;
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
    <div className="nuevos-section">
      <div className="nuevos-header">
        <div className="nuevos-badge-wrap">
          <span className="nuevos-badge">Nuevo</span>
          <span className="nuevos-badge-pulse"></span>
        </div>
        <div>
          <h2 className="nuevos-title">Recién llegados</h2>
          <p className="nuevos-sub">Novedades y ofertas</p>
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
                {p.oferta && (
                  <span style={{
                    position: 'absolute', top: 10, left: 10,
                    background: '#ef4444', color: '#fff',
                    fontSize: '0.55rem', fontWeight: 700,
                    padding: '3px 9px', borderRadius: 6,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>Oferta</span>
                )}
              </div>
              <div className="nuevos-card-body">
                <span className="nuevos-card-name">{p.nombre}</span>
                <span className="nuevos-card-price">
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

export default ProductosNuevos;