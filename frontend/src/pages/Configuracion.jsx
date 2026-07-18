import { useState, useEffect } from 'react';
import api from '../services/api';

function Configuracion() {
  const [form, setForm] = useState({ telefono: '', direccion: '', horarios: '', marquesina: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/config').then(res => {
      const d = res.data?.data;
      if (d) setForm({ telefono: d.telefono || '', direccion: d.direccion || '', horarios: d.horarios || '', marquesina: d.marquesina || '' });
    }).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await api.put('/config', form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <p className="text-muted">Cargando...</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h4 className="mb-4">Configuración del negocio</h4>
      <p className="text-muted small mb-4">
        Estos datos los usa el asistente para responder preguntas de los clientes.
      </p>

      <form onSubmit={handleSubmit}>
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
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
        {saved && <span className="text-success ms-3">Guardado</span>}
      </form>
    </div>
  );
}

export default Configuracion;
