import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { imageUrl } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import SEOHead from '../components/SEOHead';

function Dashboard() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProductos = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search.trim()) params.search = search.trim();
    api.get('/productos', { params })
      .then(res => {
        setProductos(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/productos/${deleteTarget}`);
      setDeleteTarget(null);
      fetchProductos();
    } catch (err) {
      console.error('Error al eliminar:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
    <SEOHead title="Productos" />
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn p-0 border-0 fs-4 lh-1" onClick={() => navigate(-1)} style={{ color: 'var(--text)' }}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div>
          <h2 className="page-title mb-0">Productos</h2>
          <p className="text-muted small mb-0">{total} producto{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ maxWidth: 320, borderRadius: 8 }}
        />
        <button className="btn btn-accent flex-shrink-0" onClick={() => navigate('/admin/productos/nuevo')}>
          <i className="bi bi-plus-lg me-1"></i>Nuevo
        </button>
      </div>

      {loading ? (
        <div className="table-responsive" style={{ opacity: 0.6 }}>
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{ width: 52 }} className="d-none d-sm-table-cell"></th>
                <th>Nombre</th>
                <th className="d-none d-md-table-cell">Categoría</th>
                <th style={{ width: 120 }}>Precio</th>
                <th style={{ width: 130 }}></th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i}>
                  <td className="d-none d-sm-table-cell"><div className="skeleton" style={{ width: 40, height: 40, borderRadius: 6 }} /></td>
                  <td><div className="skeleton skeleton-line" /></td>
                  <td className="d-none d-md-table-cell"><div className="skeleton skeleton-line-sm" /></td>
                  <td><div className="skeleton skeleton-line-sm" /></td>
                  <td><div className="skeleton" style={{ height: 30, width: 120, marginLeft: 'auto' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : productos.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-box-seam"></i>
          <h5>No hay productos</h5>
          <p className="text-muted">Agregá tu primer producto para comenzar.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th style={{ width: 52 }} className="d-none d-sm-table-cell"></th>
                  <th>Nombre</th>
                  <th className="d-none d-md-table-cell">Categoría</th>
                  <th style={{ width: 120 }}>Precio</th>
                  <th style={{ width: 130 }}></th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id}>
                    <td className="d-none d-sm-table-cell">
                      <img
                        src={imageUrl(p.imagen)}
                        alt={p.nombre}
                        className="rounded"
                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-medium">{p.nombre}</td>
                    <td className="d-none d-md-table-cell text-muted small">
                      {p.categoria_nombre || '-'}
                    </td>
                    <td className="fw-semibold" style={{ color: 'var(--accent)' }}>
                      {p.precio > 0
                        ? `$${parseFloat(p.precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '-'}
                    </td>
                    <td>
                      <div className="d-flex flex-column flex-sm-row gap-1 justify-content-end">
                        <button
                          className="btn btn-sm btn-outline text-nowrap"
                          onClick={() => navigate(`/admin/productos/editar/${p.id}`)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger text-nowrap"
                          onClick={() => setDeleteTarget(p.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4 pt-3 border-top">
              <button
                className="btn btn-outline btn-sm pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                &larr; Anterior
              </button>
              <span className="text-muted small">
                Página {page} de {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Siguiente &rarr;
              </button>
            </div>
          )}
        </>
      )}
      <ConfirmModal
        show={!!deleteTarget}
        title="Eliminar producto"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar producto"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
    </>
  );
}

export default Dashboard;
