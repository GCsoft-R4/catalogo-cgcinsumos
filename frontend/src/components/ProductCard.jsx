import { useNavigate } from 'react-router-dom';
import { imageUrl as getImgUrl } from "../services/api";

const WHATSAPP = '5493586546525';

function ProductCard({ producto }) {
  const navigate = useNavigate();

  const imageUrl = getImgUrl(producto.imagen);
  const precio = producto.precio > 0
    ? `$${parseFloat(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '';

  const msg = encodeURIComponent(
    `Hola, me interesa ${producto.nombre}${precio ? ` (${precio})` : ''}`
  );

  return (
    <div className="card card-product h-100">
      <div
        className="cursor-pointer"
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
            <p className="fw-bold fs-5 mb-2" style={{ color: 'var(--accent)' }}>
              {precio}
            </p>
          )}
          <p className="card-text">{producto.descripcion}</p>
        </div>
        <a
          href={`https://wa.me/${WHATSAPP}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn w-100 mt-1 d-flex align-items-center justify-content-center gap-1"
          style={{ background: '#25D366', color: '#fff', borderRadius: 5, fontWeight: 600, fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
          onClick={e => e.stopPropagation()}
        >
          <i className="bi bi-whatsapp" style={{ fontSize: '0.75rem' }}></i>
          Consultar
        </a>
      </div>
    </div>
  );
}

export default ProductCard;