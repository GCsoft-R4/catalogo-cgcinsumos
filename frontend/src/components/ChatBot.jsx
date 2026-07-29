import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Preguntame sobre nuestros productos.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: userMsg.text });
      const reply = res.data?.data?.reply || 'No entendí.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Hubo un error. Intentá de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="btn rounded-circle shadow d-flex align-items-center justify-content-center position-fixed"
        style={{
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          zIndex: 1100,
          background: 'var(--accent, #0d6efd)',
          color: '#fff',
          border: 'none',
          fontSize: 24,
        }}
        aria-label="Chat"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div
          className="position-fixed shadow rounded-3 d-flex flex-column"
          style={{
            bottom: 92,
            right: 24,
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            height: 480,
            zIndex: 1100,
            background: '#fff',
            border: '1px solid #dee2e6',
          }}
        >
          <div className="p-3 border-bottom fw-semibold" style={{ background: 'var(--accent, #0d6efd)', color: '#fff', borderRadius: '8px 8px 0 0' }}>
            Asistente
          </div>

          <div className="flex-grow-1 p-3 overflow-auto" style={{ background: '#f8f9fa' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 d-flex ${msg.role === 'user' ? 'justify-content-end' : ''}`}>
                <div
                  className="px-3 py-2 rounded-3"
                  style={{
                    maxWidth: '80%',
                    background: msg.role === 'user' ? 'var(--accent, #0d6efd)' : '#e9ecef',
                    color: msg.role === 'user' ? '#fff' : '#212529',
                    fontSize: 14,
                    lineHeight: 1.4,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mb-2 d-flex">
                <div className="px-3 py-2 rounded-3" style={{ background: '#e9ecef', color: '#6c757d', fontSize: 14 }}>
                  Escribiendo...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSend} className="d-flex gap-2 p-3 border-top">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribí tu consulta..."
              className="form-control form-control-sm"
              disabled={loading}
            />
            <button type="submit" className="btn btn-sm btn-primary" disabled={loading || !input.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatBot;
