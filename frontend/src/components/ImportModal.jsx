import { useState, useRef } from 'react';
import api from '../services/api';

function normalizarHeader(h) {
  const s = String(h || '').toLowerCase().trim();
  if (['nombre', 'nombre del producto', 'producto', 'name'].includes(s)) return 'nombre';
  if (['categoria', 'categoría', 'rubro', 'category'].includes(s)) return 'categoria';
  if (['precio', 'price', 'pvp'].includes(s)) return 'precio';
  if (['stock', 'cantidad', 'unidades', 'existencia'].includes(s)) return 'stock';
  if (['disponible', 'disponibilidad', 'available'].includes(s)) return 'disponible';
  if (['oferta', 'promo', 'promocion', 'promoción', 'sale'].includes(s)) return 'oferta';
  if (['descripcion', 'descripción', 'description', 'detalle', 'caracteristicas', 'características'].includes(s)) return 'descripcion';
  return null;
}

function ImportModal({ show, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [preview, setPreview] = useState([]);
  const [parsed, setParsed] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  if (!show) return null;

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    try {
      const XLSX = await import('xlsx');
      const data = await f.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const mapped = json.map(row => {
        const out = {};
        Object.entries(row).forEach(([k, v]) => {
          const col = normalizarHeader(k);
          if (col) out[col] = v;
        });
        return out;
      });

      const sinNombre = mapped.filter(r => !String(r.nombre || '').trim());
      setRows(mapped);
      setPreview(mapped.slice(0, 8));
      setParsed(true);
      if (sinNombre.length) {
        setResult({ advertencia: `${sinNombre.length} fila(s) sin nombre se omitirán al importar.` });
      }
    } catch (err) {
      setResult({ error: 'No se pudo leer el archivo. Usá un .xlsx válido.' });
      setParsed(false);
    }
  };

  const descargarPlantilla = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet([
      { Nombre: 'Ejemplo Parlante BT', Categoría: 'Audio', Precio: 15000, Stock: 10, Disponible: 'Si', Oferta: 'No', Descripción: 'Bluetooth - 50H de batería' }
    ]);
    ws['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 60 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'plantilla_productos.xlsx');
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await api.post('/productos/importar', { productos: rows });
      setResult(res.data.data);
      setFile(null);
      setRows([]);
      setPreview([]);
      setParsed(false);
      onImported?.();
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Error al importar' });
    } finally {
      setImporting(false);
    }
  };

  const cerrar = () => {
    if (importing) return;
    onClose();
    setFile(null);
    setRows([]);
    setPreview([]);
    setParsed(false);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const columnas = ['nombre', 'categoria', 'precio', 'stock', 'disponible', 'oferta', 'descripcion'];
  const etiquetas = { nombre: 'Nombre', categoria: 'Categoría', precio: 'Precio', stock: 'Stock', disponible: 'Disponible', oferta: 'Oferta', descripcion: 'Descripción' };

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
        onClick={cerrar}
      />
      <div
        className="position-fixed top-50 start-50 translate-middle"
        style={{ zIndex: 1070, width: '92%', maxWidth: 640 }}
      >
        <div
          className="p-4 shadow-lg"
          style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
        >
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="fw-bold mb-1">Importar productos desde Excel</h5>
              <p className="text-muted small mb-0">
                Columnas: Nombre, Categoría, Precio, Stock, Disponible, Oferta, Descripción
              </p>
            </div>
            <button className="btn p-0 border-0 fs-5 lh-1" onClick={cerrar} style={{ color: 'var(--text-secondary)' }}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {!parsed ? (
            <>
              <div
                className="d-flex flex-column align-items-center justify-content-center border rounded-3 py-5 mb-3"
                style={{ borderStyle: 'dashed', cursor: 'pointer', borderColor: 'var(--border)' }}
                onClick={() => fileRef.current?.click()}
              >
                <i className="bi bi-file-earmark-excel fs-1 mb-2" style={{ color: '#16a34a' }}></i>
                <p className="mb-1 fw-medium" style={{ fontSize: '0.95rem' }}>Hacé clic para elegir un archivo .xlsx</p>
                <p className="text-muted small mb-0">o arrastrá y soltalo acá</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="d-none"
                  onChange={handleFile}
                />
              </div>
              <button className="btn btn-outline btn-sm" onClick={descargarPlantilla}>
                <i className="bi bi-download me-1"></i>Descargar plantilla
              </button>
            </>
          ) : (
            <>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small">
                  <i className="bi bi-file-earmark-excel me-1" style={{ color: '#16a34a' }}></i>
                  {file?.name} - {rows.length} fila(s)
                </span>
                <button className="btn btn-sm btn-outline" onClick={() => fileRef.current?.click()} disabled={importing}>
                  <i className="bi bi-arrow-repeat me-1"></i>Otro archivo
                </button>
              </div>

              <div className="table-responsive mb-3" style={{ maxHeight: 240, border: '1px solid var(--border)', borderRadius: 8 }}>
                <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      {columnas.map(c => (
                        <th key={c} className="text-nowrap" style={{ background: 'var(--bg-soft)' }}>{etiquetas[c]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i}>
                        {columnas.map(c => (
                          <td key={c} className="text-nowrap" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r[c] !== '' ? String(r[c]) : <span className="text-muted">-</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > preview.length && (
                <p className="text-muted small mb-2">...y {rows.length - preview.length} fila(s) más</p>
              )}

              {result?.advertencia && (
                <div className="p-2 mb-2 rounded" style={{ background: '#fffbeb', color: '#d97706', fontSize: '0.85rem' }}>
                  <i className="bi bi-exclamation-triangle me-1"></i>{result.advertencia}
                </div>
              )}
              {result?.error && (
                <div className="p-2 mb-2 rounded" style={{ background: '#fef2f2', color: '#dc2626', fontSize: '0.85rem' }}>
                  <i className="bi bi-x-circle me-1"></i>{result.error}
                </div>
              )}
              {result?.creados !== undefined && (
                <div className="p-2 mb-2 rounded" style={{ background: result.errores?.length ? '#fffbeb' : '#f0fdf4', color: result.errores?.length ? '#d97706' : '#16a34a', fontSize: '0.85rem' }}>
                  <i className={`bi ${result.errores?.length ? 'bi-exclamation-triangle' : 'bi-check-circle'} me-1`}></i>
                  Importados {result.creados} de {result.total} producto(s)
                  {result.errores?.length > 0 && ` · ${result.errores.length} error(es)`}
                </div>
              )}

              <div className="d-flex gap-2 justify-content-end">
                <button className="btn btn-outline" onClick={cerrar} disabled={importing}>
                  Cerrar
                </button>
                <button
                  className="btn"
                  style={{ background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}
                  onClick={handleImport}
                  disabled={importing}
                >
                  <i className="bi bi-upload me-1"></i>
                  {importing ? 'Importando...' : 'Importar productos'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ImportModal;
