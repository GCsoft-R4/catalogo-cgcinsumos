import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageUrl as getImgUrl } from "../services/api";
import { useCart } from "../context/CartContext";
import { useFavoritos } from "../context/FavoritosContext";
import { WHATSAPP_NUMBER } from '../utils/constants';

function ProductCard({ producto, viewMode = 'grid' }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isFavorito, toggle } = useFavoritos();
  const [added, setAdded] = useState(false);
  const favorito = isFavorito(producto.id);

  const esNuevo = (() => {
    if (!producto.fecha_creacion) return false;
    const diff = Date.now() - new Date(producto.fecha_creacion).getTime();
    return diff < 3 * 24 * 60 * 60 * 1000;
  })();

  const esOferta = producto.oferta === true;

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

  const handleToggleFavorito = (e) => {
    e.stopPropagation();
    toggle(producto.id);
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
          {esNuevo && !sinStock && (
            <span style={{ position: 'absolute', top: 8, left: 8, background: '#10b981', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Nuevo</span>
          )}
          {esOferta && !sinStock && (
            <span style={{ position: 'absolute', top: 8, left: esNuevo ? 52 : 8, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Oferta</span>
          )}
          <button
            onClick={handleToggleFavorito}
            style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <i className={`bi ${favorito ? 'bi-heart-fill' : 'bi-heart'}`} style={{ fontSize: '0.85rem', color: favorito ? '#e74c3c' : '#999' }}></i>
          </button>
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
        {esNuevo && !sinStock && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: '#10b981', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Nuevo</span>
        )}
        {esOferta && !sinStock && (
          <span style={{ position: 'absolute', top: 8, left: esNuevo ? 60 : 8, background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 }}>Oferta</span>
        )}
        <button
          onClick={handleToggleFavorito}
          style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <i className={`bi ${favorito ? 'bi-heart-fill' : 'bi-heart'}`} style={{ fontSize: '0.85rem', color: favorito ? '#e74c3c' : '#999' }}></i>
        </button>
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
