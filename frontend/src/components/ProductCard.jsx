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

  const imageUrl = getImgUrl(producto.imagen);
  const precio = producto.precio > 0
    ? `$${parseFloat(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '';

  const sinStock = producto.disponible === false;
  const sinInventario = !sinStock && producto.stock !== undefined && producto.stock <= 0;

  const esNuevo = (() => {
    if (!producto.fecha_creacion) return false;
    const diff = Date.now() - new Date(producto.fecha_creacion).getTime();
    return diff < 3 * 24 * 60 * 60 * 1000;
  })();

  const esOferta = producto.oferta === true;

  const msg = encodeURIComponent(
    `Hola, me interesa ${producto.nombre}${precio ? ` (${precio})` : ''}`
  );

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(producto);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  const stockBadge = producto.stock > 0
    ? { text: `${producto.stock} en stock`, style: { background: '#10b981', color: '#fff', border: '1px solid #059669' } }
    : { text: '0 en stock', style: { background: '#f3f4f6', color: '#dc2626', border: '1px solid #fca5a5' } };

  const renderButtons = () => {
    if (sinStock) {
      return (
        <span className="btn w-100 mt-1 d-flex align-items-center justify-content-center gap-1"
          style={{ background: '#e5e5e0', color: '#999', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem', cursor: 'default' }}>
          No disponible
        </span>
      );
    }
    if (sinInventario) {
      return (
        <div className="d-flex gap-3 mt-1">
          <span className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-1"
            style={{ background: '#e5e5e0', color: '#999', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem', cursor: 'default' }}>
            <i className="bi bi-x-circle" style={{ fontSize: '0.75rem' }}></i>
            Agotado
          </span>
          {whatsapp_number && (<a
            href={`https://wa.me/${whatsapp_number}?text=${msg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn d-flex align-items-center justify-content-center gap-1"
            style={{ background: '#25D366', color: '#fff', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
            onClick={e => e.stopPropagation()}
          >
            <i className="bi bi-whatsapp" style={{ fontSize: '0.75rem' }}></i>
            Consultar
          </a>
          )}
        </div>
      );
    }
    return (
      <div className="d-flex gap-3 mt-1">
        <button
          className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-1"
          style={{ background: added ? '#198754' : 'var(--accent)', color: '#fff', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem', transition: 'background 0.15s' }}
          onClick={handleAddToCart}
        >
          <i className={`bi ${added ? 'bi-check-lg' : 'bi-cart-plus'}`} style={{ fontSize: '0.75rem' }}></i>
          {added ? 'Agregado' : 'Agregar'}
        </button>
        {whatsapp_number && (<a
          href={`https://wa.me/${whatsapp_number}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-1"
          style={{ background: '#25D366', color: '#fff', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
          onClick={e => e.stopPropagation()}
        >
          <i className="bi bi-whatsapp" style={{ fontSize: '0.75rem' }}></i>
          Consultar
        </a>
        )}
      </div>
    );
  };

  const renderDescripcion = producto.descripcion ? (
    <p className="mt-2 mb-0" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
      {producto.descripcion}
    </p>
  ) : null;

  if (viewMode === 'list') {
    return (
      <div
        className={`card card-product card-product-list${sinStock ? ' producto-sin-stock' : ''}`}
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
            style={{ objectFit: 'contain', background: '#f8f9fa', padding: 2 }}
          />
          {esNuevo && (
            <span style={{ position: 'absolute', top: 8, left: 8, background: '#d1fae5', color: '#065f46', fontSize: '0.55rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Nuevo</span>
          )}
          {esOferta && (
            <span style={{ position: 'absolute', top: 8, left: esNuevo ? 52 : 8, background: '#fee2e2', color: '#dc2626', fontSize: '0.55rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Oferta</span>
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
            <div className="d-flex align-items-center justify-content-between">
              {producto.precio > 0 && <span className="fw-bold fs-5">{precio}</span>}
              {producto.stock !== undefined && (
                <span style={{ ...stockBadge.style, fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.02em' }}>
                  {stockBadge.text}
                </span>
              )}
            </div>
            {renderDescripcion}
          </div>
          {renderButtons()}
        </div>
      </div>
    );
  }

  return (
    <div className={`card card-product h-100${sinStock ? ' producto-sin-stock' : ''}`}>
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
        />
        {esNuevo && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: '#d1fae5', color: '#065f46', fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Nuevo</span>
        )}
        {esOferta && (
          <span style={{ position: 'absolute', top: 8, left: esNuevo ? 60 : 8, background: '#fee2e2', color: '#dc2626', fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Oferta</span>
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
          <div className="d-flex align-items-center justify-content-between">
            {producto.precio > 0 && <span className="fw-bold fs-5">{precio}</span>}
            {producto.stock !== undefined && (
              <span style={{ ...stockBadge.style, fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 3, letterSpacing: '0.02em' }}>
                {stockBadge.text}
              </span>
            )}
          </div>
          {renderDescripcion}
        </div>
        {renderButtons()}
      </div>
    </div>
  );
}

export default ProductCard;
