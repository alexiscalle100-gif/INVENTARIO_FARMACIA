import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface TicketData {
  numero_comprobante: string;
  tipo_comprobante: string;
  fecha_venta: string;
  metodo_pago: string;
  empleado_nombre: string;
  cliente_nombre?: string;
  subtotal: number;
  descuento: number;
  total_venta: number;
  detalles: {
    nombre_medicamento: string;
    numero_lote: string;
    tipo_unidad: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  receta?: {
    nombre_medico: string;
    matricula_profesional: string;
    diagnostico?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  // Exportar cualquier arreglo de objetos a un archivo Excel (.xlsx)
  exportToExcel(data: any[], fileName: string, sheetName: string = 'Reporte'): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  // Generar e imprimir Ticket Térmico en PDF (80mm)
  generarTicketPDF(ticket: TicketData): void {
    // 80mm de ancho x altura dinámica según items
    const docHeight = 120 + ticket.detalles.length * 15 + (ticket.receta ? 40 : 0);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, Math.max(150, docHeight)],
    });

    let y = 10;

    // Encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('FARMACONTROL PRO', 40, y, { align: 'center' });
    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Farmacia Central & Especialidades', 40, y, { align: 'center' });
    y += 4;
    doc.text('NIT: 1028374029 | Tel: (591) 2-2441122', 40, y, { align: 'center' });
    y += 4;
    doc.text('Av. 14 de Septiembre #5200 - Zona Central', 40, y, { align: 'center' });
    y += 5;

    // Separador
    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, y, 75, y);
    y += 4;

    // Info comprobante
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${ticket.tipo_comprobante.toUpperCase()}: ${ticket.numero_comprobante}`, 40, y, { align: 'center' });
    y += 4;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date(ticket.fecha_venta).toLocaleString()}`, 5, y);
    y += 3.5;
    doc.text(`Atendido por: ${ticket.empleado_nombre}`, 5, y);
    y += 3.5;
    doc.text(`Cliente: ${ticket.cliente_nombre || 'Cliente Mostrador'}`, 5, y);
    y += 3.5;
    doc.text(`Método de Pago: ${ticket.metodo_pago.toUpperCase()}`, 5, y);
    y += 4;

    // Encabezado Tabla Items
    doc.line(5, y, 75, y);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('CANT / DESCRIPCIÓN', 5, y);
    doc.text('TOTAL', 75, y, { align: 'right' });
    y += 3;
    doc.line(5, y, 75, y);
    y += 4;

    // Lista de Medicamentos
    doc.setFont('helvetica', 'normal');
    ticket.detalles.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.cantidad} x ${item.nombre_medicamento}`, 5, y);
      doc.text(`Bs. ${item.subtotal.toFixed(2)}`, 75, y, { align: 'right' });
      y += 3.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`   [${item.tipo_unidad.toUpperCase()}] Lote: ${item.numero_lote} | Unit: Bs. ${item.precio_unitario.toFixed(2)}`, 5, y);
      doc.setFontSize(7.5);
      y += 4;
    });

    // Separador y Totales
    doc.line(5, y, 75, y);
    y += 4;

    doc.setFontSize(8);
    if (ticket.descuento > 0) {
      doc.text('Subtotal:', 45, y);
      doc.text(`Bs. ${ticket.subtotal.toFixed(2)}`, 75, y, { align: 'right' });
      y += 3.5;
      doc.text('Descuento:', 45, y);
      doc.text(`- Bs. ${ticket.descuento.toFixed(2)}`, 75, y, { align: 'right' });
      y += 3.5;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL A PAGAR:', 5, y);
    doc.text(`Bs. ${ticket.total_venta.toFixed(2)}`, 75, y, { align: 'right' });
    y += 6;

    // Sección Receta Médica si existe
    if (ticket.receta) {
      doc.line(5, y, 75, y);
      y += 4;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('RECETA MÉDICA ARCHIVADA', 40, y, { align: 'center' });
      y += 3.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Médico: ${ticket.receta.nombre_medico}`, 5, y);
      y += 3.5;
      doc.text(`Matrícula: ${ticket.receta.matricula_profesional}`, 5, y);
      y += 3.5;
      if (ticket.receta.diagnostico) {
        doc.text(`Diag: ${ticket.receta.diagnostico}`, 5, y);
        y += 3.5;
      }
      y += 2;
    }

    // Pie de Ticket con Código de Validación QR Simulado
    doc.line(5, y, 75, y);
    y += 5;

    // Dibujar caja simulada de QR / Código de Control
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(25, y, 30, 15, 2, 2, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('[ CÓDIGO QR VALIDADOR ]', 40, y + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`ID-${ticket.numero_comprobante.slice(-6)}`, 40, y + 11, { align: 'center' });
    y += 20;

    doc.setFontSize(7);
    doc.text('¡Gracias por su compra! Cuide su salud.', 40, y, { align: 'center' });
    y += 3.5;
    doc.text('Conserve este comprobante para cualquier reclamo.', 40, y, { align: 'center' });

    // Guardar / Abrir PDF
    doc.save(`Ticket_${ticket.numero_comprobante}.pdf`);
  }
}
