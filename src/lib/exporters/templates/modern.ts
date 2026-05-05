import {
  Document, Paragraph, TextRun, AlignmentType, Packer,
  BorderStyle, convertInchesToTwip, Table, TableRow, TableCell, WidthType,
} from 'docx';
import type { Template, ResumeData, ResumeSection } from '../types';

const ACCENT = '1e3a5f'; // dark blue
const FONT = 'Arial';

function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderHtml(data: ResumeData): string {
  function section(s: ResumeSection): string {
    let body = '';
    const c = s.content;
    if (c.type === 'paragraph') body = `<p>${esc(c.text)}</p>`;
    else if (c.type === 'bullets') body = `<ul>${c.items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
    else if (c.type === 'inline-list') body = `<p class="inline-list">${c.items.map(esc).join('<span class="sep"> | </span>')}</p>`;
    else if (c.type === 'experience') {
      body = c.entries.map((e) =>
        `<div class="entry"><h3>${esc(e.heading)}</h3><ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>`
      ).join('');
    }
    return `<div class="section"><h2>${esc(s.title)}</h2>${body}</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page{size:letter;margin:0.6in}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;font-size:10.5pt;line-height:1.45;color:#111}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.header-left .name{font-size:18pt;font-weight:700;color:#${ACCENT};line-height:1.1}
.header-left .headline{font-size:10.5pt;color:#555;margin-top:3px}
.header-right{text-align:right;font-size:9.5pt;color:#555;line-height:1.6}
.section{margin-top:12px}
h2{font-size:10.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#${ACCENT};border-bottom:1.5px solid #${ACCENT};padding-bottom:2px;margin-bottom:6px}
h3{font-size:10.5pt;font-weight:700;margin-top:8px;margin-bottom:3px}
ul{margin-left:16px;margin-bottom:5px}
li{margin-bottom:2px}
p{margin-bottom:5px}
.inline-list .sep{color:#bbb}
</style></head><body>
<div class="header">
  <div class="header-left">
    <div class="name">${esc(data.name)}</div>
    ${data.headline ? `<div class="headline">${esc(data.headline)}</div>` : ''}
  </div>
  <div class="header-right">${esc(data.contact).replace(/[|·]/g, '<br>')}</div>
</div>
${data.sections.map(section).join('')}
</body></html>`;
}

async function renderDocx(data: ResumeData): Promise<Buffer> {
  const margin = convertInchesToTwip(0.6);

  function heading2(text: string): Paragraph {
    return new Paragraph({
      spacing: { before: 180, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 2 } },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, allCaps: true, size: 21, font: FONT, color: ACCENT })],
    });
  }

  function sectionParagraphs(s: ResumeSection): Paragraph[] {
    const paras: Paragraph[] = [heading2(s.title)];
    const c = s.content;
    if (c.type === 'paragraph') {
      paras.push(new Paragraph({ children: [new TextRun({ text: c.text, size: 21, font: FONT })], spacing: { after: 60 } }));
    } else if (c.type === 'bullets') {
      c.items.forEach((b) => paras.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: b, size: 21, font: FONT })], spacing: { after: 40 } })));
    } else if (c.type === 'inline-list') {
      paras.push(new Paragraph({ children: [new TextRun({ text: c.items.join(' | '), size: 21, font: FONT })], spacing: { after: 60 } }));
    } else if (c.type === 'experience') {
      c.entries.forEach((e) => {
        paras.push(new Paragraph({ spacing: { before: 100, after: 40 }, children: [new TextRun({ text: e.heading, bold: true, size: 21, font: FONT })] }));
        e.bullets.forEach((b) => paras.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: b, size: 21, font: FONT })], spacing: { after: 40 } })));
      });
    }
    return paras;
  }

  // Header row: name+headline left, contact right
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [
              new Paragraph({ children: [new TextRun({ text: data.name, bold: true, size: 36, font: FONT, color: ACCENT })] }),
              ...(data.headline ? [new Paragraph({ children: [new TextRun({ text: data.headline, size: 21, font: FONT, color: '555555' })] })] : []),
            ],
          }),
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [
              new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.contact, size: 19, font: FONT, color: '555555' })] }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: margin, bottom: margin, left: margin, right: margin } } },
      children: [headerTable, ...data.sections.flatMap(sectionParagraphs)],
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export const modernTemplate: Template = {
  id: 'modern',
  displayName: 'Modern',
  description: 'Clean and minimal — sans-serif, blue accents',
  renderHtml,
  renderDocx,
};
