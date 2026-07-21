import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function PublicLayout() {
  const esCatalogo = useLocation().pathname === '/' || useLocation().pathname.startsWith('/producto');
  const [marquesina, setMarquesina] = useState('');
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    api.get('/config').then(res => {
      const text = res.data?.data?.marquesina || '';
      setMarquesina(text);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    api.get('/config').then(res => {
      const text = res.data?.data?.marquesina || '';
      setMarquesina(text);
    }).catch(() => {});
  }, []);

  return (
    <>
      <div className="sticky-top-wrapper">
        <Navbar />
        {esCatalogo && marquesina && (
          <div className="marquee-wrapper">
            <div className="marquee-track">
              <span className="marquee-text">{marquesina} &nbsp;·&nbsp;</span>
              <span className="marquee-text">{marquesina} &nbsp;·&nbsp;</span>
              <span className="marquee-text">{marquesina} &nbsp;·&nbsp;</span>
            </div>
          </div>
        )}
      </div>
      <main>
        <Outlet />
      </main>

      {showScroll && (
        <button
          onClick={scrollToTop}
          aria-label="Volver arriba"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 999,
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: '1.2rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'opacity 0.2s',
          }}
        >
          <i className="bi bi-arrow-up"></i>
        </button>
      )}
    </>
  );
}

export default PublicLayout;
