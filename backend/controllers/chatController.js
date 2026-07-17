const { pool } = require('../config/db');

async function chat(req, res) {
  try {
    const { message } = req.body;
    const tenantId = req.tenant?.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ ok: false, error: 'Mensaje requerido' });
    }

    // Buscar productos en DB
    const productResult = await pool.query(
      `SELECT p.nombre, p.descripcion, p.precio, p.disponible, c.nombre AS categoria
       FROM productos p
       JOIN categorias c ON c.id = p.categoria_id
       WHERE p.tenant_id = $1
       ORDER BY p.nombre`,
      [tenantId]
    );
    const productos = productResult.rows;

    // Buscar config del negocio
    const configResult = await pool.query(
      'SELECT telefono, direccion, horarios FROM configuracion WHERE tenant_id = $1',
      [tenantId]
    );
    const cfg = configResult.rows[0] || {};

    // Armar contexto
    const productList = productos.length > 0
      ? productos.map(p =>
          `- ${p.nombre} | ${p.categoria} | $${p.precio} | ${p.disponible ? 'DISPONIBLE' : 'SIN STOCK'}${p.descripcion ? ' | ' + p.descripcion : ''}`
        ).join('\n')
      : '(catálogo vacío)';

    const businessInfo = [
      cfg.telefono ? `Teléfono: ${cfg.telefono}` : '',
      cfg.direccion ? `Dirección: ${cfg.direccion}` : '',
      cfg.horarios ? `Horarios: ${cfg.horarios}` : '',
    ].filter(Boolean).join('\n') || '(sin datos del negocio)';

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({ ok: false, error: 'GROQ_API_KEY no configurada' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `Sos un asistente de ventas de un catálogo. Usá esta información para responder:

DATOS DEL NEGOCIO:
${businessInfo}

CATÁLOGO DE PRODUCTOS:
${productList}

Respondé de forma natural y breve. Si no hay un producto que pidan, decilo amablemente.`,
          },
          { role: 'user', content: message },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Groq error:', response.status, text);
      return res.status(502).json({ ok: false, error: 'Error del asistente' });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || 'No pude generar una respuesta.';

    res.json({ ok: true, data: { reply } });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { chat };
