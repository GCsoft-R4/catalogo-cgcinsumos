import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageUrl as getImgUrl } from "../services/api";
import { useCart } from "../context/CartContext";
import { WHATSAPP_NUMBER } from '../utils/constants';

function ProductCard({ producto, viewMode = 'grid' }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const imageUrl = getImgUrl(producto.imagen);
  const precio = producto.precio > 0
    ? `$${parseFloat(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '';

  const sinStock = producto.disponible === false;

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
            className={`h-100 w-100${sinStock ? ' img-grayscale' : ''}`}
            alt={producto.nombre}
            loading="lazy"
            style={{ objectFit: 'cover' }}
          />
          {sinStock && (
            <span className="sin-stock-badge">Sin stock</span>
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
              <p className={`fw-bold fs-5 mb-2${sinStock ? ' text-muted' : ''}`} style={{ color: sinStock ? undefined : 'var(--accent)' }}>
                {precio}
              </p>
            )}
            <p className="card-text">{producto.descripcion}</p>
          </div>
          {sinStock ? (
            <div className="d-flex gap-2 mt-1">
              <button
                className="btn d-inline-flex align-items-center justify-content-center gap-1"
                style={{ background: added ? '#198754' : 'var(--accent)', color: '#fff', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem', transition: 'background 0.15s' }}
                onClick={handleAddToCart}
              >
                <i className={`bi ${added ? 'bi-check-lg' : 'bi-cart-plus'}`} style={{ fontSize: '0.75rem' }}></i>
                {added ? 'Agregado' : 'Agregar'}
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn d-inline-flex align-items-center justify-content-center gap-1"
                style={{ background: '#25D366', color: '#fff', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                onClick={e => e.stopPropagation()}
              >
                <i className="bi bi-whatsapp" style={{ fontSize: '0.75rem' }}></i>
                Consultar
              </a>
            </div>
          ) : (
            <span className="btn mt-1 d-inline-flex align-items-center justify-content-center gap-1 align-self-start"
              style={{ background: '#e5e5e0', color: '#999', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem', cursor: 'default' }}>
              No disponible
            </span>
          )}
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
          className={`card-img-top${sinStock ? ' img-grayscale' : ''}`}
          alt={producto.nombre}
          loading="lazy"
        />
        {sinStock && (
          <span className="sin-stock-badge">Sin stock</span>
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
            <p className={`fw-bold fs-5 mb-2${sinStock ? ' text-muted' : ''}`} style={{ color: sinStock ? undefined : 'var(--accent)' }}>
              {precio}
            </p>
          )}
          <p className="card-text">{producto.descripcion}</p>
        </div>
        {sinStock ? (
          <span className="btn w-100 mt-1 d-flex align-items-center justify-content-center gap-1"
            style={{ background: '#e5e5e0', color: '#999', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem', cursor: 'default' }}>
            No disponible
          </span>
        ) : (
          <div className="d-flex gap-2 mt-1">
            <button
              className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-1"
              style={{ background: added ? '#198754' : 'var(--accent)', color: '#fff', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem', transition: 'background 0.15s' }}
              onClick={handleAddToCart}
            >
              <i className={`bi ${added ? 'bi-check-lg' : 'bi-cart-plus'}`} style={{ fontSize: '0.75rem' }}></i>
              {added ? 'Agregado' : 'Agregar'}
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn flex-grow-1 d-flex align-items-center justify-content-center gap-1"
              style={{ background: '#25D366', color: '#fff', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              onClick={e => e.stopPropagation()}
            >
              <i className="bi bi-whatsapp" style={{ fontSize: '0.75rem' }}></i>
              Consultar
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
