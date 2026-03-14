import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { logger } from '../../../shared/logger';

const toCSV = async (data: any[], fields: string[]): Promise<string> => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    logger.error('CSV Export Error:', error);
    throw error;
  }
};

const toPDF = async (title: string, data: any[], columns: { header: string; key: string }[]): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();

      // Table Header
      const startX = 30;
      let currentY = doc.y;
      const colWidth = 530 / columns.length;

      doc.rect(startX, currentY, 530, 20).fill('#f3f4f6');
      doc.fillColor('#374151').fontSize(10);
      
      columns.forEach((col, i) => {
        doc.text(col.header, startX + (i * colWidth) + 5, currentY + 5);
      });
      
      currentY += 20;
      doc.fillColor('black');

      // Data Rows
      data.forEach((item, index) => {
        if (currentY > 750) {
          doc.addPage();
          currentY = 30;
        }

        // Zebra striping
        if (index % 2 === 1) {
          doc.rect(startX, currentY, 530, 20).fill('#f9fafb');
          doc.fillColor('black');
        }

        columns.forEach((col, i) => {
          const val = String(item[col.key] || '');
          doc.text(val, startX + (i * colWidth) + 5, currentY + 5, {
            width: colWidth - 10,
            lineBreak: false
          });
        });

        currentY += 20;
      });

      doc.end();
    } catch (error) {
      logger.error('PDF Export Error:', error);
      reject(error);
    }
  });
};

const generateInvoicePDF = async (order: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header / Logo
      doc.fillColor('#444444').fontSize(20).text('INVOICE', { align: 'right' });
      doc.fontSize(10).text(`Order ID: ${order._id}`, { align: 'right' });
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Bill To
      doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 100);
      doc.font('Helvetica').fontSize(10).text(order.customerId?.name || 'Customer');
      doc.text(order.customerId?.email || '');
      doc.moveDown();

      // Table
      const tableTop = 180;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, tableTop);
      doc.text('Status', 250, tableTop);
      doc.text('Amount', 450, tableTop, { align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      doc.font('Helvetica').fontSize(10);
      doc.text(order.title || 'Order Purchase', 50, tableTop + 30);
      doc.text(order.status.toUpperCase(), 250, tableTop + 30);
      doc.text(`$${order.amount.toFixed(2)}`, 450, tableTop + 30, { align: 'right' });

      doc.moveTo(50, tableTop + 50).lineTo(550, tableTop + 50).stroke();

      // Total
      doc.fontSize(12).font('Helvetica-Bold').text('Total:', 400, tableTop + 70);
      doc.text(`$${order.amount.toFixed(2)}`, 450, tableTop + 70, { align: 'right' });

      // Footer
      doc.fontSize(10).font('Helvetica').text(
        'Thank you for your business!',
        50,
        700,
        { align: 'center', width: 500 }
      );

      doc.end();
    } catch (error) {
      logger.error('Invoice PDF Error:', error);
      reject(error);
    }
  });
};

export const ExportService = {
  toCSV,
  toPDF,
  generateInvoicePDF,
};
