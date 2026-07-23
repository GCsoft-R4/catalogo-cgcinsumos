import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { WHATSAPP_NUMBER } from '../utils/constants';

const STATS = [
  { icon: 'bi-calendar-check', target: 10, suffix: '+', label: 'Años de experiencia' },
  { icon: 'bi-box-seam', target: 500, suffix: '+', label: 'Productos disponibles' },
  { icon: 'bi-people', target: 1000, suffix: '+', label: 'Clientes satisfechos' },
  { icon: 'bi-truck', target: 100, suffix: '%', label: 'Envíos a todo el país' },
];

const VALUES = [
  { icon: 'bi-shield-check', title: 'Confianza', text: 'Cada producto que vendemos está respaldado por nuestra garantía y experiencia en el rubro.' },
  { icon: 'bi-lightning-charge', title: 'Rapidez', text: 'Despachos ágiles para que recibas tu compra lo antes posible, donde estés.' },
  { icon: 'bi-headset', title: 'Atención personalizada', text: 'Respondemos tus consultas por WhatsApp con la dedicación que merecés.' },
];

const TIMELINE = [
  { year: '2015', title: 'Los inicios', text: 'Comenzamos vendiendo accesorios de celulares con una idea simple: ofrecer calidad a buenos precios.' },
  { year: '2018', title: 'Crecimiento', text: 'Ampliamos nuestro catálogo con parlantes, smartwatches y toda la tecnología que necesitás.' },
  { year: '2022', title: 'Presencia digital', text: 'Lanzamos nuestro catálogo online para que puedas comprar desde donde estés, las 24 horas.' },
  { year: 'Hoy', title: 'Seguimos creciendo', text: 'Miles de clientes confían en nosotros para equipar su tecnología todos los días.' },
];

function useCountUp(target, duration = 1500, inView = true) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration, inView]);

  return count;
}

function StatCard({ icon, target, suffix, label }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const count = useCountUp(target, 1400, inView);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ textAlign: 'center', flex: '1 1 140px' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
        <i className={`bi ${icon}`} style={{ fontSize: 26, color: 'var(--accent)' }}></i>
      </div>
      <div style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--text)', lineHeight: 1 }}>{count}{suffix}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>{label}</div>
    </div>
  );
}

function TimelineItem({ year, title, text, isLast }) {
  return (
    <div style={{ display: 'flex', gap: 20, paddingBottom: isLast ? 0 : 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem', zIndex: 1, flexShrink: 0 }}>
          {year}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 6 }} />}
      </div>
      <div style={{ paddingTop: 6 }}>
        <h5 style={{ fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>{title}</h5>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{text}</p>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, text }) {
  return (
    <div
      style={{
        background: 'rgba(128,128,128,0.03)',
        borderRadius: 16,
        padding: '2rem 1.5rem',
        border: '1px solid var(--border)',
        textAlign: 'center',
        flex: '1 1 200px',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(var(--accent-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <i className={`bi ${icon}`} style={{ fontSize: 26, color: 'var(--accent)' }}></i>
      </div>
      <h5 style={{ fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>{title}</h5>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

function ContactCard({ icon, label, value }) {
  return (
    <div style={{ background: 'rgba(128,128,128,0.04)', borderRadius: 14, padding: '1.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <i className={`bi ${icon}`} style={{ fontSize: 22, color: 'var(--accent)' }}></i>
      </div>
      <small style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</small>
      <p style={{ margin: '6px 0 0', fontWeight: 600, color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

function Nosotros() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    api.get('/config').then(res => setConfig(res.data?.data)).catch(() => {});
  }, []);

  if (!config) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-secondary" role="status" />
      </div>
    );
  }

  const hasContent = config.nosotros || config.telefono || config.direccion || config.horarios;

  return (
    <>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--accent) 0%, rgba(var(--accent-rgb), 0.6) 100%)', padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: 30, left: '20%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <img src="/gclogo.png" alt="Logo" style={{ height: 120, marginBottom: 24, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))', position: 'relative' }} />
        <h1 style={{ fontWeight: 800, fontSize: '2.6rem', color: '#fff', margin: 0, textShadow: '0 2px 12px rgba(0,0,0,0.15)', position: 'relative' }}>
          Sobre nosotros
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginTop: 12, maxWidth: 500, margin: '12px auto 0', position: 'relative' }}>
          Conocé un poco más de GCinsumos
        </p>
      </div>

      {/* Stats flotantes */}
      <div style={{ maxWidth: 780, margin: '-32px auto 0', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', background: '#fff', borderRadius: 20, padding: '2rem 1.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', border: '1px solid var(--border)' }}>
          {STATS.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Sin contenido */}
        {!hasContent && (
          <div className="text-center py-5 my-4" style={{ background: 'rgba(128,128,128,0.03)', borderRadius: 16 }}>
            <i className="bi bi-info-circle" style={{ fontSize: 48, color: 'var(--text-secondary)', opacity: 0.4 }}></i>
            <p className="text-muted mt-3">Esta sección aún no tiene contenido.</p>
            <Link to="/" className="btn btn-accent mt-2">Volver al catálogo</Link>
          </div>
        )}

        {/* Texto principal */}
        {config.nosotros && (
          <div style={{ padding: '3.5rem 0 2rem' }}>
            {config.nosotros.split('\n').map((paragraph, i) => (
              <p key={i} style={{ fontSize: '1.08rem', lineHeight: 2, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 16 }}>{paragraph}</p>
            ))}
          </div>
        )}

        {/* Línea de tiempo */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h3 style={{ fontWeight: 700, textAlign: 'center', marginBottom: 28, color: 'var(--text)' }}>Nuestra historia</h3>
          {TIMELINE.map((t, i) => <TimelineItem key={i} {...t} isLast={i === TIMELINE.length - 1} />)}
        </div>

        {/* Valores */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h3 style={{ fontWeight: 700, textAlign: 'center', marginBottom: 20, color: 'var(--text)' }}>¿Por qué elegirnos?</h3>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {VALUES.map((v, i) => <ValueCard key={i} {...v} />)}
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{ background: 'linear-gradient(135deg, var(--accent) 0%, rgba(var(--accent-rgb), 0.7) 100%)', borderRadius: 20, padding: '3rem 2rem', textAlign: 'center', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <h3 style={{ fontWeight: 800, color: '#fff', margin: '0 0 8px', fontSize: '1.5rem', position: 'relative' }}>¿Listo para comprar?</h3>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0 20px', position: 'relative' }}>Elegí lo que necesitá y te lo enviamos a todo el país.</p>
          <Link to="/" className="btn" style={{ background: '#fff', color: 'var(--accent)', fontWeight: 700, padding: '12px 28px', position: 'relative' }}>
            <i className="bi bi-bag me-1"></i>
            Ver catálogo
          </Link>
        </div>

        {/* Contacto */}
        {(config.telefono || config.horarios) && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontWeight: 700, textAlign: 'center', marginBottom: 20, color: 'var(--text)' }}>Contacto</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {config.horarios && <ContactCard icon="bi-clock" label="Horarios" value={config.horarios} />}
              {config.telefono && <ContactCard icon="bi-telephone" label="Teléfono" value={config.telefono} />}
            </div>
          </div>
        )}

        {/* Redes sociales */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Seguinos</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <a href="https://www.facebook.com/share/1BPSR6MTCm/" target="_blank" rel="noopener noreferrer" style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '1.3rem', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.08)'}
            >
              <i className="bi bi-facebook"></i>
            </a>
            <a href="https://www.instagram.com/gcinsumos?igsh=MXRscmd3OXN1aXFlOQ==" target="_blank" rel="noopener noreferrer" style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '1.3rem', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.08)'}
            >
              <i className="bi bi-instagram"></i>
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '1.3rem', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.08)'}
            >
              <i className="bi bi-whatsapp"></i>
            </a>
          </div>
        </div>

        {/* Botones */}
        <div className="d-flex flex-column align-items-center gap-3 pb-5 pt-3">
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="btn btn-accent" style={{ gap: 8, padding: '14px 32px', fontWeight: 600, fontSize: '1rem' }}>
            <i className="bi bi-whatsapp" style={{ fontSize: 20 }}></i>
            Consultanos por WhatsApp
          </a>
          <Link to="/" className="btn btn-outline" style={{ padding: '10px 24px' }}>
            <i className="bi bi-arrow-left me-1"></i>
            Volver al catálogo
          </Link>
        </div>
      </div>
    </>
  );
}

export default Nosotros;
