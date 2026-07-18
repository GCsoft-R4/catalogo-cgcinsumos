import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { imageUrl } from '../services/api';
import SEOHead from '../components/SEOHead';

function ProductoDetalle() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState('');

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

  if (loading) {
    return (
      <div className="container py-5">
        <div className="skeleton" style={{ height: 40, width: 100, marginBottom: 24, borderRadius: 8 }} />
        <div className="row g-5">
          <div className="col-lg-7">
            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/10', borderRadius: 12 }} />
          </div>
          <div className="col-lg-5">
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

  return (
    <>
    <SEOHead
      title={producto.nombre}
      description={producto.descripcion ? producto.descripcion.slice(0, 160) : `Comprá ${producto.nombre} en GCinsumos.`}
      image={ogImage}
    />
    <div className="container py-5">
      <Link to="/" className="btn btn-outline mb-4">&larr; Volver</Link>
      <div className="row g-5 align-items-start">
        <div className="col-lg-7">
          <div className="d-flex gap-3">
            {todasLasImagenes.length > 1 && (
              <div className="d-flex flex-column gap-2" style={{ flexShrink: 0 }}>
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
        <div className="col-lg-5">
          <h1 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>{producto.nombre}</h1>
          {producto.precio > 0 && (
            <p className="fw-bold fs-3 mb-3" style={{ color: 'var(--accent)' }}>
              ${parseFloat(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
          <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            {producto.descripcion}
          </p>
          <p className="text-muted small mt-4">
            Agregado el {new Date(producto.fecha_creacion).toLocaleDateString('es-AR', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <a
            href={`https://wa.me/5493586546525?text=${encodeURIComponent(
              `Hola, me interesa ${producto.nombre}${producto.precio > 0 ? ` ($${parseFloat(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto mt-3"
            style={{ background: '#25D366', color: '#fff', borderRadius: 8, fontWeight: 600, padding: '0.75rem 1.5rem', fontSize: '1rem' }}
          >
            <i className="bi bi-whatsapp fs-5"></i>
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
    </>
  );
}

export default ProductoDetalle;
