import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export function sinStock(p) {
  return p.disponible === false || (p.stock !== undefined && p.stock <= 0);
}

function formatPrecio(precio) {
  return precio > 0
    ? `$${parseFloat(precio).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';
}

export function exportarExcel(productos) {
  const rows = productos.map(p => ({
    Nombre: p.nombre,
    Categoría: p.categoria_nombre || '-',
    Precio: p.precio > 0 ? parseFloat(p.precio) : null,
    Stock: p.stock !== undefined ? p.stock : null,
    Estado: sinStock(p) ? 'Sin stock' : 'En stock',
    Oferta: p.oferta ? 'Sí' : 'No',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 45 }, { wch: 20 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 8 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Catálogo');
  XLSX.writeFile(wb, 'catalogo.xlsx');
}

export function exportarPdf(productos, config) {
  const doc = new jsPDF();
  const nombreNegocio = config?.nombre_negocio || 'Catálogo de productos';

  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text(nombreNegocio, 14, 20);
  doc.setTextColor(100);
  doc.setFontSize(10);

  let headerY = 27;
  if (config?.direccion) {
    doc.text(config.direccion, 14, headerY);
    headerY += 5;
  }
  if (config?.telefono) {
    doc.text(`Tel: ${config.telefono}`, 14, headerY);
    headerY += 5;
  }
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Lista de precios - ${productos.length} producto${productos.length !== 1 ? 's' : ''}`, 14, headerY + 2);

  autoTable(doc, {
    startY: headerY + 7,
    head: [['Producto', 'Categoría', 'Precio', 'Stock', 'Estado']],
    body: productos.map(p => [
      p.nombre,
      p.categoria_nombre || '-',
      formatPrecio(p.precio),
      p.stock !== undefined ? String(p.stock) : '-',
      sinStock(p) ? 'Sin stock' : 'En stock',
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        data.cell.styles.textColor = data.cell.raw === 'Sin stock' ? [220, 38, 38] : [22, 163, 74];
      }
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() - 14,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'right' }
    );
  }

  doc.save('catalogo.pdf');
}
