import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { imageUrl } from '../services/api';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '' });
  const [imagen, setImagen] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [imagenExistente, setImagenExistente] = useState('');
  const [previews, setPreviews] = useState([]);
  const [galeria, setGaleria] = useState([]);
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
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/uploads').then(res => setAllImages(res.data.data || [])).catch(() => {});
    api.get('/categorias').then(res => setCategorias(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/productos/${id}`)
      .then(res => {
        const p = res.data.data;
        setForm({ nombre: p.nombre, descripcion: p.descripcion, precio: p.precio || '' });
        if (p.categoria_id) setCategoriaId(p.categoria_id);
        if (p.disponible !== undefined) setDisponible(p.disponible);
        if (p.oferta !== undefined) setOferta(p.oferta);
        if (p.stock !== undefined) setStock(p.stock);
        if (p.imagen) {
          setImagenExistente(p.imagen);
          setPreviews([imageUrl(p.imagen)]);
        }
        if (p.imagenes?.length) {
          setGaleria(p.imagenes.filter(f => f !== p.imagen));
        }
      })
      .catch(() => navigate('/admin/productos'))
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFile = e => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setImagen(prev => prev || files[0]);
    setImagenExistente('');
    setImagenes(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const openFilePicker = () => fileRef.current?.click();

  const toggleGaleria = filename => {
    setImagen(null);
    setImagenes([]);
    setPreviews([]);
    if (fileRef.current) fileRef.current.value = '';
    setGaleria(prev => {
      const isIn = prev.includes(filename);
      if (isIn) {
        const next = prev.filter(f => f !== filename);
        if (next.length > 0) {
          setImagenExistente(next[0]);
          setPreviews([imageUrl(next[0])]);
        } else {
          setImagenExistente('');
          setPreviews([]);
        }
        return next;
      } else {
        if (prev.length === 0) {
          setImagenExistente(filename);
          setPreviews([imageUrl(filename)]);
        }
        return [...prev, filename];
      }
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
    if (imagenes.length > 0) {
      imagenes.forEach(f => fd.append('imagenes', f));
    } else if (imagenExistente) {
      fd.append('imagen_existente', imagenExistente);
    }
    const todasGaleria = [...galeria];
    if (imagenExistente && !todasGaleria.includes(imagenExistente)) {
      todasGaleria.unshift(imagenExistente);
    }
    if (todasGaleria.length > 0) {
      fd.append('galeria', JSON.stringify(todasGaleria));
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

  const previewUrl = previews.length > 0 ? previews[0] : null;

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
                  Imagen principal
                </label>
                <div
                  className="border rounded d-flex align-items-center justify-content-center flex-column"
                  style={{ width: '100%', aspectRatio: '1', maxWidth: 200, background: '#f8f9fa', cursor: 'pointer' }}
                  onClick={openFilePicker}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                  ) : (
                    <>
                      <i className="bi bi-image" style={{ fontSize: '2rem', color: 'var(--text-secondary)', opacity: 0.4 }}></i>
                      <span className="small mt-1" style={{ color: 'var(--text-secondary)' }}>Sin imagen</span>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFile} style={{ display: 'none' }} />
                <button type="button" className="btn btn-sm btn-outline mt-2 w-100" onClick={openFilePicker}>
                  <i className="bi bi-camera me-1"></i>{previewUrl ? 'Cambiar / agregar imágenes' : 'Subir imágenes'}
                </button>
                <span className="d-block text-center mt-1" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>La primera es la principal</span>
                {previews.length > 1 && (
                  <div className="row g-1 mt-2">
                    {previews.map((p, i) => (
                      <div className="col-4" key={i} style={{ position: 'relative' }}>
                        <img src={p} alt={`Seleccionada ${i + 1}`} className="w-100" style={{ aspectRatio: '1', objectFit: 'cover', borderRadius: 6, border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--border)' }} />
                        {i === 0 && (
                          <span className="position-absolute start-50 translate-middle-x" style={{ bottom: 2, background: 'var(--accent)', color: '#fff', borderRadius: 4, fontSize: 9, fontWeight: 600, padding: '0 5px', lineHeight: '14px', whiteSpace: 'nowrap', zIndex: 1 }}>
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
                        const enGaleria = galeria.includes(name) || imagenExistente === name;
                        const esPrincipal = imagenExistente === name;
                        return (
                          <div className="col-4 col-sm-3 col-md-2" key={name}>
                            <div className={`p-1 border rounded ${esPrincipal ? 'border-primary' : enGaleria ? 'border-success' : ''}`} style={{ cursor: 'pointer', borderWidth: esPrincipal || enGaleria ? 2 : 1, position: 'relative', transition: 'border-color 0.15s' }} onClick={() => toggleGaleria(name)}>
                              {esPrincipal && (
                                <span className="position-absolute start-50 translate-middle-x" style={{ top: -1, background: 'var(--accent)', color: '#fff', borderRadius: 4, fontSize: 9, fontWeight: 600, padding: '0 5px', lineHeight: '16px', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', zIndex: 1 }}>
                                  Principal
                                </span>
                              )}
                              {enGaleria && !esPrincipal && (
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
