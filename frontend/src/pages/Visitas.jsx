import { useState, useEffect } from 'react';
import api from '../services/api';

function Visitas() {
  const [visitas, setVisitas] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState('todas');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/visitas?page=${page}&limit=50&tipo=${tipo}`).then(res => {
      setVisitas(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, tipo]);

  function formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  function formatTime(d) {
    const date = new Date(d);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  async function borrarVisita(id) {
    if (!confirm('¿Borrar esta visita?')) return;
    try {
      await api.delete(`/visitas/${id}`);
      setVisitas(prev => prev.filter(v => v.id !== id));
    } catch {}
  }

  async function borrarTodas() {
    if (!confirm('¿Borrar TODAS las visitas?')) return;
    try {
      await api.delete('/visitas');
      setPage(1);
      setTipo('todas');
      setMsg('Todas las visitas fueron borradas');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Error al borrar');
      setTimeout(() => setMsg(''), 3000);
    }
  }

  function cambiarTipo(nuevo) {
    setTipo(nuevo);
    setPage(1);
  }

  if (loading) return <p className="text-muted">Cargando...</p>;

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <h4 className="mb-0">Visitas al catálogo</h4>
        <div className="d-flex align-items-center gap-2">
          {msg && <span className="small text-success">{msg}</span>}
          <button className="btn btn-outline-danger btn-sm" onClick={borrarTodas}>
            <i className="bi bi-trash me-1"></i>Borrar todas
          </button>
        </div>
      </div>

      <div className="btn-group btn-group-sm mb-3">
        <button className={`btn ${tipo === 'todas' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => cambiarTipo('todas')}>Todas</button>
        <button className={`btn ${tipo === 'locales' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => cambiarTipo('locales')}>Locales</button>
        <button className={`btn ${tipo === 'externas' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => cambiarTipo('externas')}>Externas</button>
      </div>

      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Página</th>
              <th>IP</th>
              <th>Ubicación</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {visitas.length === 0 && (
              <tr><td colSpan={6} className="text-muted text-center py-4">Sin visitas registradas</td></tr>
            )}
            {visitas.map(v => (
              <tr key={v.id}>
                <td>{formatDate(v.created_at)}</td>
                <td>{formatTime(v.created_at)}</td>
                <td><code>{v.pagina}</code></td>
                <td>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>{v.ip}</span>
                  {v.local && <span className="badge bg-info ms-1" style={{ fontSize: '0.7rem' }}>Local</span>}
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {v.geo ? `${v.geo.ciudad}, ${v.geo.pais}` : <span className="text-muted">—</span>}
                </td>
                <td>
                  <button className="btn btn-sm p-0 border-0 text-danger" onClick={() => borrarVisita(v.id)} title="Borrar">
                    <i className="bi bi-x-lg"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav>
          <ul className="pagination pagination-sm justify-content-center">
            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Siguiente</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default Visitas;
