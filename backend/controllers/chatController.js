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

    const ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:1.5b',
        prompt: prompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 150 },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Ollama error:', response.status, text);
      return res.status(502).json({ ok: false, error: 'El asistente no está disponible' });
    }

    const data = await response.json();
    const reply = data?.response?.trim() || 'No pude generar una respuesta.';

    res.json({ ok: true, data: { reply } });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { chat };
