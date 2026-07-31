const { pool } = require('../config/db');

async function getAll(req, res) {
  try {
    const tenantId = req.tenant?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const categoria = req.query.categoria;
    const search = req.query.search;
    const nuevos = req.query.nuevos === 'true';
    const sinPaginacion = nuevos;

    const conditions = ['p.tenant_id = $1'];
    const params = [tenantId];
    let idx = 1;

    if (nuevos) {
      conditions.push(`(p.oferta = true OR p.fecha_creacion >= NOW() - INTERVAL '3 days')`);
    }

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

    const where = `WHERE ${conditions.join(' AND ')}`;

    const sortOptions = {
      nombre_asc: 'p.nombre ASC',
      nombre_desc: 'p.nombre DESC',
      precio_asc: 'p.precio ASC',
      precio_desc: 'p.precio DESC',
      stock_asc: 'p.stock ASC',
      stock_desc: 'p.stock DESC',
      newest: 'p.fecha_creacion DESC'
    };
    const orderBy = sortOptions[req.query.sort] || 'p.fecha_creacion DESC';

    if (req.query.stock === 'bajo') {
      conditions.push('(p.stock > 0 AND p.stock <= 2)');
    } else if (req.query.stock === 'sin_stock') {
      conditions.push('(p.stock <= 0 OR p.disponible = false)');
    }

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM productos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       ${where}`,
      params
    );

    const total = countResult.rows[0].total;

    let queryStr;
    if (sinPaginacion) {
      queryStr = `SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug
       FROM productos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       ${where}
       ORDER BY ${orderBy}`;
    } else {
      params.push(limit);
      params.push(offset);
      queryStr = `SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug
       FROM productos p
       LEFT JOIN categorias c ON c.id = p.categoria_id
       ${where}
       ORDER BY ${orderBy}
       LIMIT $${idx + 1} OFFSET $${idx + 2}`;
    }

    const result = await pool.query(queryStr, params);

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
    const tenantId = req.tenant?.id;
    const result = await pool.query(
      'SELECT * FROM productos WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
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

    const todas = req.query.todas === '1';
    const colores = await pool.query(
      `SELECT id, nombre, hex, imagen, disponible
       FROM producto_colores
       WHERE producto_id = $1${todas ? '' : ' AND disponible = true'}
       ORDER BY orden, id`,
      [req.params.id]
    );
    producto.colores = colores.rows;

    res.json({ ok: true, data: producto });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

async function create(req, res) {
  try {
    const tenantId = req.user?.tenant_id || req.tenant?.id;
    const { nombre, descripcion, precio, imagen_existente, galeria, categoria_id, disponible, oferta, stock, colores } = req.body;

    let imagen = null;
    let files = [];
    if (req.files && req.files.length > 0) {
      imagen = req.files[0].filename;
      files = req.files.slice(1).map(f => f.filename);
    } else if (imagen_existente) {
      imagen = imagen_existente;
    }

    const catId = categoria_id ? parseInt(categoria_id) : null;
    const disp = disponible !== undefined ? (disponible === '1' || disponible === true) : true;
    const ofert = oferta !== undefined ? (oferta === '1' || oferta === true) : false;
    const stk = stock !== undefined ? parseInt(stock) : 0;

    const result = await pool.query(
      `INSERT INTO productos (tenant_id, nombre, descripcion, precio, imagen, categoria_id, disponible, oferta, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        tenantId,
        nombre,
        descripcion || '',
        precio || 0,
        imagen,
        catId,
        disp,
        ofert,
        stk
      ]
    );

    const producto = result.rows[0];

    const todasLasImagenes = [];
    if (galeria) {
      const lista = JSON.parse(galeria);
      lista.forEach(f => { if (!todasLasImagenes.includes(f)) todasLasImagenes.push(f); });
    }
    files.forEach(f => { if (!todasLasImagenes.includes(f)) todasLasImagenes.push(f); });

    for (let i = 0; i < todasLasImagenes.length; i++) {
      await pool.query(
        'INSERT INTO producto_imagenes (producto_id, filename, orden) VALUES ($1, $2, $3)',
        [producto.id, todasLasImagenes[i], i]
      );
    }

    if (colores) {
      const lista = JSON.parse(colores);
      for (let i = 0; i < lista.length; i++) {
        const c = lista[i];
        await pool.query(
          `INSERT INTO producto_colores (producto_id, nombre, hex, imagen, disponible, orden)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [producto.id, c.nombre, c.hex || '#000000', c.imagen || null, c.disponible !== false, i]
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

async function importar(req, res) {
  let client;
  try {
    const tenantId = req.user?.tenant_id || req.tenant?.id;
    const { productos } = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ ok: false, error: 'No se recibieron productos para importar' });
    }
    if (productos.length > 1000) {
      return res.status(400).json({ ok: false, error: 'El máximo permitido es 1000 productos por importación' });
    }

    const cats = await pool.query(
      'SELECT id, nombre, slug FROM categorias WHERE tenant_id = $1',
      [tenantId]
    );
    const catMap = {};
    cats.rows.forEach(c => {
      catMap[c.nombre.toLowerCase().trim()] = c.id;
      catMap[c.slug.toLowerCase()] = c.id;
    });

    const parseBool = (v, dflt = false) => {
      if (v === undefined || v === null || v === '') return dflt;
      if (typeof v === 'boolean') return v;
      const s = String(v).toLowerCase().trim();
      if (['si', 'sí', '1', 'true', 'verdadero'].includes(s)) return true;
      if (['no', '0', 'false', 'falso'].includes(s)) return false;
      return dflt;
    };
    const parseNum = (v) => {
      if (v === undefined || v === null || v === '') return 0;
      const n = parseFloat(String(v).replace(/[^\d.-]/g, ''));
      return isNaN(n) ? 0 : n;
    };

    client = await pool.connect();
    await client.query('BEGIN');

    const errores = [];
    let creados = 0;

    for (let i = 0; i < productos.length; i++) {
      const item = productos[i];
      const fila = i + 2;
      const nombre = String(item.nombre || '').trim();

      if (!nombre) {
        errores.push(`Fila ${fila}: falta el nombre`);
        continue;
      }
      if (nombre.length > 255) {
        errores.push(`Fila ${fila}: el nombre excede 255 caracteres`);
        continue;
      }

      const catId = item.categoria ? (catMap[String(item.categoria).toLowerCase().trim()] ?? null) : null;
      const precio = parseNum(item.precio);
      const stock = Math.max(0, Math.round(parseNum(item.stock)));

      await client.query(
        `INSERT INTO productos (tenant_id, nombre, descripcion, precio, imagen, categoria_id, disponible, oferta, stock)
         VALUES ($1, $2, $3, $4, NULL, $5, $6, $7, $8)`,
        [
          tenantId,
          nombre,
          String(item.descripcion || '').slice(0, 500),
          precio,
          catId,
          parseBool(item.disponible, true),
          parseBool(item.oferta, false),
          stock
        ]
      );
      creados++;
    }

    await client.query('COMMIT');

    res.json({
      ok: true,
      data: {
        creados,
        errores,
        total: productos.length
      }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ ok: false, error: error.message });
  } finally {
    if (client) client.release();
  }
}

async function update(req, res) {
  try {
    const tenantId = req.user?.tenant_id || req.tenant?.id;
    const { nombre, descripcion, precio, imagen_existente, galeria, categoria_id, disponible, oferta, stock, colores } = req.body;

    const existing = await pool.query(
      'SELECT * FROM productos WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Producto no encontrado'
      });
    }

    const productoActual = existing.rows[0];

    let imagen = productoActual.imagen;
    let files = [];
    if (req.files && req.files.length > 0) {
      imagen = req.files[0].filename;
      files = req.files.slice(1).map(f => f.filename);
    } else if (imagen_existente !== undefined) {
      imagen = imagen_existente;
    }

    const catId = categoria_id !== undefined ? (categoria_id ? parseInt(categoria_id) : null) : productoActual.categoria_id;
    const disp = disponible !== undefined ? (disponible === '1' || disponible === true) : productoActual.disponible;
    const ofert = oferta !== undefined ? (oferta === '1' || oferta === true) : productoActual.oferta;
    const stk = stock !== undefined ? parseInt(stock) : productoActual.stock;

    const result = await pool.query(
      `UPDATE productos
       SET nombre = $1,
           descripcion = $2,
           precio = $3,
           imagen = $4,
           categoria_id = $5,
           disponible = $6,
           oferta = $7,
           stock = $8,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $9 AND tenant_id = $10
       RETURNING *`,
      [
        nombre,
        descripcion || '',
        precio || 0,
        imagen,
        catId,
        disp,
        ofert,
        stk,
        req.params.id,
        tenantId
      ]
    );

    if (galeria || files.length > 0) {
      await pool.query('DELETE FROM producto_imagenes WHERE producto_id = $1', [req.params.id]);
      const todasLasImagenes = [];
      if (galeria) {
        const lista = JSON.parse(galeria);
        lista.forEach(f => { if (!todasLasImagenes.includes(f)) todasLasImagenes.push(f); });
      }
      files.forEach(f => { if (!todasLasImagenes.includes(f)) todasLasImagenes.push(f); });
      for (let i = 0; i < todasLasImagenes.length; i++) {
        await pool.query(
          'INSERT INTO producto_imagenes (producto_id, filename, orden) VALUES ($1, $2, $3)',
          [req.params.id, todasLasImagenes[i], i]
        );
      }
    }

    if (colores !== undefined) {
      await pool.query('DELETE FROM producto_colores WHERE producto_id = $1', [req.params.id]);
      const lista = JSON.parse(colores);
      for (let i = 0; i < lista.length; i++) {
        const c = lista[i];
        await pool.query(
          `INSERT INTO producto_colores (producto_id, nombre, hex, imagen, disponible, orden)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [req.params.id, c.nombre, c.hex || '#000000', c.imagen || null, c.disponible !== false, i]
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
    const tenantId = req.user?.tenant_id || req.tenant?.id;
    const existing = await pool.query(
      'SELECT * FROM productos WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Producto no encontrado'
      });
    }

    await pool.query(
      'DELETE FROM productos WHERE id = $1 AND tenant_id = $2',
      [req.params.id, tenantId]
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
  importar,
  update,
  remove,
  uploadImage
};
