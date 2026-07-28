import { useState, useEffect } from 'react';
import api, { imageUrl } from '../services/api';
import { useConfig } from '../context/ConfigContext';

function Configuracion() {
  const { refreshConfig } = useConfig();
  const [form, setForm] = useState({ nombre_negocio: '', logo: '', logo_size: 50, telefono: '', direccion: '', horarios: '', marquesina: '', nosotros: '', facebook_url: '', instagram_url: '', whatsapp_number: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/config').then(res => {
      const d = res.data?.data;
      if (d) setForm({
        nombre_negocio: d.nombre_negocio || '',
        logo: d.logo || '',
        logo_size: d.logo_size || 50,
        telefono: d.telefono || '',
        direccion: d.direccion || '',
        horarios: d.horarios || '',
        marquesina: d.marquesina || '',
        nosotros: d.nosotros || '',
        facebook_url: d.facebook_url || '',
        instagram_url: d.instagram_url || '',
        whatsapp_number: d.whatsapp_number || '',
      });
    }).catch(() => {
      setMsg('Error al cargar la configuración');
      setMsgType('danger');
    }).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.put('/config', form);
      setMsg('Guardado');
      setMsgType('success');
      refreshConfig();
    } catch {
      setMsg('Error al guardar');
      setMsgType('danger');
    }
    setTimeout(() => setMsg(''), 2500);
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await api.post('/config/logo', fd);
      if (res.data.ok) {
        setForm(prev => ({ ...prev, logo: res.data.data.filename }));
        setMsg('Logo actualizado');
        setMsgType('success');
        refreshConfig();
      }
    } catch {
      setMsg('Error al subir logo');
      setMsgType('danger');
    }
    setTimeout(() => setMsg(''), 2500);
    setUploading(false);
    e.target.value = '';
  }

  async function handleDeleteLogo() {
    if (!confirm('¿Eliminar el logo?')) return;
    try {
      await api.delete('/config/logo');
      setForm(prev => ({ ...prev, logo: '' }));
      setMsg('Logo eliminado');
      setMsgType('success');
      refreshConfig();
    } catch {
      setMsg('Error al eliminar logo');
      setMsgType('danger');
    }
    setTimeout(() => setMsg(''), 2500);
  }

  if (loading) return <p className="text-muted">Cargando...</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h4 className="mb-4">Configuración del negocio</h4>
      <p className="text-muted small mb-4">
        Estos datos se usan en el catálogo público y para el asistente de clientes.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <label className="form-label fw-semibold">Logo del negocio</label>
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 80, height: 80, borderRadius: 12, overflow: 'hidden',
                border: '2px dashed var(--border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, background: 'var(--card-bg)',
              }}
            >
              {form.logo ? (
                <img src={imageUrl(form.logo)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <i className="bi bi-image text-muted" style={{ fontSize: '1.5rem' }}></i>
              )}
            </div>
            <div className="flex-grow-1">
              <div className="d-flex gap-2">
              <label
                className="btn btn-outline btn-sm mb-0"
                style={{ cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.6 : 1 }}
              >
                <i className="bi bi-upload me-1"></i>
                {uploading ? 'Subiendo...' : 'Elegir imagen'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} hidden disabled={uploading} />
              </label>
              {form.logo && (
                <button type="button" className="btn btn-outline-danger btn-sm mb-0" onClick={handleDeleteLogo}>
                  <i className="bi bi-trash me-1"></i>Eliminar
                </button>
              )}
              </div>
              <div className="form-text mt-1">JPG, PNG o WebP. Máx 5 MB.</div>
            </div>
          </div>

          {form.logo && (
            <div className="mt-3">
              <label className="form-label small mb-1">
                Tamaño del logo: <span className="fw-bold">{form.logo_size}px</span>
              </label>
              <input
                type="range"
                className="form-range"
                min={20}
                max={120}
                step={2}
                value={form.logo_size}
                onChange={e => setForm({ ...form, logo_size: parseInt(e.target.value) })}
              />
              <div className="d-flex justify-content-between" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <span>Chico</span>
                <span>Grande</span>
              </div>
              <div className="mt-2 p-2 rounded text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                <img src={imageUrl(form.logo)} alt="Preview" style={{ height: form.logo_size, objectFit: 'contain' }} />
              </div>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Nombre del negocio</label>
          <input
            type="text"
            className="form-control"
            value={form.nombre_negocio}
            onChange={e => setForm({ ...form, nombre_negocio: e.target.value })}
            placeholder="Ej: Mi Negocio"
          />
          <div className="form-text">Aparece en el navbar, sidebar y páginas del catálogo.</div>
        </div>

        <hr className="my-4" />

        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            className="form-control"
            value={form.telefono}
            onChange={e => setForm({ ...form, telefono: e.target.value })}
            placeholder="Ej: 11 2345-6789"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Dirección</label>
          <input
            type="text"
            className="form-control"
            value={form.direccion}
            onChange={e => setForm({ ...form, direccion: e.target.value })}
            placeholder="Ej: Av. Siempre Viva 123"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Horarios</label>
          <input
            type="text"
            className="form-control"
            value={form.horarios}
            onChange={e => setForm({ ...form, horarios: e.target.value })}
            placeholder="Ej: Lun a Vie 9-18, Sáb 9-13"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Texto de la marquesina</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.marquesina}
            onChange={e => setForm({ ...form, marquesina: e.target.value })}
            placeholder="Ej: Envíos a toda la ciudad · Consultanos por WhatsApp · Los mejores precios"
          />
          <div className="form-text">Separá los mensajes con "·". Se mostrará como texto deslizante en el catálogo público.</div>
        </div>
        <div className="mb-3">
          <label className="form-label">Página Nosotros</label>
          <textarea
            className="form-control"
            rows={6}
            value={form.nosotros}
            onChange={e => setForm({ ...form, nosotros: e.target.value })}
            placeholder="Contá sobre tu negocio: quiénes son, qué hacen, hace cuánto trabajan, etc."
          />
          <div className="form-text">Se muestra en la página pública "Nosotros" del catálogo.</div>
        </div>

        <hr className="my-4" />
        <h6 className="fw-bold mb-3">Redes sociales</h6>

        <div className="mb-3">
          <label className="form-label">Facebook URL</label>
          <input
            type="url"
            className="form-control"
            value={form.facebook_url}
            onChange={e => setForm({ ...form, facebook_url: e.target.value })}
            placeholder="https://facebook.com/tupagina"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Instagram URL</label>
          <input
            type="url"
            className="form-control"
            value={form.instagram_url}
            onChange={e => setForm({ ...form, instagram_url: e.target.value })}
            placeholder="https://instagram.com/tuusuario"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">WhatsApp (número completo, ej: 5493586546525)</label>
          <input
            type="text"
            className="form-control"
            value={form.whatsapp_number}
            onChange={e => setForm({ ...form, whatsapp_number: e.target.value })}
            placeholder="5493586546525"
          />
          <div className="form-text">Sin + ni espacios. Se usa en los botones de WhatsApp del catálogo.</div>
        </div>

        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
        {msg && <span className={`text-${msgType} ms-3`}>{msg}</span>}
      </form>
    </div>
  );
}

export default Configuracion;
