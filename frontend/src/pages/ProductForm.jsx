import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { imageUrl } from '../services/api';

let imgSeq = 0;
const uid = () => `img-${++imgSeq}`;

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [allImages, setAllImages] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [oferta, setOferta] = useState(false);
  const [stock, setStock] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [colores, setColores] = useState([]);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/uploads').then(res => setAllImages(res.data.data || [])).catch(() => {});
    api.get('/categorias').then(res => setCategorias(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/productos/${id}?todas=1`)
      .then(res => {
        const p = res.data.data;
        setForm({ nombre: p.nombre, descripcion: p.descripcion, precio: p.precio || '' });
        if (p.categoria_id) setCategoriaId(p.categoria_id);
        if (p.disponible !== undefined) setDisponible(p.disponible);
        if (p.oferta !== undefined) setOferta(p.oferta);
        if (p.stock !== undefined) setStock(p.stock);
        const list = [];
        if (p.imagen) list.push({ id: uid(), kind: 'existing', name: p.imagen, url: imageUrl(p.imagen) });
        (p.imagenes || []).forEach(f => {
          if (f && f !== p.imagen && !list.some(i => i.name === f)) {
            list.push({ id: uid(), kind: 'existing', name: f, url: imageUrl(f) });
          }
        });
        setItems(list);
        if (p.colores) setColores(p.colores);
      })
      .catch(() => navigate('/admin/productos'))
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFile = e => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const nuevos = files.map(f => ({ id: uid(), kind: 'new', file: f, name: f.name, url: URL.createObjectURL(f) }));
    setItems(prev => [...prev, ...nuevos]);
  };

  const openFilePicker = () => fileRef.current?.click();

  const removeItem = id => {
    setItems(prev => {
      const target = prev.find(i => i.id === id);
      if (target?.kind === 'new' && target.url?.startsWith('blob:')) URL.revokeObjectURL(target.url);
      return prev.filter(i => i.id !== id);
    });
  };

  const setMain = id => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  };

  const togglePoolImage = name => {
    setItems(prev => {
      const inList = prev.some(i => i.kind === 'existing' && i.name === name);
      if (inList) return prev.filter(i => !(i.kind === 'existing' && i.name === name));
      return [...prev, { id: uid(), kind: 'existing', name, url: imageUrl(name) }];
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append('nombre', form.nombre);
    fd.append('descripcion', form.descripcion);
    fd.append('precio', form.precio);
    fd.append('disponible', disponible ? '1' : '0');
    fd.append('oferta', oferta ? '1' : '0');
    fd.append('stock', stock);
    if (categoriaId) fd.append('categoria_id', categoriaId);

    const mainItem = items[0];
    const newFiles = items.filter(i => i.kind === 'new').map(i => i.file);
    const existingNames = items.filter(i => i.kind === 'existing').map(i => i.name);
    newFiles.forEach(f => fd.append('imagenes', f));
    if (mainItem?.kind === 'existing') fd.append('imagen_principal', mainItem.name);
    fd.append('imagen_existente', mainItem?.kind === 'existing' ? mainItem.name : '');
    fd.append('galeria', JSON.stringify(existingNames));
    if (colores.length > 0) {
      fd.append('colores', JSON.stringify(colores));
    }

    try {
      setError('');
      if (isEdit) {
        await api.put(`/productos/${id}`, fd);
      } else {
        await api.post('/productos', fd);
      }
      navigate('/admin/productos');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error al guardar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const agregarColor = () => {
    setColores(prev => [...prev, { nombre: '', hex: '#000000', imagen: '', disponible: true }]);
  };

  const actualizarColor = (idx, campo, valor) => {
    setColores(prev => prev.map((c, i) => i === idx ? { ...c, [campo]: valor } : c));
  };

  const eliminarColor = idx => {
    setColores(prev => prev.filter((_, i) => i !== idx));
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-secondary" role="status" />
      </div>
    );
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 800 }}>
      <h2 className="page-title mb-4">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h2>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <form onSubmit={handleSubmit}>

        <div className="card mb-4" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div className="card-body">
            <h5 className="card-title mb-3" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <i className="bi bi-info-circle me-2"></i>Información básica
            </h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label d-block" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Fotos del producto
                </label>
                <div
                  className="border rounded d-flex align-items-center justify-content-center flex-column"
                  style={{ width: '100%', aspectRatio: '1', maxWidth: 200, background: '#f8f9fa', cursor: 'pointer', position: 'relative' }}
                  onClick={openFilePicker}
                  title="Subir imágenes"
                >
                  {items[0] ? (
                    <img src={items[0].url} alt="Principal" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                  ) : (
                    <>
                      <i className="bi bi-image" style={{ fontSize: '2rem', color: 'var(--text-secondary)', opacity: 0.4 }}></i>
                      <span className="small mt-1" style={{ color: 'var(--text-secondary)' }}>Sin imagen</span>
                    </>
                  )}
                  {items[0] && (
                    <span className="badge position-absolute" style={{ bottom: 6, left: 6, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 600, zIndex: 1 }}>
                      Principal
                    </span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFile} style={{ display: 'none' }} />
                <button type="button" className="btn btn-sm btn-outline mt-2 w-100" onClick={openFilePicker}>
                  <i className="bi bi-camera me-1"></i>{items.length ? 'Agregar más imágenes' : 'Subir imágenes'}
                </button>
                <span className="d-block text-center mt-1" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  Clickeá una foto para hacerla principal · X para borrarla (se elimina al guardar)
                </span>
                {items.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {items.map((it, i) => (
                      <div key={it.id} className="position-relative" style={{ width: 56, cursor: 'pointer' }} onClick={() => setMain(it.id)} title="Hacer principal">
                        <img
                          src={it.url}
                          alt={`Foto ${i + 1}`}
                          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--border)' }}
                        />
                        <button
                          type="button"
                          className="btn border-0 p-0 position-absolute"
                          style={{ top: -6, right: -6, width: 18, height: 18, fontSize: 11, lineHeight: '18px', borderRadius: '50%', background: '#dc3545', color: '#fff', zIndex: 2 }}
                          onClick={ev => { ev.stopPropagation(); removeItem(it.id); }}
                          title="Borrar foto"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                        {i === 0 && (
                          <span className="position-absolute start-50 translate-middle-x" style={{ bottom: 2, background: 'var(--accent)', color: '#fff', borderRadius: 4, fontSize: 8, fontWeight: 600, padding: '0 4px', lineHeight: '13px', whiteSpace: 'nowrap', zIndex: 1 }}>
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-md-8">
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Nombre</label>
                  <input type="text" id="nombre" name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
                </div>
                {categorias.length > 0 && (
                  <div className="mb-2">
                    <label htmlFor="categoria" className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Categoría</label>
                    <select id="categoria" className="form-select" value={categoriaId} onChange={e => setCategoriaId(e.target.value)}>
                      <option value="">Sin categoría</option>
                      {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div className="card-body">
            <h5 className="card-title mb-3" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <i className="bi bi-tags me-2"></i>Precio y stock
            </h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <label htmlFor="precio" className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Precio</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input type="number" id="precio" name="precio" className="form-control" step="0.01" min="0.01" value={form.precio} onChange={handleChange} placeholder="0.00" required />
                </div>
              </div>
              <div className="col-sm-6">
                <label htmlFor="stock" className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Stock</label>
                <input type="number" id="stock" className="form-control" value={stock} onChange={e => setStock(Math.max(0, parseInt(e.target.value) || 0))} min="0" />
              </div>
            </div>
            <div className="d-flex align-items-center gap-4 mt-3">
              <div className="form-check form-switch mb-0">
                <input type="checkbox" id="disponible" className="form-check-input" role="switch" checked={disponible} onChange={e => setDisponible(e.target.checked)} style={{ width: 40, height: 20, cursor: 'pointer' }} />
                <label htmlFor="disponible" className="form-check-label ms-2" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                  {disponible ? 'Disponible' : 'Sin stock'}
                </label>
              </div>
              <div className="form-check form-switch mb-0">
                <input type="checkbox" id="oferta" className="form-check-input" role="switch" checked={oferta} onChange={e => setOferta(e.target.checked)} style={{ width: 40, height: 20, cursor: 'pointer' }} />
                <label htmlFor="oferta" className="form-check-label ms-2" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                  {oferta ? 'En oferta' : 'Sin oferta'}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div className="card-body">
            <h5 className="card-title mb-3" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <i className="bi bi-text-paragraph me-2"></i>Descripción
            </h5>
            <textarea id="descripcion" name="descripcion" className="form-control" rows={5} maxLength={500} value={form.descripcion} onChange={handleChange} placeholder='Usá "- " al inicio de cada línea para crear viñetas. Ej:&#10;- Característica 1&#10;- Característica 2&#10;- Característica 3' />
            <div className="text-end small mt-1" style={{ color: form.descripcion.length > 450 ? '#dc2626' : 'var(--text-secondary)' }}>
              {form.descripcion.length}/500
            </div>
          </div>
        </div>

        <div className="card mb-4" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div className="card-body">
            <div className="d-flex align-items-center gap-2 mb-0" style={{ cursor: 'pointer' }} onClick={() => setShowGallery(p => !p)}>
              <h5 className="card-title mb-0" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <i className="bi bi-images me-2"></i>Imágenes adicionales
              </h5>
              <i className={`bi bi-chevron-${showGallery ? 'down' : 'right'}`} style={{ fontSize: 12, color: 'var(--text-secondary)' }}></i>
              <span className="badge bg-secondary bg-opacity-10 text-secondary ms-auto" style={{ fontSize: 11, fontWeight: 500 }}>{allImages.length}</span>
            </div>
            {showGallery && (() => {
              const now = new Date();
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              const fmtDay = d => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' });
              const groups = {};
              const order = [];
              allImages.forEach(img => {
                const ts = img.mtime || 0;
                const d = new Date(ts);
                const dayStr = d.toDateString();
                const key = dayStr === now.toDateString() ? '__hoy__'
                  : dayStr === yesterday.toDateString() ? '__ayer__'
                  : fmtDay(d);
                if (!groups[key]) { groups[key] = []; order.push(key); }
                groups[key].push(img);
              });
              const labelFor = key =>
                key === '__hoy__' ? 'Agregadas hoy' : key === '__ayer__' ? 'Agregadas ayer' : `Agregadas el ${key}`;
              const toggleGroup = key => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
              return order.map(key => groups[key].length > 0 && (
                <div key={key} className="mb-2">
                  <button type="button" className="d-flex align-items-center gap-2 w-100 border-0 bg-transparent p-2 text-start" style={{ borderRadius: 8, background: 'rgba(128,128,128,0.06)' }} onClick={() => toggleGroup(key)}>
                    <i className={`bi bi-chevron-${expandedGroups[key] ? 'down' : 'right'}`} style={{ fontSize: 12, color: 'var(--text-secondary)', transition: 'transform 0.2s' }}></i>
                    <span className="fw-semibold" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{labelFor(key)}</span>
                    <span className="ms-auto badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: 11, fontWeight: 500 }}>{groups[key].length}</span>
                  </button>
                  {expandedGroups[key] && (
                    <div className="row g-2 mt-1 px-2" style={{ animation: 'fadeIn 0.2s ease' }}>
                      {groups[key].map(img => {
                        const name = typeof img === 'string' ? img : img.name;
                        const esPrincipal = items[0]?.kind === 'existing' && items[0].name === name;
                        const enProducto = items.some(i => i.kind === 'existing' && i.name === name);
                        return (
                          <div className="col-4 col-sm-3 col-md-2" key={name}>
                            <div className={`p-1 border rounded ${esPrincipal ? 'border-primary' : enProducto ? 'border-success' : ''}`} style={{ cursor: 'pointer', borderWidth: esPrincipal || enProducto ? 2 : 1, position: 'relative', transition: 'border-color 0.15s' }} onClick={() => togglePoolImage(name)}>
                              {esPrincipal && (
                                <span className="position-absolute start-50 translate-middle-x" style={{ top: -1, background: 'var(--accent)', color: '#fff', borderRadius: 4, fontSize: 9, fontWeight: 600, padding: '0 5px', lineHeight: '16px', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', zIndex: 1 }}>
                                  Principal
                                </span>
                              )}
                              {enProducto && !esPrincipal && (
                                <span className="position-absolute top-0 end-0" style={{ background: '#198754', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, lineHeight: '18px', textAlign: 'center', margin: 2 }}>
                                  <i className="bi bi-check"></i>
                                </span>
                              )}
                              <img src={imageUrl(name)} alt={name} className="w-100" style={{ aspectRatio: '1', objectFit: 'cover', borderRadius: 4 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="card mb-4" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="card-title mb-0" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <i className="bi bi-palette me-2"></i>Colores
              </h5>
              <button type="button" className="btn btn-sm btn-outline" onClick={agregarColor}>
                <i className="bi bi-plus-lg me-1"></i>Agregar color
              </button>
            </div>
            {colores.length === 0 && (
              <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>Sin colores cargados. Agregá un color para mostrarlo en el detalle del producto.</p>
            )}
            {colores.map((c, idx) => (
              <div key={idx} className="border rounded p-2 mb-2" style={{ background: '#fafafa' }}>
                <div className="row g-2 align-items-center">
                  <div className="col-2 col-sm-1" style={{ maxWidth: 52 }}>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      style={{ width: 40, height: 40, cursor: 'pointer' }}
                      value={/^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : '#000000'}
                      onChange={e => actualizarColor(idx, 'hex', e.target.value)}
                      title="Color"
                    />
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Nombre del color (ej: Rojo, Negro)"
                      value={c.nombre}
                      onChange={e => actualizarColor(idx, 'nombre', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={c.imagen || ''}
                      onChange={e => actualizarColor(idx, 'imagen', e.target.value)}
                    >
                      <option value="">Usar imagen principal</option>
                      {allImages.map(img => (
                        <option key={img.name} value={img.name}>{img.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-auto d-flex align-items-center gap-2">
                    <div className="form-check form-switch mb-0">
                      <input
                        type="checkbox"
                        id={`color-disponible-${idx}`}
                        className="form-check-input"
                        role="switch"
                        checked={c.disponible !== false}
                        onChange={e => actualizarColor(idx, 'disponible', e.target.checked)}
                      />
                      <label htmlFor={`color-disponible-${idx}`} className="form-check-label ms-1" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                        {c.disponible !== false ? 'Visible' : 'Sin stock'}
                      </label>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-danger" style={{ padding: '0.2rem 0.5rem' }} onClick={() => eliminarColor(idx)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="row g-2 mt-1 align-items-center">
                  <div className="col-4 col-sm-2">
                    <div
                      className="border rounded"
                      style={{ width: '100%', aspectRatio: '1', background: /^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : '#000000' }}
                    />
                  </div>
                  <div className="col">
                    <span className="small" style={{ color: 'var(--text-secondary)' }}>
                      {c.hex} · {c.imagen ? `Imagen propia: ${c.imagen}` : 'Usa la imagen principal'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card mb-4 sticky-bottom" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
          <div className="card-body d-flex align-items-center justify-content-between py-3">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/productos')}>
              <i className="bi bi-x-lg me-1"></i>Cancelar
            </button>
            <button type="submit" className="btn btn-accent px-4" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-1" />Guardando...</> : <><i className="bi bi-check-lg me-1"></i>{isEdit ? 'Guardar cambios' : 'Crear producto'}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
