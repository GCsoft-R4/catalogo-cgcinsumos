import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { imageUrl } from '../services/api';
import { useConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';

const iconMap = [
  { keywords: ['bluetooth', 'inalambrico', 'wireless', 'inalámbrico'], icon: '📶' },
  { keywords: ['voz', 'voice'], icon: '🎙️' },
  { keywords: ['bass', 'graves', 'subwoofer', 'bajo'], icon: '🔊' },
  { keywords: ['stereo', 'estereo', 'estéreo'], icon: '🎵' },
  { keywords: ['rgb', 'luz led', 'led', 'iluminacion', 'iluminación'], icon: '💡' },
  { keywords: ['bateria', 'batería', 'horas', 'duracion', 'duración', 'recargable'], icon: '🔋' },
  { keywords: ['manos libres', 'microfono', 'micrófono'], icon: '🎤' },
  { keywords: ['usb', 'carga', 'cargador', 'tipo c', 'type-c'], icon: '🔌' },
  { keywords: ['agua', 'resistente', 'ipx', 'salpicaduras'], icon: '💧' },
  { keywords: ['control remoto', 'remoto'], icon: '🎮' },
  { keywords: ['wifi', 'conexion', 'conexión', 'conectividad'], icon: '🌐' },
];

function getIcon(text) {
  const lower = text.toLowerCase();
  for (const entry of iconMap) {
    if (entry.keywords.some(k => lower.includes(k))) return entry.icon;
  }
  return null;
}

function parseDescription(desc) {
  if (!desc) return null;
  const parts = desc.split(/\s*-\s*/).map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) return { type: 'text', content: desc };
  const items = parts.filter(p => !/^[A-Z\s]{4,}$/.test(p));
  return { type: 'list', items };
}

function ProductoDetalle() {
  const { id } = useParams();
  const { nombre_negocio, whatsapp_number } = useConfig();
  const { addItem } = useCart();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/productos/${id}`)
      .then(res => {
        const p = res.data.data;
        setProducto(p);
        if (p.imagenes?.length) {
          setSelectedImg(p.imagenes[0]);
        } else if (p.imagen) {
          setSelectedImg(p.imagen);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addItem(producto);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="skeleton" style={{ height: 40, width: 100, marginBottom: 24, borderRadius: 8 }} />
        <div className="row g-5">
          <div className="col-lg-6">
            <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3', borderRadius: 12 }} />
          </div>
          <div className="col-lg-6">
            <div className="skeleton" style={{ height: 36, width: '70%', marginBottom: 16, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 32, width: '40%', marginBottom: 24, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 16, width: '100%', marginBottom: 10, borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 16, width: '90%', marginBottom: 10, borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 10, borderRadius: 6 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="container py-5 text-center">
        <h3>Producto no encontrado</h3>
        <Link to="/" className="btn btn-accent mt-3">Volver al catálogo</Link>
      </div>
    );
  }

  const todasLasImagenes = producto.imagenes?.length
    ? producto.imagenes
    : (producto.imagen ? [producto.imagen] : []);

  const ogImage = producto.imagenes?.[0] || producto.imagen;

  const descParsed = parseDescription(producto.descripcion);

  return (
    <>
    <SEOHead
      title={producto.nombre}
      description={producto.descripcion ? producto.descripcion.slice(0, 160) : `Comprá ${producto.nombre} en ${nombre_negocio || 'nuestro negocio'}.`}
      image={ogImage}
    />
    <div className="container py-5">
      <Link to="/" className="btn d-inline-flex align-items-center gap-1 mb-4 fw-semibold" style={{ border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
        <i className="bi bi-arrow-left"></i> Volver
      </Link>
      <div className="row g-5">
        <div className="col-lg-6">
          <div className="d-flex gap-3">
            {todasLasImagenes.length > 1 && (
              <div className="d-flex flex-column gap-2 detail-thumbs" style={{ flexShrink: 0 }}>
                {todasLasImagenes.map((f, i) => (
                  <div
                    key={f}
                    className={`border rounded overflow-hidden ${f === selectedImg ? 'border-primary' : 'border'}`}
                    style={{ width: 64, height: 64, cursor: 'pointer', opacity: f === selectedImg ? 1 : 0.5, borderWidth: f === selectedImg ? 2 : 1 }}
                    onClick={() => setSelectedImg(f)}
                  >
                    <img
                      src={imageUrl(f)}
                      alt={`${producto.nombre} ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex-grow-1">
              {selectedImg ? (
                <img src={imageUrl(selectedImg)} alt={producto.nombre} className="detail-image w-100" />
              ) : (
                <img src="https://placehold.co/800x500/e5e7eb/9ca3af?text=Sin+imagen" alt={producto.nombre} className="detail-image w-100" />
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <h1 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>{producto.nombre}</h1>
          {producto.precio > 0 && (
            <p className="fw-bold mb-1" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--accent)' }}>
              ${parseFloat(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
          <div className="mb-3" style={{ marginTop: '-2px' }}>
            {producto.disponible === false ? (
              <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                Sin stock
              </span>
            ) : (
              <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                {producto.stock > 0 ? `${producto.stock} en stock` : 'Sin stock'}
              </span>
            )}
          </div>
          {descParsed && descParsed.type === 'list' ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {descParsed.items.map((item, i) => {
                const icon = getIcon(item);
                return (
                  <li key={i} style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#374151' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      {icon && <span style={{ flexShrink: 0, fontSize: '1rem' }}>{icon}</span>}
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : descParsed && descParsed.type === 'text' ? (
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: 1.7 }}>{descParsed.content}</p>
          ) : null}
          <div className="d-flex flex-wrap gap-2 mt-4">
            <button
              className="btn d-inline-flex align-items-center justify-content-center gap-2"
              style={{ background: added ? '#198754' : 'var(--accent)', color: '#fff', borderRadius: 8, fontWeight: 600, padding: '0.65rem 1.25rem', fontSize: '0.9rem', border: 'none', transition: 'background 0.15s', flex: '1 1 auto', minWidth: 160 }}
              onClick={handleAddToCart}
            >
              <i className={`bi ${added ? 'bi-check-lg' : 'bi-cart-plus'}`} style={{ fontSize: '1rem' }}></i>
              {added ? 'Agregado' : 'Agregar al carrito'}
            </button>
            {whatsapp_number && (
            <a
              href={`https://wa.me/${whatsapp_number}?text=${encodeURIComponent(
                `Hola, me interesa ${producto.nombre}${producto.precio > 0 ? ` ($${parseFloat(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : ''}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn d-inline-flex align-items-center justify-content-center gap-2"
              style={{ background: 'transparent', color: '#25D366', border: '1px solid #25D366', borderRadius: 8, fontWeight: 600, padding: '0.65rem 1.25rem', fontSize: '0.9rem', flex: '1 1 auto', minWidth: 160 }}
            >
              <i className="bi bi-whatsapp" style={{ fontSize: '1rem' }}></i>
              Consultar
            </a>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default ProductoDetalle;
