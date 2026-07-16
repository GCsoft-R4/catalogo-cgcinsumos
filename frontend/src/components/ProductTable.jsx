import { useNavigate } from 'react-router-dom';
import api, { imageUrl } from '../services/api';

function ProductTable({ productos, onDelete }) {
  const navigate = useNavigate();

  const handleDelete = async id => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      onDelete(id);
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  if (productos.length === 0) {
    return (
      <div className="empty-state">
        <h5>No hay productos</h5>
        <p className="text-muted">Agregá tu primer producto para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th style={{ width: 60 }} className="d-none d-sm-table-cell">Imagen</th>
            <th>Nombre</th>
            <th className="d-none d-md-table-cell">Precio</th>
            <th className="d-none d-md-table-cell">Fecha</th>
            <th style={{ width: 140 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td className="d-none d-sm-table-cell" style={{ width: 60 }}>
                <img
                  src={imageUrl(p.imagen)}
                  alt={p.nombre}
                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                />
              </td>
              <td className="fw-medium">{p.nombre}</td>
              <td className="d-none d-md-table-cell">
                {p.precio > 0
                  ? `$${parseFloat(p.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : '-'}
              </td>
              <td className="text-muted d-none d-md-table-cell">
                {new Date(p.fecha_creacion).toLocaleDateString('es-AR', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </td>
              <td>
                <button className="btn btn-sm btn-outline me-1" onClick={() => navigate(`/admin/productos/editar/${p.id}`)}
                  style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                  Editar
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}
                  style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;
