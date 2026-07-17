import { useState, useEffect, useRef } from 'react';
import api, { imageUrl } from '../services/api';

function Imagenes() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const fetchImages = () => {
    api.get('/uploads')
      .then(res => setImages(res.data.data || []))
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
        <div className="row g-3">
          {images.map(img => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={img}>
              <img
                src={imageUrl(img)}
                alt={img}
                className="w-100"
                style={{ aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                title={img}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Imagenes;
