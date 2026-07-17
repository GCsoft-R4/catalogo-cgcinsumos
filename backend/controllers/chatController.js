const { pool } = require('../config/db');

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

    // Buscar productos por palabras clave
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
      const productos = result.rows;

      if (productos.length > 0) {
        const reply = productos.map(p => {
          let line = `*${p.nombre}* — $${p.precio} (${p.categoria}) ${p.disponible ? '✅' : '❌ Sin stock'}`;
          if (p.descripcion) line += `\n   ${p.descripcion}`;
          return line;
        }).join('\n\n');
        return res.json({ ok: true, data: { reply } });
      }

      return res.json({ ok: true, data: { reply: 'No tenemos ese producto.' } });
    }

    // Sin palabras clave — responder saludo simple
    res.json({ ok: true, data: { reply: '¡Hola! Preguntame por nuestros productos o por datos del negocio.' } });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
}

module.exports = { chat };
