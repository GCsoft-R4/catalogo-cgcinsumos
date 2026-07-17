const { pool } = require('../config/db');

async function chat(req, res) {
  try {
    const { message } = req.body;
    const tenantId = req.tenant?.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ ok: false, error: 'Mensaje requerido' });
    }

    const productResult = await pool.query(
      `SELECT p.nombre, p.descripcion, p.precio, p.disponible, c.nombre AS categoria
       FROM productos p
       JOIN categorias c ON c.id = p.categoria_id
       WHERE p.tenant_id = $1
       ORDER BY p.nombre`,
      [tenantId]
    );

    const productos = productResult.rows;

    const catalogContext = productos.length > 0
      ? 'Catálogo actual:\n' + productos.map(p =>
          `- ${p.nombre} (${p.categoria}): $${p.precio} ${p.disponible ? '[DISPONIBLE]' : '[SIN STOCK]'}`
        ).join('\n')
      : 'El catálogo está vacío.';

    const prompt = `Sos un asistente de ventas de un catálogo de productos. Respondé preguntas sobre los productos disponibles, precios, y recomendaciones. Sé breve y amable.

${catalogContext}

Usuario: ${message}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'API key no configurada' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini error:', data);
      return res.status(502).json({ ok: false, error: 'Error del asistente' });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.';

    res.json({ ok: true, data: { reply } });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { chat };
