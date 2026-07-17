const { pool } = require('../config/db');

// Palabras a ignorar al buscar productos
const STOP_WORDS = new Set([
  'hola', 'buen', 'buena', 'buenas', 'buenos', 'como', 'que', 'cual',
  'cuales', 'quien', 'quienes', 'donde', 'cuando', 'por', 'para',
  'con', 'sin', 'los', 'las', 'el', 'la', 'un', 'una', 'del', 'al',
  'tienen', 'tiene', 'hay', 'saber', 'puedo', 'quiero', 'quiere',
  'me', 'te', 'se', 'le', 'les', 'su', 'sus', 'tu', 'mi',
  'esta', 'este', 'esto', 'ese', 'esa', 'esos', 'esas',
  'gracias', 'porfa', 'por favor', 'ayuda', 'consultar',
  'precio', 'precios', 'producto', 'productos', 'info', 'informacion',
  'digame', 'decime', 'contame', 'consulta', 'consulto',
]);

function extractKeywords(message) {
  return message
    .toLowerCase()
    .replace(/[¿?!¡.,;:()]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

async function chat(req, res) {
  try {
    const { message } = req.body;
    const tenantId = req.tenant?.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ ok: false, error: 'Mensaje requerido' });
    }

    const keywords = extractKeywords(message);

    // Buscar productos que coincidan con las palabras clave
    let productos = [];
    if (keywords.length > 0) {
      const conditions = keywords.map((_, i) =>
        `(p.nombre ILIKE $${i + 2} OR p.descripcion ILIKE $${i + 2})`
      );
      const params = [tenantId, ...keywords.map(k => `%${k}%`)];
      const result = await pool.query(
        `SELECT p.nombre, p.descripcion, p.precio, p.disponible, c.nombre AS categoria
         FROM productos p
         JOIN categorias c ON c.id = p.categoria_id
         WHERE p.tenant_id = $1 AND (${conditions.join(' OR ')})
         ORDER BY p.nombre`,
        params
      );
      productos = result.rows;
    }

    // Si hay productos coincidentes, responder directamente
    if (productos.length > 0) {
      const reply = productos.map(p =>
        `*${p.nombre}* — $${p.precio} (${p.categoria}) ${p.disponible ? '✅' : '❌ Sin stock'}`
      ).join('\n');
      return res.json({ ok: true, data: { reply } });
    }

    // Si no hay productos, consultar datos del negocio con la IA
    const configResult = await pool.query(
      'SELECT telefono, direccion, horarios FROM configuracion WHERE tenant_id = $1',
      [tenantId]
    );
    const cfg = configResult.rows[0] || {};
    const businessInfo = [
      cfg.telefono ? `Teléfono: ${cfg.telefono}` : '',
      cfg.direccion ? `Dirección: ${cfg.direccion}` : '',
      cfg.horarios ? `Horarios: ${cfg.horarios}` : '',
    ].filter(Boolean).join('\n') || '(sin datos del negocio cargados)';

    const prompt = `Datos del negocio:
${businessInfo}

Respondé SOLO con la información de arriba. Si te preguntan por productos y no hay coincidencias, decí "No tenemos ese producto". Sé breve.

Usuario: ${message}`;

    const ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'tinyllama',
        prompt: prompt,
        stream: false,
        options: { temperature: 0.1, num_predict: 80 },
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
