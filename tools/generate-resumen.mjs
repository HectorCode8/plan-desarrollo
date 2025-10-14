import fs from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import PDFDocument from 'pdfkit';

const outputDir = resolve(process.cwd(), 'assets');
await mkdir(outputDir, { recursive: true });

const outputPath = resolve(outputDir, 'resumen-ejecutivo.pdf');
const doc = new PDFDocument({ size: 'LETTER', margin: 54 });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
const bodyFont = 'Helvetica';
const bodySize = 11.5;
const bodyColor = '#1f2937';
const headingColor = '#0f172a';

const addSection = (title, paragraphs) => {
  doc.fillColor(headingColor).font('Helvetica-Bold').fontSize(16).text(title);
  doc.moveDown(0.3);
  doc.fillColor(bodyColor).font(bodyFont).fontSize(bodySize);
  const list = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
  list.forEach((paragraph, index) => {
    doc.text(paragraph, { lineGap: 4 });
    if (index < list.length - 1) {
      doc.moveDown(0.6);
    }
  });
  doc.moveDown(0.8);
};

const addListSection = (title, items) => {
  doc.fillColor(headingColor).font('Helvetica-Bold').fontSize(16).text(title);
  doc.moveDown(0.3);
  doc.fillColor(bodyColor).font(bodyFont).fontSize(bodySize)
    .list(items, {
      bulletRadius: 2.6,
      textIndent: 14,
      bulletIndent: 6,
      lineGap: 4
    });
  doc.moveDown(1);
};

doc.fillColor(headingColor).font('Helvetica-Bold').fontSize(24).text('Vision Teocuitatlan 2027-2030');
doc.moveDown(0.4);
doc.fillColor(bodyColor).font(bodyFont).fontSize(14).text('Resumen ejecutivo oficial · Octubre 2025');
doc.moveDown(0.6);
doc.lineWidth(1.5).strokeColor('#0891d2')
  .moveTo(doc.page.margins.left, doc.y)
  .lineTo(doc.page.margins.left + contentWidth, doc.y)
  .stroke();
doc.moveDown(1.2);

addSection('Resumen ejecutivo', [
  'Teocuitatlan 2027-2030 es un pacto ciudadano que integra infraestructura, bienestar social y crecimiento economico responsable para elevar la calidad de vida en cada comunidad.',
  'La propuesta articula proyectos listos para ejecutar con financiamiento responsable, gestion transparente y participacion vecinal permanente.'
]);

addSection('Proposito y ambicion', [
  'Consolidar un municipio referente de prosperidad compartida, seguridad confiable y servicios dignos para todas las edades.',
  'Activar alianzas con iniciativa privada, sector social y academia para detonar inversion productiva y talento local sin perder identidad ni arraigo.'
]);

addListSection('Pilares estrategicos', [
  'Infraestructura de vanguardia: movilidad conectada, plazas vivas y alumbrado inteligente.',
  'Economia inclusiva: incubadora itinerante, agroindustria competitiva y turismo comunitario.',
  'Seguridad con inteligencia: policia guardian, red vecinal y tecnologia C5i.',
  'Gobierno cercano: despacho itinerante, tramites digitales y reporte ciudadano 072.',
  'Salud y bienestar integral: brigadas permanentes, programa anti-dengue y casa de dia.',
  'Energia limpia y sostenibilidad: parque solar municipal, cosecha de lluvia y Basura Cero.',
  'Deporte y juventud: infraestructura renovada, ciclorutas seguras y semillero de campeones.'
]);

addListSection('Indicadores clave 2027-2030', [
  'Movilidad: micro-red con 4 eco-autobuses inteligentes, rutas conectadas y tiempos de espera menores a 12 minutos.',
  'Espacio publico: 100 por ciento de plazas, canchas y parques rehabilitados con iluminacion LED.',
  'Seguridad: respuesta a emergencias bajo 5 minutos en cabecera y delegaciones prioritarias.',
  'Transparencia: tablero en linea con seguimiento presupuestal en tiempo real para cada obra y servicio.'
]);


addSection('Implementacion inmediata', [
  'Cada eje cuenta con proyectos ejecutivos listos para licitar, matrices de riesgo y esquemas de financiamiento mixto.',
  'La prioridad es arrancar movilidad inteligente, alumbrado LED y el tablero de transparencia durante los primeros seis meses de gestion.'
]);

addSection('Gobernanza y transparencia', [
  'Se propone un tablero de control publico con indicadores trimestrales, auditable por un comite ciudadano mixto (cabecera y comunidades).',
  'Cada proyecto clave incorpora matriz de riesgos, responsables y cronograma, garantizando trazabilidad completa de presupuesto y contrataciones.'
]);

addSection('Proxima accion', [
  'Comparte este resumen, sumate a los talleres de planeacion y registra iniciativas locales que puedan integrarse en la agenda 2027-2030.',
  'El liderazgo del Ing. Hector Haro Hermosillo asegura puertas abiertas, rendicion de cuentas y seguimiento permanente a los compromisos adquiridos.'
]);

doc.moveDown(0.4);
doc.lineWidth(0.8).strokeColor('#d1d5db')
  .moveTo(doc.page.margins.left, doc.y)
  .lineTo(doc.page.margins.left + contentWidth, doc.y)
  .stroke();
doc.moveDown(0.4);

doc.fillColor('#4b5563').font(bodyFont).fontSize(10)
  .text('Ultima actualizacion: 14 de octubre de 2025.', { align: 'right' });
doc.moveDown(0.2);
doc.fillColor(headingColor).font('Helvetica-Bold').fontSize(11)
  .text('Contacto coordinacion: hector8.haro@gmail.com', { align: 'right' });

doc.end();

await new Promise((resolvePromise, rejectPromise) => {
  stream.on('finish', resolvePromise);
  stream.on('error', rejectPromise);
});

console.log(`Resumen ejecutivo generado en ${outputPath}`);
