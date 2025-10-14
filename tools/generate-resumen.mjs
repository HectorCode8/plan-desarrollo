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

addSection('Proposito', [
  'Construir un Teocuitatlan renovado que combine prosperidad compartida, seguridad confiable y calidad de vida para cada familia.',
  'La iniciativa convoca a habitantes, empresas y aliados a sumar su voz mediante participacion transparente, colaboracion comunitaria y rendicion de cuentas continua.'
]);

addListSection('Ejes estrategicos clave', [
  'Infraestructura de vanguardia: movilidad inteligente, plazas renovadas y alumbrado LED para todas las comunidades.',
  'Economia local viva: incubadora itinerante, apoyos productivos y ruta turistica comunitaria.',
  'Seguridad con inteligencia: policia de proximidad, red vecinal activa y escudo urbano C5i.',
  'Gobierno cercano: despacho itinerante, tramites digitales y reporte ciudadano 072.',
  'Salud y bienestar: brigadas medicas, combate al dengue y casa de dia para adultos mayores.',
  'Energia y sostenibilidad: parque solar municipal, cosecha de agua y programa Basura Cero.',
  'Deporte y juventud: unidad deportiva renovada, ciclovias seguras y semillero de campeones.'
]);

addListSection('Resultados medibles 2027-2030', [
  '4 eco-autobuses inteligentes conectando cabecera y comunidades con monitoreo en tiempo real.',
  '100 por ciento de cobertura de alumbrado LED y espacios publicos rehabilitados en todas las delegaciones.',
  'Respuesta policial menor a cinco minutos en zonas prioritarias y justicia civica itinerante.',
  'Presupuesto transparente en linea, obras con seguimiento ciudadano y reportes resueltos en menos de 72 horas.'
]);

addListSection('Hoja de ruta 2025-2027', [
  'Q4 2025: Socializacion del plan, mesas de trabajo y priorizacion de proyectos con la comunidad.',
  'Q1 2026: Arranque del sistema de movilidad y despliegue del programa de alumbrado LED.',
  'Q2-Q4 2026: Implementacion de incubadora itinerante, brigadas de salud y modernizacion de espacios publicos.',
  '2027: Evaluacion semestral, ampliacion de proyectos de sostenibilidad y cierre con informe ciudadano anual.'
]);

addSection('Gobernanza y participacion', [
  'El plan se rige por principios de transparencia proactiva y escucha permanente. Se propone un comite ciudadano de seguimiento con representantes de la cabecera y cada comunidad, que auditara avances y presupuestos.',
  'La administracion municipal compartira indicadores trimestrales y abrira canales digitales para recopilar sugerencias, reportes y testimonios de impacto.'
]);

addSection('Llamado a la accion', [
  'Aporta ideas, distribuye este resumen y participa en las sesiones publicas para convertir la vision en proyectos ejecutables.',
  'Ing. Hector Haro Hermosillo lidera esta agenda ciudadana con puertas abiertas y un compromiso firme de rendicion de cuentas.'
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
  .text('Contacto coordinacion: enlace@teocuitatlan2030.mx', { align: 'right' });

doc.end();

await new Promise((resolvePromise, rejectPromise) => {
  stream.on('finish', resolvePromise);
  stream.on('error', rejectPromise);
});

console.log(`Resumen ejecutivo generado en ${outputPath}`);
