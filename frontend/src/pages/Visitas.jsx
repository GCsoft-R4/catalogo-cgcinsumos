import { useState, useEffect } from 'react';
import api from '../services/api';

function Visitas() {
  const [visitas, setVisitas] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/visitas?page=${page}&limit=50`).then(res => {
      setVisitas(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

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

  if (loading) return <p className="text-muted">Cargando...</p>;

  return (
    <div>
      <h4 className="mb-4">Visitas al catálogo</h4>
      <p className="text-muted small mb-4">
        Registro de accesos al catálogo público, ordenados del más reciente al más antiguo.
      </p>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Página</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {visitas.length === 0 && (
              <tr><td colSpan={4} className="text-muted text-center">Sin visitas registradas</td></tr>
            )}
            {visitas.map(v => (
              <tr key={v.id}>
                <td>{formatDate(v.created_at)}</td>
                <td>{formatTime(v.created_at)}</td>
                <td><code>{v.pagina}</code></td>
                <td className="text-muted" style={{ fontSize: '0.85rem' }}>{v.ip}</td>
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
