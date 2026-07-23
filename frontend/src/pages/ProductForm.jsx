import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { imageUrl } from '../services/api';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '' });
  const [imagen, setImagen] = useState(null);
  const [imagenExistente, setImagenExistente] = useState('');
  const [preview, setPreview] = useState('');
  const [galeria, setGaleria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [allImages, setAllImages] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
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
        if (p.imagen) {
          setImagenExistente(p.imagen);
          setPreview(imageUrl(p.imagen));
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
    const file = e.target.files[0];
    if (!file) return;
    setImagen(file);
    setImagenExistente('');
    setPreview(URL.createObjectURL(file));
  };

  const toggleGaleria = filename => {
    setImagen(null);
    if (fileRef.current) fileRef.current.value = '';
    setGaleria(prev => {
      const isIn = prev.includes(filename);
      if (isIn) {
        const next = prev.filter(f => f !== filename);
        if (next.length > 0) {
          setImagenExistente(next[0]);
          setPreview(imageUrl(next[0]));
        } else {
          setImagenExistente('');
          setPreview('');
        }
        return next;
      } else {
        if (prev.length === 0) {
          setImagenExistente(filename);
          setPreview(imageUrl(filename));
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
    if (categoriaId) fd.append('categoria_id', categoriaId);
    if (imagen) {
      fd.append('imagen', imagen);
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

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-secondary" role="status" />
      </div>
    );
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 700 }}>
      <h2 className="page-title mb-4">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h2>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input type="text" id="nombre" name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="descripcion" className="form-label">Descripción</label>
          <textarea id="descripcion" name="descripcion" className="form-control" rows={4} maxLength={500} value={form.descripcion} onChange={handleChange} />
          <div className="text-end small mt-1" style={{ color: form.descripcion.length > 450 ? '#dc2626' : 'var(--text-secondary)' }}>
            {form.descripcion.length}/500
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="precio" className="form-label">Precio</label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input type="number" id="precio" name="precio" className="form-control" step="0.01" min="0.01" value={form.precio} onChange={handleChange} placeholder="0.00" required />
          </div>
        </div>
        {categorias.length > 0 && (
          <div className="mb-3">
            <label htmlFor="categoria" className="form-label">Categoría</label>
            <select id="categoria" className="form-select" value={categoriaId} onChange={e => setCategoriaId(e.target.value)}>
              <option value="">Sin categoría</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-3 d-flex align-items-center gap-3">
          <div className="form-check form-switch mb-0">
            <input
              type="checkbox"
              id="disponible"
              className="form-check-input"
              role="switch"
              checked={disponible}
              onChange={e => setDisponible(e.target.checked)}
              style={{ width: 40, height: 20, cursor: 'pointer' }}
            />
            <label htmlFor="disponible" className="form-check-label ms-2" style={{ cursor: 'pointer' }}>
              {disponible ? 'Disponible' : 'Sin stock'}
            </label>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="imagen" className="form-label">Subir imagen nueva</label>
          <input ref={fileRef} type="file" id="imagen" className="form-control" accept="image/jpeg,image/png,image/webp" onChange={handleFile} />
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" className="w-100" style={{ maxWidth: 200, borderRadius: 8, maxHeight: 150, objectFit: 'contain' }} />
            </div>
          )}
        </div>
        {allImages.length > 0 && (
          <div className="mb-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <label className="form-label mb-0" style={{ cursor: 'pointer' }} onClick={() => setShowGallery(p => !p)}>
                <i className={`bi bi-chevron-${showGallery ? 'down' : 'right'} me-1`}></i>
                Imágenes ({allImages.length})
              </label>
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
                key === '__hoy__' ? 'Hoy' : key === '__ayer__' ? 'Ayer' : key;
              return order.map(key => groups[key].length > 0 && (
                <div key={key} className="mb-3">
                  <small className="text-muted fw-semibold d-block mb-2">{labelFor(key)} — {groups[key].length}</small>
                  <div className="row g-2">
                    {groups[key].map(img => {
                      const name = typeof img === 'string' ? img : img.name;
                      const enGaleria = galeria.includes(name) || imagenExistente === name;
                      const esPrincipal = imagenExistente === name;
                      return (
                        <div className="col-4 col-sm-3 col-md-2" key={name}>
                          <div
                            className={`p-1 border rounded ${esPrincipal ? 'border-primary' : enGaleria ? 'border-success' : ''}`}
                            style={{
                              cursor: 'pointer',
                              borderWidth: esPrincipal || enGaleria ? 2 : 1,
                              position: 'relative',
                            }}
                            onClick={() => toggleGaleria(name)}
                          >
                            {esPrincipal && (
                              <span
                                className="position-absolute start-50 translate-middle-x"
                                style={{
                                  top: -1,
                                  background: 'var(--accent)',
                                  color: '#fff',
                                  borderRadius: 4,
                                  fontSize: 9,
                                  fontWeight: 600,
                                  padding: '0 5px',
                                  lineHeight: '16px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  whiteSpace: 'nowrap',
                                  zIndex: 1,
                                }}
                              >
                                Principal
                              </span>
                            )}
                            {enGaleria && !esPrincipal && (
                              <span
                                className="position-absolute top-0 end-0"
                                style={{
                                  background: '#198754',
                                  color: '#fff',
                                  borderRadius: '50%',
                                  width: 18,
                                  height: 18,
                                  fontSize: 11,
                                  lineHeight: '18px',
                                  textAlign: 'center',
                                  margin: 2,
                                }}
                              >
                                <i className="bi bi-check"></i>
                              </span>
                            )}
                            <img
                              src={imageUrl(name)}
                              alt={name}
                              className="w-100"
                              style={{ aspectRatio: '1', objectFit: 'cover', borderRadius: 4 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-accent" disabled={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear producto'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/productos')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
