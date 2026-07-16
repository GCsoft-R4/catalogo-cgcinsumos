import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProductos = (cat = categoriaActiva, pg = page, search = searchQuery) => {
    setLoading(true);
    const params = { page: pg, limit: 12 };
    if (cat) params.categoria = cat;
    if (search) params.search = search;
    api.get('/productos', { params })
      .then(res => {
        setProductos(res.data.data);
        setTotalPages(res.data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProductos(categoriaActiva, page, searchQuery);
  }, [categoriaActiva, page, searchQuery]);

  const cambiarCategoria = slug => {
    setCategoriaActiva(slug);
    setPage(1);
    setSearchInput('');
    setSearchQuery('');
  };

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput.trim().toLowerCase());
  };

  const handleSearchKey = e => {
    if (e.key === 'Enter') handleSearch();
  };

  const filtered = searchQuery
    ? productos.filter(p =>
        p.nombre.toLowerCase().includes(searchQuery) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery)) ||
        (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(searchQuery))
      )
    : productos;

  if (loading && productos.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center mb-4">
          <div className="skeleton" style={{ height: 36, width: 200, margin: '0 auto 12px' }} />
          <div className="skeleton" style={{ height: 20, width: 300, margin: '0 auto' }} />
        </div>
        <div className="row g-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div className="col-6 col-md-4 col-lg-3" key={i}>
              <div className="skeleton-card">
                <div className="skeleton skeleton-card-img" />
                <div className="skeleton-card-body">
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line-sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
    <SEOHead
      title="Catálogo"
      description="Parlantes, cargadores, auriculares y accesorios electrónicos. Comprá online en GCinsumos, General Cabrera."
    />
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="fw-bold mb-3">Catálogo</h1>
        <p className="text-muted" style={{ maxWidth: 480, margin: '0 auto' }}>
          Insumos y accesorios para tu vida diaria
        </p>
      </div>

      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <div className="input-group" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <input
              type="text"
              className="form-control form-control-lg border-0"
              placeholder="Buscar productos..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKey}
              style={{ padding: '0.85rem 1.2rem', boxShadow: 'none' }}
            />
            <button
              className="btn d-flex align-items-center justify-content-center"
              onClick={handleSearch}
              style={{ background: 'transparent', color: 'var(--text-secondary)', borderRadius: 0, padding: '0 1rem', border: 'none' }}
            >
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>

      {categorias.length > 0 && (
        <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
          <button
            className={`btn btn-sm ${!categoriaActiva ? 'btn-accent' : 'btn-outline'}`}
            onClick={() => cambiarCategoria('')}
          >
            Todas
          </button>
          {categorias.map(c => (
            <button
              key={c.id}
              className={`btn btn-sm ${categoriaActiva === c.slug ? 'btn-accent' : 'btn-outline'}`}
              onClick={() => cambiarCategoria(c.slug)}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          {!searchQuery ? (
            <>
              <i className="bi bi-box-seam"></i>
              <h5>Catálogo vacío</h5>
              <p className="text-muted">Todavía no hay productos disponibles. Volvé pronto.</p>
            </>
          ) : (
            <>
              <i className="bi bi-search"></i>
              <h5>Sin resultados</h5>
              <p className="text-muted">No encontramos productos que coincidan con tu búsqueda. Intentá con otro término.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="row g-4">
            {filtered.map(p => (
              <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                <ProductCard producto={p} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-5">
              <button
                className="btn btn-outline btn-sm pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                &larr; Anterior
              </button>
              <span className="d-flex align-items-center px-3 text-muted small">
                {page} / {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Siguiente &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}

export default Catalogo;
