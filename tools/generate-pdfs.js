const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'content-plans', 'pdfs');

const plans = [
  {
    key: 'harish-vlogs',
    source: path.join(ROOT, 'content-plans', 'harish-vlogs-plan.md'),
    title: 'Harish Vlogs',
    subtitle: '30-Day German Shepherd Growth & Content System',
    url: 'https://www.youtube.com/@vlogsharish1',
    accent: '#2563EB',
    accentDark: '#1E3A8A',
    soft: '#EFF6FF',
    metrics: [
      ['28-day views', '262,824'],
      ['Returning viewers', '2.3%'],
      ['Subscribers gained', '+63'],
      ['Core signal', 'German Shepherd Shorts'],
    ],
    focus: 'German Shepherd life, humane training, puppy care, and honest family stories.',
  },
  {
    key: 'harish-tiny-kitchen',
    source: path.join(ROOT, 'content-plans', 'harish-tiny-kitchen-plan.md'),
    title: 'Harish Tiny Kitchen',
    subtitle: '30-Day Small-Space Cooking Growth System',
    url: 'https://www.youtube.com/@HarishTinyKitchen',
    accent: '#0F766E',
    accentDark: '#134E4A',
    soft: '#ECFDF5',
    metrics: [
      ['28-day views', '5,092'],
      ['CTR', '5.29%'],
      ['Average view duration', '14 sec'],
      ['Core signal', 'Tiny-kitchen food videos'],
    ],
    focus: 'Repeatable tiny-kitchen meals, clear constraints, practical recipes, and satisfying food payoffs.',
  },
  {
    key: 'priyacreatives-fashion',
    source: path.join(ROOT, 'content-plans', 'priyacreatives-fashion-plan.md'),
    title: 'Priyacreatives & Fashion',
    subtitle: '30-Day Rangoli, DIY & Fashion Growth System',
    url: 'https://www.youtube.com/@Priyacreativesandfashion_5',
    accent: '#C026D3',
    accentDark: '#701A75',
    soft: '#FDF4FF',
    metrics: [
      ['28-day views', '4,472'],
      ['CTR', '6.2%'],
      ['Shorts share', '87.9%'],
      ['Long-form watch time', '~53%'],
    ],
    focus: 'Beginner rangoli, affordable festival DIY, simple fashion, and Telugu-friendly creative lifestyle content.',
  },
];

const replacements = {
  '\u2013': '-',
  '\u2014': ' - ',
  '\u2018': "'",
  '\u2019': "'",
  '\u201c': '"',
  '\u201d': '"',
  '\u2026': '...',
  '\u2192': '->',
  '\u2190': '<-',
  '\u2194': '<->',
  '\u2248': '~',
  '\u00d7': 'x',
  '\u00a0': ' ',
  '\u20b9': 'INR ',
  '\u2022': '-',
  '\u2713': '[x]',
  '\u2714': '[x]',
  '\u2717': '[ ]',
};

function safeText(value) {
  let text = String(value == null ? '' : value);
  for (const [from, to] of Object.entries(replacements)) text = text.split(from).join(to);
  // PDFKit's built-in Helvetica is WinAnsi. Keep the document portable by
  // replacing unsupported scripts/symbols rather than producing broken glyphs.
  return text.replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '');
}

function cleanInline(value) {
  return safeText(value)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

function readPlan(file) {
  let raw = fs.readFileSync(file, 'utf8').replace(/^<task[\s\S]*?<task_result>\s*/m, '').replace(/\s*<\/task_result>\s*$/m, '');
  if (file.endsWith('harish-tiny-kitchen-plan.md')) {
    const addendum = path.join(ROOT, 'content-plans', 'harish-tiny-kitchen-addendum.md');
    raw += `\n${fs.readFileSync(addendum, 'utf8')}`;
  }
  return raw.replace(/\r\n/g, '\n');
}

function splitRows(lines) {
  return lines.map((line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cleanInline(cell.trim())));
}

function isTableSeparator(line) {
  return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(line.trim());
}

function drawPageChrome(doc, plan) {
  const width = doc.page.width;
  const height = doc.page.height;
  doc.save();
  doc.fillColor(plan.accent).rect(0, 0, width, 7).fill();
  doc.fillColor('#64748B').font('Helvetica').fontSize(7.5)
    .text(`${plan.title}  /  30-DAY CONTENT SYSTEM`, 42, height - 31, { width: width - 84, align: 'left' });
  doc.fillColor('#64748B').fontSize(7.5)
    .text(`Page ${doc.page.number}`, 42, height - 31, { width: width - 84, align: 'right' });
  doc.restore();
}

function addPage(doc, plan) {
  doc.addPage({ size: 'A4', margin: 42 });
  drawPageChrome(doc, plan);
  doc.y = 48;
}

function ensureSpace(doc, plan, amount = 60) {
  if (doc.y > doc.page.height - 70 - amount) addPage(doc, plan);
}

function drawCover(doc, plan) {
  const width = doc.page.width;
  const height = doc.page.height;
  doc.rect(0, 0, width, height).fill('#F8FAFC');
  doc.rect(0, 0, width, 220).fill(plan.accentDark);
  doc.rect(0, 0, width, 11).fill(plan.accent);
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(31)
    .text(safeText(plan.title), 48, 66, { width: width - 96 });
  doc.fillColor('#DBEAFE').font('Helvetica').fontSize(15)
    .text(safeText(plan.subtitle), 50, 116, { width: width - 100, lineGap: 4 });
  doc.fillColor('#BFDBFE').fontSize(9).text(safeText(plan.url), 50, 178, { width: width - 100 });

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11).text('THE CHANNEL FOCUS', 50, 270);
  doc.fillColor('#334155').font('Helvetica').fontSize(16)
    .text(safeText(plan.focus), 50, 294, { width: width - 100, lineGap: 6 });

  const cardTop = 390;
  const gap = 10;
  const cardWidth = (width - 100 - gap * 3) / 4;
  plan.metrics.forEach(([label, value], index) => {
    const x = 50 + index * (cardWidth + gap);
    doc.roundedRect(x, cardTop, cardWidth, 96, 8).fill(plan.soft);
    doc.fillColor(plan.accentDark).font('Helvetica-Bold').fontSize(16)
      .text(safeText(value), x + 10, cardTop + 20, { width: cardWidth - 20, height: 24, ellipsis: true });
    doc.fillColor('#475569').font('Helvetica').fontSize(8.5)
      .text(safeText(label.toUpperCase()), x + 10, cardTop + 58, { width: cardWidth - 20, lineGap: 2 });
  });

  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(12).text('WHAT IS INSIDE', 50, 540);
  const items = [
    'Channel positioning and audience promise',
    'Four long-form videos with 10+ minute scripts',
    'SEO titles, descriptions, keywords, hashtags and thumbnails',
    'Twelve Shorts packages with hooks and shot lists',
    'A complete day-by-day 30-day publishing calendar',
    'Analytics, monetization and production checklists',
  ];
  items.forEach((item, i) => {
    const y = 570 + i * 25;
    doc.fillColor(plan.accent).circle(57, y + 5, 3).fill();
    doc.fillColor('#334155').font('Helvetica').fontSize(10.5).text(safeText(item), 70, y, { width: width - 120 });
  });

  doc.fillColor('#64748B').font('Helvetica-Oblique').fontSize(8.5)
    .text('Prepared from the last-28-day analytics and channel information provided. Adapt scripts to real footage, real results, and local audience data.', 50, height - 80, { width: width - 100, lineGap: 3 });
  doc.fillColor('#94A3B8').font('Helvetica').fontSize(8).text('Organic growth only - no artificial views, clicks, subscribers or spam.', 50, height - 50, { width: width - 100 });
}

function drawHeading(doc, plan, text, level) {
  const size = level === 1 ? 21 : level === 2 ? 15 : level === 3 ? 11.5 : 10;
  const color = level <= 2 ? plan.accentDark : plan.accent;
  const space = level === 1 ? 20 : level === 2 ? 14 : 9;
  ensureSpace(doc, plan, level === 1 ? 90 : 55);
  if (level === 1 && doc.y > 70) {
    doc.moveDown(0.3);
  }
  doc.moveDown(level === 1 ? 0.4 : 0.2);
  doc.fillColor(color).font(level <= 2 ? 'Helvetica-Bold' : 'Helvetica-Bold').fontSize(size)
    .text(cleanInline(text), { width: doc.page.width - 84, lineGap: level === 1 ? 3 : 2 });
  if (level === 1) {
    const y = doc.y + 6;
    doc.strokeColor(plan.accent).lineWidth(1.5).moveTo(42, y).lineTo(190, y).stroke();
  }
  doc.moveDown(space / 18);
}

function drawQuote(doc, plan, text) {
  const clean = cleanInline(text.replace(/^>\s?/, ''));
  const x = 56;
  const width = doc.page.width - 112;
  const height = doc.heightOfString(clean, { width: width - 18, font: 'Helvetica-Oblique', fontSize: 10, lineGap: 3 }) + 18;
  ensureSpace(doc, plan, height + 10);
  const y = doc.y;
  doc.roundedRect(x, y, width, height, 5).fill('#F8FAFC');
  doc.fillColor(plan.accent).rect(x, y, 4, height).fill();
  doc.fillColor('#334155').font('Helvetica-Oblique').fontSize(10).text(clean, x + 15, y + 9, { width: width - 28, lineGap: 3 });
  doc.y = y + height + 10;
}

function drawTable(doc, plan, rows) {
  const cleanRows = splitRows(rows);
  const columns = Math.max(...cleanRows.map((row) => row.length));
  const usable = doc.page.width - 84;
  const widths = Array.from({ length: columns }, () => usable / columns);
  const fontSize = columns >= 4 ? 7 : 8;
  cleanRows.forEach((row, rowIndex) => {
    const cellHeight = Math.max(24, ...row.map((cell, i) => doc.heightOfString(cell, { width: widths[i] - 12, font: 'Helvetica', fontSize, lineGap: 1.5 }) + 10));
    if (doc.y > doc.page.height - 76 - cellHeight) addPage(doc, plan);
    const y = doc.y;
    row.forEach((cell, col) => {
      const x = 42 + widths.slice(0, col).reduce((a, b) => a + b, 0);
      doc.fillColor(rowIndex === 0 ? plan.accentDark : (rowIndex % 2 ? '#FFFFFF' : '#F8FAFC'))
        .rect(x, y, widths[col], cellHeight).fill();
      doc.strokeColor('#CBD5E1').lineWidth(0.35).rect(x, y, widths[col], cellHeight).stroke();
      doc.fillColor(rowIndex === 0 ? '#FFFFFF' : '#334155').font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(fontSize).text(cell, x + 6, y + 6, { width: widths[col] - 12, lineGap: 1.5 });
    });
    doc.y = y + cellHeight;
  });
  doc.moveDown(0.5);
}

function renderMarkdown(doc, plan, markdown) {
  const lines = markdown.split('\n');
  let i = 0;
  while (i < lines.length) {
    const original = lines[i];
    const line = original.trim();
    if (!line) { doc.moveDown(0.35); i += 1; continue; }
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|/.test(lines[i + 1].trim()) && isTableSeparator(lines[i + 1])) {
      const table = [line];
      i += 1;
      i += 1;
      while (i < lines.length && /^\|/.test(lines[i].trim())) { table.push(lines[i].trim()); i += 1; }
      drawTable(doc, plan, table);
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) { drawHeading(doc, plan, heading[2], heading[1].length); i += 1; continue; }
    if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
      ensureSpace(doc, plan, 20);
      doc.strokeColor('#CBD5E1').lineWidth(0.6).moveTo(42, doc.y + 3).lineTo(doc.page.width - 42, doc.y + 3).stroke();
      doc.moveDown(0.7); i += 1; continue;
    }
    if (/^>/.test(line)) { drawQuote(doc, plan, line); i += 1; continue; }
    const bullet = line.match(/^([-*+] |\d+\. )(.*)$/);
    if (bullet) {
      const indent = /^\d+\./.test(bullet[1]) ? 0 : 2;
      const marker = bullet[1].trim();
      const text = cleanInline(bullet[2]);
      const width = doc.page.width - 98 - indent * 6;
      const height = doc.heightOfString(text, { width: width - 18, font: 'Helvetica', fontSize: 9.5, lineGap: 2 }) + 4;
      ensureSpace(doc, plan, height + 4);
      const y = doc.y;
      doc.fillColor(plan.accent).font('Helvetica-Bold').fontSize(9.5).text(marker, 46 + indent * 6, y, { width: 16 });
      doc.fillColor('#334155').font('Helvetica').fontSize(9.5).text(text, 64 + indent * 6, y, { width, lineGap: 2 });
      doc.y = y + height + 2;
      i += 1; continue;
    }
    let paragraph = line;
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#{1,4})\s+/.test(lines[i + 1].trim()) && !/^[-*+] |^\d+\. |^>|^\|/.test(lines[i + 1].trim()) && !/^---+$/.test(lines[i + 1].trim())) {
      i += 1;
      paragraph += ` ${lines[i].trim()}`;
    }
    const text = cleanInline(paragraph);
    const height = doc.heightOfString(text, { width: doc.page.width - 84, font: 'Helvetica', fontSize: 9.5, lineGap: 2.5 }) + 4;
    ensureSpace(doc, plan, height + 4);
    doc.fillColor('#334155').font('Helvetica').fontSize(9.5).text(text, { width: doc.page.width - 84, lineGap: 2.5, align: 'left' });
    doc.moveDown(0.18);
    i += 1;
  }
}

function makePdf(plan) {
  const doc = new PDFDocument({ size: 'A4', margin: 42, bufferPages: true, info: { Title: `${plan.title} - ${plan.subtitle}`, Author: 'omnirush.ai' } });
  const output = path.join(OUTPUT_DIR, `${plan.key}.pdf`);
  const stream = fs.createWriteStream(output);
  doc.pipe(stream);
  drawCover(doc, plan);
  addPage(doc, plan);
  const markdown = readPlan(plan.source);
  renderMarkdown(doc, plan, markdown);
  doc.end();
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(output));
    stream.on('error', reject);
  });
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputs = [];
  for (const plan of plans) outputs.push(await makePdf(plan));
  for (const output of outputs) {
    const stat = fs.statSync(output);
    console.log(`${path.relative(ROOT, output)} (${stat.size} bytes)`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
