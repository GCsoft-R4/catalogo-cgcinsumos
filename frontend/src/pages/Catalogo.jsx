import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import ProductosNuevos from '../components/ProductosNuevos';
import { useFavoritos } from '../context/FavoritosContext';

function Catalogo() {
  useEffect(() => {
    api.post('/visitas', { pagina: window.location.pathname }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuCategoriasOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [searchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const { ids: favoritoIds } = useFavoritos();
  const [verFavoritos, setVerFavoritos] = useState(() => searchParams.get('favoritos') === '1');
  const [menuCategoriasOpen, setMenuCategoriasOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    if (searchParams.get('favoritos') === '1') {
      setVerFavoritos(true);
    }
  }, [searchParams]);

  const fetchProductos = useCallback((cat = categoriaActiva, pg = page, search = searchQuery, sortBy = sort, favs = verFavoritos) => {
    setLoading(true);

    if (favs) {
      api.get('/productos', { params: { page: 1, limit: 500, sort: sortBy } })
        .then(res => {
          const all = res.data.data || [];
          const filtered = all.filter(p => favoritoIds.includes(p.id));
          setProductos(filtered);
          setTotalPages(1);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
      return;
    }

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
  }, [categoriaActiva, page, searchQuery, sort, favoritoIds]);

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProductos(categoriaActiva, page, searchQuery, sort, verFavoritos);
  }, [categoriaActiva, page, searchQuery, sort, verFavoritos, fetchProductos]);

  const cambiarCategoria = slug => {
    setCategoriaActiva(slug);
    setPage(1);
    setSearchInput('');
    setSearchQuery('');
    setVerFavoritos(false);
  };

  const handleSearch = () => {
    setPage(1);
    setSearchQuery(searchInput.trim().toLowerCase());
  };

  const handleSearchKey = e => {
    if (e.key === 'Enter') handleSearch();
  };

  const list = Array.isArray(productos) ? productos : [];

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

        {/* Desktop: sort select + view toggle */}
        <div className="col-auto d-none d-md-flex align-items-center">
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

        {/* Mobile: icon sort + view toggle */}
        <div className="col-auto d-md-none d-flex align-items-center gap-2 mt-2">
          <div className="dropdown" ref={sortMenuRef}>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setSortMenuOpen(prev => !prev)}
              style={{ borderRadius: 8, padding: '6px 10px' }}
              title="Ordenar"
            >
              <i className="bi bi-funnel"></i>
            </button>
            {sortMenuOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 40, zIndex: 20,
                background: '#fff', borderRadius: 8, marginTop: 4, minWidth: 150,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden',
              }}>
                {[
                  { value: 'newest', label: 'Más nuevos', icon: 'bi-clock' },
                  { value: 'nombre_asc', label: 'Alfabético A-Z', icon: 'bi-sort-alpha-down' },
                  { value: 'nombre_desc', label: 'Alfabético Z-A', icon: 'bi-sort-alpha-up' },
                  { value: 'precio_desc', label: 'Mayor precio', icon: 'bi-sort-down' },
                  { value: 'precio_asc', label: 'Menor precio', icon: 'bi-sort-up' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    className={`btn w-100 text-start rounded-0 d-flex align-items-center gap-2 ${sort === opt.value ? 'btn-accent' : 'btn-outline'}`}
                    style={{ borderRadius: 0, fontSize: '0.8rem', padding: '8px 12px' }}
                    onClick={() => { setSort(opt.value); setPage(1); setSortMenuOpen(false); }}
                  >
                    <i className={`bi ${opt.icon}`} style={{ width: 16 }}></i>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
            style={{ borderRadius: 8, padding: '6px 10px' }}
            title={viewMode === 'grid' ? 'Vista lista' : 'Vista cuadrícula'}
          >
            <i className={`bi ${viewMode === 'grid' ? 'bi-list' : 'bi-grid-3x3-gap'}`}></i>
          </button>
        </div>
      </div>

      {Array.isArray(categorias) && categorias.length > 0 && (
        <>
          {/* Desktop: chips */}
          <div className="d-none d-md-flex flex-wrap gap-2 justify-content-center mb-4">
            <button
              className={`btn btn-sm rounded-pill flex-shrink-0 ${!categoriaActiva ? 'btn-accent' : 'btn-outline'}`}
              onClick={() => { setVerFavoritos(false); cambiarCategoria(''); }}
            >
              Todas
            </button>
            {categorias.map(c => (
              <button
                key={c.id}
                className={`btn btn-sm rounded-pill flex-shrink-0 ${categoriaActiva === c.slug ? 'btn-accent' : 'btn-outline'}`}
                onClick={() => cambiarCategoria(c.slug)}
              >
                {c.nombre}
              </button>
            ))}
          </div>

          {/* Mobile: hamburger dropdown */}
          <div className="d-md-none mb-3" ref={menuRef}>
            <div className="dropdown" style={{ position: 'relative' }}>
              <button
                className="btn btn-outline w-100 d-flex align-items-center justify-content-between"
                onClick={() => setMenuCategoriasOpen(prev => !prev)}
                style={{ borderRadius: 10, padding: '10px 14px' }}
              >
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-list"></i>
                  {categoriaActiva
                    ? categorias.find(c => c.slug === categoriaActiva)?.nombre || 'Categorías'
                    : 'Categorías'}
                </span>
                <i className={`bi ${menuCategoriasOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
              </button>
              {menuCategoriasOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                  background: '#fff', borderRadius: 10, marginTop: 4,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden',
                }}>
                  <button
                    className={`btn w-100 text-start rounded-0 ${!categoriaActiva ? 'btn-accent' : 'btn-outline'}`}
                    style={{ borderRadius: 0 }}
                    onClick={() => { setVerFavoritos(false); cambiarCategoria(''); setMenuCategoriasOpen(false); }}
                  >
                    Todas
                  </button>
                  {categorias.map(c => (
                    <button
                      key={c.id}
                      className={`btn w-100 text-start rounded-0 ${categoriaActiva === c.slug ? 'btn-accent' : 'btn-outline'}`}
                      style={{ borderRadius: 0 }}
                      onClick={() => { cambiarCategoria(c.slug); setMenuCategoriasOpen(false); }}
                    >
                      {c.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!searchQuery && !verFavoritos && (
        <ProductosNuevos productos={productos} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '10px 0 24px', padding: '12px 0' }}>
        <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <i className="bi bi-grid-3x3-gap me-2" style={{ fontSize: '0.9rem' }}></i>
          Todos los productos
        </span>
        <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
      </div>

      {list.length === 0 ? (
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
              {list.map(p => (
                <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                  <ProductCard producto={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {list.map(p => (
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
    </>
  );
}

export default Catalogo;
