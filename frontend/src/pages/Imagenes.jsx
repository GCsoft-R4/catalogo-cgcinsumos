import { useState, useEffect, useRef } from 'react';
import api, { imageUrl } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

function Imagenes() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteWarn, setDeleteWarn] = useState(null);

  const fetchImages = () => {
    api.get('/uploads')
      .then(res => {
        const data = res.data.data || [];
        setImages(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async e => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('imagenes', f));

    try {
      await api.post('/upload/multiple', fd);
      fetchImages();
    } catch (err) {
      console.error('Error al subir:', err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const tryDelete = async filename => {
    const res = await api.delete(`/uploads/${filename}`);
    const data = res.data;

    if (!data.ok && data.usedBy) {
      setDeleteTarget(null);
      setDeleteWarn({ filename, productos: data.usedBy });
      return;
    }

    setDeleteTarget(null);
    fetchImages();
  };

  const forceDelete = async () => {
    if (!deleteWarn) return;
    try {
      await api.delete(`/uploads/${deleteWarn.filename}?force=true`);
      setDeleteWarn(null);
      fetchImages();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  if (loading) {
    return (
      <div className="row g-3" style={{ opacity: 0.6 }}>
        {[1,2,3,4,5,6].map(i => (
          <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={i}>
            <div className="skeleton skeleton-thumb" style={{ borderRadius: 8 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn p-0 border-0 fs-4 lh-1" onClick={() => window.history.back()} style={{ color: 'var(--text)' }}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h2 className="page-title mb-0">Imágenes</h2>
        </div>
        <label className="btn btn-accent" style={{ cursor: 'pointer' }}>
          {uploading ? 'Subiendo...' : 'Subir imágenes'}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            hidden
          />
        </label>
      </div>

      {images.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-image"></i>
          <h5>No hay imágenes</h5>
          <p className="text-muted">Subí imágenes para usar en los productos.</p>
        </div>
      ) : (
        (() => {
          const now = new Date();
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);

          const fmtDay = d =>
            d.toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' });

          const groups = {};
          const order = [];

          images.forEach(img => {
            const d = new Date(img.mtime);
            const dayStr = d.toDateString();
            const key = dayStr === now.toDateString() ? '__hoy__'
              : dayStr === yesterday.toDateString() ? '__ayer__'
              : fmtDay(d);

            if (!groups[key]) {
              groups[key] = [];
              order.push(key);
            }
            groups[key].push(img);
          });

          const labelFor = (key) =>
            key === '__hoy__' ? 'Hoy'
            : key === '__ayer__' ? 'Ayer'
            : key;

          return order.map(key =>
            groups[key].length > 0 && (
              <div key={key} className="mb-4">
                <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">{labelFor(key)} — {groups[key].length}</h6>
                <div className="row g-3">
                  {groups[key].map(img => {
                    return (
                    <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={img.name} style={{ position: 'relative' }}>
                      <img
                        src={imageUrl(img.name)}
                        alt={img.name}
                        className="w-100"
                        style={{ aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                      />
                      {img.used && (
                        <span className="position-absolute top-0 start-0 m-1 badge bg-primary" style={{ fontSize: '0.6rem' }}>
                          En uso
                        </span>
                      )}
                      <button
                        className="btn btn-sm position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center"
                        style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', padding: 0 }}
                        onClick={() => tryDelete(img.name)}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            )
          );
        })()
      )}

      <ConfirmModal
        show={!!deleteTarget}
        title="Eliminar imagen"
        message="¿Seguro que querés eliminar esta imagen? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => tryDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        show={!!deleteWarn}
        title="Imagen en uso"
        message={
          <>
            <p>Esta imagen está siendo usada en los siguientes productos:</p>
            <ul>
              {deleteWarn?.productos?.map(p => (
                <li key={p.id}>{p.nombre}</li>
              ))}
            </ul>
            <p className="mb-0 text-danger fw-semibold">Si la eliminás, se va a borrar de esos productos. ¿Eliminar igual?</p>
          </>
        }
        confirmLabel="Eliminar igual"
        onConfirm={forceDelete}
        onCancel={() => setDeleteWarn(null)}
      />
    </div>
  );
}

export default Imagenes;
