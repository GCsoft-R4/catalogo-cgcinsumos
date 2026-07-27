import { useState, useEffect } from 'react';
import api, { imageUrl } from '../services/api';

function Configuracion() {
  const [form, setForm] = useState({ nombre_negocio: '', logo: '', telefono: '', direccion: '', horarios: '', marquesina: '', nosotros: '' });
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
        telefono: d.telefono || '',
        direccion: d.direccion || '',
        horarios: d.horarios || '',
        marquesina: d.marquesina || '',
        nosotros: d.nosotros || '',
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
      }
    } catch {
      setMsg('Error al subir logo');
      setMsgType('danger');
    }
    setTimeout(() => setMsg(''), 2500);
    setUploading(false);
    e.target.value = '';
  }

  if (loading) return <p className="text-muted">Cargando...</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h4 className="mb-4">Configuración del negocio</h4>
      <p className="text-muted small mb-4">
        Estos datos se usan en el catálogo público y para el asistente de clientes.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 rounded" style={{ background: '#f8f9fa', border: '1px solid var(--border)' }}>
          <label className="form-label fw-semibold">Logo del negocio</label>
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 80, height: 80, borderRadius: 12, overflow: 'hidden',
                border: '2px dashed var(--border)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, background: '#fff',
              }}
            >
              {form.logo ? (
                <img src={imageUrl(form.logo)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <i className="bi bi-image text-muted" style={{ fontSize: '1.5rem' }}></i>
              )}
            </div>
            <div>
              <label
                className="btn btn-outline btn-sm mb-0"
                style={{ cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.6 : 1 }}
              >
                <i className="bi bi-upload me-1"></i>
                {uploading ? 'Subiendo...' : 'Elegir imagen'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} hidden disabled={uploading} />
              </label>
              <div className="form-text mt-1">JPG, PNG o WebP. Máx 5 MB.</div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Nombre del negocio</label>
          <input
            type="text"
            className="form-control"
            value={form.nombre_negocio}
            onChange={e => setForm({ ...form, nombre_negocio: e.target.value })}
            placeholder="Ej: GCinsumos"
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
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
        {msg && <span className={`text-${msgType} ms-3`}>{msg}</span>}
      </form>
    </div>
  );
}

export default Configuracion;
