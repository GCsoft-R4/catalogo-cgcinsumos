import { useState, useEffect } from 'react';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

function Categorias() {
  const [list, setList] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editing, setEditing] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = () => {
    api.get('/categorias')
      .then(res => setList(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/categorias', { nombre });
      setNombre('');
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear');
    }
  };

  const handleUpdate = async () => {
    setError('');
    try {
      await api.put(`/categorias/${editing}`, { nombre: editNombre });
      setEditing(null);
      setEditNombre('');
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/categorias/${deleteTarget}`);
      setDeleteTarget(null);
      fetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="table-responsive" style={{ opacity: 0.6, maxWidth: 400, marginTop: 80 }}>
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Productos</th>
              <th style={{ width: 140 }} />
            </tr>
          </thead>
          <tbody>
            {[1,2,3].map(i => (
              <tr key={i}>
                <td><div className="skeleton skeleton-line" /></td>
                <td><div className="skeleton skeleton-line-sm" /></td>
                <td><div className="skeleton" style={{ height: 30, width: 120 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn p-0 border-0 fs-4 lh-1" onClick={() => window.history.back()} style={{ color: 'var(--text)' }}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="page-title mb-0">Categorías</h2>
      </div>

      {editing && (
        <div className="card border p-4 mb-4" style={{ borderRadius: 12, background: 'var(--bg)' }}>
          <h5 className="section-title">Editar categoría</h5>
          <div className="d-flex gap-2">
            <input type="text" className="form-control" value={editNombre} onChange={e => setEditNombre(e.target.value)} />
            <button className="btn btn-accent" onClick={handleUpdate}>Guardar</button>
            <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-md-5">
          <div className="card border p-4" style={{ borderRadius: 12, background: 'var(--bg)' }}>
            <h5 className="section-title">Agregar categoría</h5>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-accent">Crear categoría</button>
            </form>
          </div>
        </div>
        <div className="col-md-7">
          {list.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-tags"></i>
              <h5>No hay categorías</h5>
              <p className="text-muted">Creá categorías para organizar los productos.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Productos</th>
                    <th style={{ width: 140 }} />
                  </tr>
                </thead>
                <tbody>
                  {list.map(c => (
                    <tr key={c.id}>
                      <td className="fw-medium">{c.nombre}</td>
                      <td className="text-muted">{c.total_productos}</td>
                      <td>
                        <div className="d-flex flex-column flex-sm-row gap-1">
                          <button className="btn btn-sm btn-outline text-nowrap" onClick={() => { setEditing(c.id); setEditNombre(c.nombre); }}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-outline-danger text-nowrap" onClick={() => setDeleteTarget(c.id)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        show={!!deleteTarget}
        title="Eliminar categoría"
        message="¿Eliminar esta categoría? Los productos asociados quedarán sin categoría."
        confirmLabel="Eliminar categoría"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}

export default Categorias;
