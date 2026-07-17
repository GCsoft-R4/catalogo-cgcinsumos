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

    const configResult = await pool.query(
      'SELECT telefono, direccion, horarios FROM configuracion WHERE tenant_id = $1',
      [tenantId]
    );
    const cfg = configResult.rows[0] || {};

    const businessContext = [
      cfg.telefono ? `Teléfono: ${cfg.telefono}` : '',
      cfg.direccion ? `Dirección: ${cfg.direccion}` : '',
      cfg.horarios ? `Horarios: ${cfg.horarios}` : '',
    ].filter(Boolean).join('\n');

    const fullContext = [
      'Datos del negocio:',
      businessContext || '(sin datos cargados)',
      '',
      'Catálogo:',
      ...(productos.length > 0
        ? productos.map(p =>
            `- ${p.nombre} (${p.categoria}): $${p.precio} ${p.disponible ? '[DISPONIBLE]' : '[SIN STOCK]'}`
          )
        : ['(vacío)']),
    ].join('\n');

    const prompt = `Sos un asistente de ventas. Respondé SOLO con la información disponible abajo. Si algo no está en los datos, decí "No tengo esa información". Sé breve y amable.

${fullContext}

Usuario: ${message}`;

    const ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'qwen2.5:1.5b',
        prompt: prompt,
        stream: false,
        options: { temperature: 0.2, num_predict: 80 },
      }),
    });
    clearTimeout(timeout);

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
