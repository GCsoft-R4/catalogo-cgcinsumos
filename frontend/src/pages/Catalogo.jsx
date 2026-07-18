import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  const fetchProductos = (cat = categoriaActiva, pg = page, search = searchQuery, sortBy = sort) => {
    setLoading(true);
    const params = { page: pg, limit: 12, sort: sortBy };
    if (cat) params.categoria = cat;
    if (search) params.search = search;
    api.get('/productos', { params })
      .then(res => {
        setProductos(res.data.data || []);
        setTotalPages(res.data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProductos(categoriaActiva, page, searchQuery, sort);
  }, [categoriaActiva, page, searchQuery, sort]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || !Array.isArray(categorias) || categorias.length < 3) return;
    intervalRef.current = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 130, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [categorias]);

  const scrollCarousel = (dir) => {
    clearInterval(intervalRef.current);
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  const cambiarCategoria = slug => {
    setCategoriaActiva(slug);
    setPage(1);
    setSearchInput('');
    setSearchQuery('');
    clearInterval(intervalRef.current);
  };

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput.trim().toLowerCase());
  };

  const handleSearchKey = e => {
    if (e.key === 'Enter') handleSearch();
  };

  const list = Array.isArray(productos) ? productos : [];
  const filtered = searchQuery
    ? list.filter(p =>
        p.nombre.toLowerCase().includes(searchQuery) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery)) ||
        (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(searchQuery))
      )
    : list;

  if (loading && (!Array.isArray(productos) || productos.length === 0)) {
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
        <div className="col-auto d-flex align-items-center">
          <select
            className="form-select form-select-sm"
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            style={{ borderRadius: 8, border: '1px solid var(--border)', padding: '0.4rem 2rem 0.4rem 0.75rem' }}
          >
            <option value="newest">Más nuevos</option>
            <option value="nombre_asc">Alfabético A-Z</option>
            <option value="nombre_desc">Alfabético Z-A</option>
            <option value="precio_desc">Mayor precio</option>
            <option value="precio_asc">Menor precio</option>
          </select>
          <div className="btn-group ms-2" role="group">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-dark' : 'btn-outline'}`}
              onClick={() => setViewMode('grid')}
              title="Vista cuadrícula"
            >
              <i className="bi bi-grid-3x3-gap"></i>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-dark' : 'btn-outline'}`}
              onClick={() => setViewMode('list')}
              title="Vista lista"
            >
              <i className="bi bi-list"></i>
            </button>
          </div>
        </div>
      </div>

      {Array.isArray(categorias) && categorias.length > 0 && (
        <div className="categoria-carousel-wrapper mb-4" onMouseEnter={() => clearInterval(intervalRef.current)}>
          <button className="carousel-arrow" onClick={() => scrollCarousel(-1)} aria-label="Anterior">
            <i className="bi bi-chevron-left"></i>
          </button>
          <div className="categoria-carousel" ref={carouselRef}>
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
          <button className="carousel-arrow" onClick={() => scrollCarousel(1)} aria-label="Siguiente">
            <i className="bi bi-chevron-right"></i>
          </button>
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
          {viewMode === 'grid' ? (
            <div className="row g-4">
              {filtered.map(p => (
                <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                  <ProductCard producto={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filtered.map(p => (
                <ProductCard key={p.id} producto={p} viewMode="list" />
              ))}
            </div>
          )}

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
    <footer style={{ textAlign: 'left', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
      &copy; {new Date().getFullYear()} GCsoft &mdash; Todos los derechos reservados
    </footer>
    </>
  );
}

export default Catalogo;
