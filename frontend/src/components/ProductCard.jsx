import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageUrl as getImgUrl } from "../services/api";
import { useCart } from "../context/CartContext";
import { useConfig } from "../context/ConfigContext";

function ProductCard({ producto, viewMode = 'grid' }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { whatsapp_number } = useConfig();
  const [added, setAdded] = useState(false);

  const esNuevo = (() => {
    if (!producto.fecha_creacion) return false;
    const diff = Date.now() - new Date(producto.fecha_creacion).getTime();
    return diff < 3 * 24 * 60 * 60 * 1000;
  })();

  const esOferta = producto.oferta === true;
  const sinStock = producto.disponible === false || (producto.stock !== undefined && producto.stock <= 0);

  const imageUrl = getImgUrl(producto.imagen);
  const precio = producto.precio > 0
    ? `$${parseFloat(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '';

  const msg = encodeURIComponent(
    `Hola, me interesa ${producto.nombre}${precio ? ` (${precio})` : ''}`
  );

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(producto);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  if (viewMode === 'list') {
    return (
      <div
        className="card card-product card-product-list"
        style={{ flexDirection: 'row', overflow: 'hidden' }}
      >
        <div
          className="cursor-pointer position-relative"
          style={{ flex: '0 0 180px', minHeight: 140 }}
          onClick={() => navigate(`/producto/${producto.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate(`/producto/${producto.id}`)}
        >
          <img
            src={imageUrl}
            className="h-100 w-100"
            alt={producto.nombre}
            loading="lazy"
            style={{ objectFit: 'contain', background: '#f8f9fa', padding: 2, filter: sinStock ? 'grayscale(1)' : 'none', opacity: sinStock ? 0.6 : 1 }}
          />
          {esNuevo && (
            <span style={{ position: 'absolute', top: 8, left: 8, background: '#d1fae5', color: '#065f46', fontSize: '0.55rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Nuevo</span>
          )}
          {esOferta && (
            <span style={{ position: 'absolute', top: 8, left: esNuevo ? 60 : 8, background: '#fee2e2', color: '#dc2626', fontSize: '0.55rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Oferta</span>
          )}
          {sinStock && (
            <span style={{ position: 'absolute', top: 8, left: esOferta ? 116 : (esNuevo ? 60 : 8), background: '#fef2f2', color: '#dc2626', fontSize: '0.55rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Sin stock</span>
          )}
        </div>

        <div className="card-body d-flex flex-column flex-grow-1">
          <div
            className="cursor-pointer flex-grow-1"
            onClick={() => navigate(`/producto/${producto.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(`/producto/${producto.id}`)}
          >
            <h5 className="card-title">{producto.nombre}</h5>
            {producto.precio > 0 && (
              <p className="fw-bold fs-5 mb-0" style={{ color: 'var(--accent)' }}>
                {precio}
              </p>
            )}
          </div>
          <div className="d-flex gap-2 mt-2">
            <button
              className="btn d-inline-flex align-items-center justify-content-center gap-1 flex-grow-1"
              style={{ background: sinStock ? '#e5e7eb' : (added ? '#198754' : 'var(--accent)'), color: sinStock ? '#9ca3af' : '#fff', borderRadius: 8, fontWeight: 600, fontSize: '0.68rem', padding: '0.3rem 0.4rem', transition: 'background 0.15s', cursor: sinStock ? 'not-allowed' : 'pointer', border: 'none', minWidth: 0, whiteSpace: 'nowrap' }}
              onClick={handleAddToCart}
              disabled={sinStock}
            >
              <i className={`bi ${sinStock ? 'bi-cart-x' : (added ? 'bi-check-lg' : 'bi-cart-plus')}`} style={{ fontSize: '0.72rem', flexShrink: 0 }}></i>
              <span className="text-truncate">{sinStock ? 'Sin stock' : (added ? 'Agregado' : 'Agregar')}</span>
            </button>
            {whatsapp_number && (<a
              href={`https://wa.me/${whatsapp_number}?text=${msg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn d-inline-flex align-items-center justify-content-center gap-1 flex-grow-1"
              style={{ background: 'transparent', color: '#25D366', border: '1px solid #25D366', borderRadius: 8, fontWeight: 600, fontSize: '0.68rem', padding: '0.3rem 0.4rem', minWidth: 0, whiteSpace: 'nowrap' }}
              onClick={e => e.stopPropagation()}
            >
              <i className="bi bi-whatsapp" style={{ fontSize: '0.72rem', flexShrink: 0 }}></i>
              <span className="text-truncate">Consultar</span>
            </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card-product h-100">
      <div
        className="cursor-pointer position-relative"
        style={{ flex: '0 0 auto' }}
        onClick={() => navigate(`/producto/${producto.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && navigate(`/producto/${producto.id}`)}
      >
        <img
          src={imageUrl}
          className="card-img-top"
          alt={producto.nombre}
          loading="lazy"
          style={{ filter: sinStock ? 'grayscale(1)' : 'none', opacity: sinStock ? 0.6 : 1 }}
        />
          {esNuevo && (
            <span style={{ position: 'absolute', top: 8, left: 8, background: '#d1fae5', color: '#065f46', fontSize: '0.55rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Nuevo</span>
          )}
          {esOferta && (
            <span style={{ position: 'absolute', top: 8, left: esNuevo ? 60 : 8, background: '#fee2e2', color: '#dc2626', fontSize: '0.55rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Oferta</span>
          )}
          {sinStock && (
            <span style={{ position: 'absolute', top: 8, left: esOferta ? 116 : (esNuevo ? 60 : 8), background: '#fef2f2', color: '#dc2626', fontSize: '0.55rem', fontWeight: 700, padding: '3px 9px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Sin stock</span>
          )}
        </div>

      <div className="card-body d-flex flex-column">
        <div
          className="cursor-pointer flex-grow-1"
          onClick={() => navigate(`/producto/${producto.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate(`/producto/${producto.id}`)}
        >
          <h5 className="card-title">{producto.nombre}</h5>
          {producto.precio > 0 && (
            <p className="fw-bold fs-5 mb-0" style={{ color: 'var(--accent)' }}>
              {precio}
            </p>
          )}
        </div>
          <div className="d-flex gap-2 mt-2">
            <button
              className="btn d-inline-flex align-items-center justify-content-center gap-1 flex-grow-1"
              style={{ background: sinStock ? '#e5e7eb' : (added ? '#198754' : 'var(--accent)'), color: sinStock ? '#9ca3af' : '#fff', borderRadius: 8, fontWeight: 600, fontSize: '0.72rem', padding: '0.3rem 0.6rem', transition: 'background 0.15s', cursor: sinStock ? 'not-allowed' : 'pointer', border: 'none', minWidth: 0, whiteSpace: 'nowrap' }}
              onClick={handleAddToCart}
              disabled={sinStock}
            >
              <i className={`bi ${sinStock ? 'bi-cart-x' : (added ? 'bi-check-lg' : 'bi-cart-plus')}`} style={{ fontSize: '0.75rem', flexShrink: 0 }}></i>
              <span className="text-truncate">{sinStock ? 'Sin stock' : (added ? 'Agregado' : 'Agregar')}</span>
            </button>
            {whatsapp_number && (<a
              href={`https://wa.me/${whatsapp_number}?text=${msg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn d-inline-flex align-items-center justify-content-center gap-1 flex-grow-1"
              style={{ background: 'transparent', color: '#25D366', border: '1px solid #25D366', borderRadius: 8, fontWeight: 600, fontSize: '0.72rem', padding: '0.3rem 0.6rem', minWidth: 0, whiteSpace: 'nowrap' }}
              onClick={e => e.stopPropagation()}
            >
              <i className="bi bi-whatsapp" style={{ fontSize: '0.75rem', flexShrink: 0 }}></i>
              <span className="text-truncate">Consultar</span>
            </a>
            )}
          </div>
      </div>
    </div>
  );
}

export default ProductCard;
