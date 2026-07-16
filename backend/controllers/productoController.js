const { pool } = require('../config/db');

async function getAll(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const categoria = req.query.categoria;
    const search = req.query.search;

    const conditions = [];
    const params = [];
    let idx = 0;

    if (categoria) {
      params.push(categoria);
      conditions.push(`c.slug = $${++idx}`);
    }
    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      conditions.push(`(p.nombre ILIKE $${++idx} OR p.descripcion ILIKE $${++idx} OR c.nombre ILIKE $${++idx})`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM productos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       ${where}`,
      params
    );

    const total = countResult.rows[0].total;
    params.push(limit);
    params.push(offset);

    const result = await pool.query(
      `SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug
       FROM productos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       ${where}
       ORDER BY p.fecha_creacion DESC
       LIMIT $${idx + 1} OFFSET $${idx + 2}`,
      params
    );

    res.json({
      ok: true,
      data: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

async function getById(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [req.params.id]
    );

    const producto = result.rows[0];

    if (!producto) {
      return res.status(404).json({
        ok: false,
        error: 'Producto no encontrado'
      });
    }

    const imagenes = await pool.query(
      'SELECT filename FROM producto_imagenes WHERE producto_id = $1 ORDER BY orden',
      [req.params.id]
    );
    producto.imagenes = imagenes.rows.map(r => r.filename);

    res.json({ ok: true, data: producto });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

async function create(req, res) {
  try {
    const { nombre, descripcion, precio, imagen_existente, galeria, categoria_id } = req.body;

    const imagen = req.file
      ? req.file.filename
      : (imagen_existente || null);

    const catId = categoria_id ? parseInt(categoria_id) : null;

    const result = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, imagen, categoria_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        nombre,
        descripcion || '',
        precio || 0,
        imagen,
        catId
      ]
    );

    const producto = result.rows[0];

    if (galeria) {
      const lista = JSON.parse(galeria);
      for (let i = 0; i < lista.length; i++) {
        await pool.query(
          'INSERT INTO producto_imagenes (producto_id, filename, orden) VALUES ($1, $2, $3)',
          [producto.id, lista[i], i]
        );
      }
    }

    res.status(201).json({
      ok: true,
      data: producto
    });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

async function update(req, res) {
  try {
    const { nombre, descripcion, precio, imagen_existente, galeria, categoria_id } = req.body;

    const existing = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Producto no encontrado'
      });
    }

    const productoActual = existing.rows[0];

    const imagen = req.file
      ? req.file.filename
      : (imagen_existente || productoActual.imagen);

    const catId = categoria_id !== undefined ? (categoria_id ? parseInt(categoria_id) : null) : productoActual.categoria_id;

    const result = await pool.query(
      `UPDATE productos
       SET nombre = $1,
           descripcion = $2,
           precio = $3,
           imagen = $4,
           categoria_id = $5,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        nombre,
        descripcion || '',
        precio || 0,
        imagen,
        catId,
        req.params.id
      ]
    );

    if (galeria) {
      await pool.query('DELETE FROM producto_imagenes WHERE producto_id = $1', [req.params.id]);
      const lista = JSON.parse(galeria);
      for (let i = 0; i < lista.length; i++) {
        await pool.query(
          'INSERT INTO producto_imagenes (producto_id, filename, orden) VALUES ($1, $2, $3)',
          [req.params.id, lista[i], i]
        );
      }
    }

    res.json({
      ok: true,
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

async function remove(req, res) {
  try {
    const existing = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Producto no encontrado'
      });
    }

    await pool.query(
      'DELETE FROM productos WHERE id = $1',
      [req.params.id]
    );

    res.json({
      ok: true,
      data: null
    });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      error: 'No se subió ninguna imagen'
    });
  }

  res.json({
    ok: true,
    data: {
      filename: req.file.filename
    }
  });
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  uploadImage
};
