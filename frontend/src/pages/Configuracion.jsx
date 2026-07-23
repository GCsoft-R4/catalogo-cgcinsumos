import { useState, useEffect } from 'react';
import api from '../services/api';

function Configuracion() {
  const [form, setForm] = useState({ telefono: '', direccion: '', horarios: '', marquesina: '', nosotros: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  useEffect(() => {
    api.get('/config').then(res => {
      const d = res.data?.data;
      if (d) setForm({ telefono: d.telefono || '', direccion: d.direccion || '', horarios: d.horarios || '', marquesina: d.marquesina || '', nosotros: d.nosotros || '' });
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
