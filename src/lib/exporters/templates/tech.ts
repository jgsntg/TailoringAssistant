import {
  Document, Paragraph, TextRun, Packer, BorderStyle,
  convertInchesToTwip, Table, TableRow, TableCell, WidthType,
} from 'docx';
import type { Template, ResumeData, ResumeSection } from '../types';

const FONT = 'Calibri';
const ACCENT = '374151'; // slate-700

function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const SIDEBAR_SECTIONS = new Set(['skills', 'education', 'certifications', 'languages', 'interests']);

function isSidebar(s: ResumeSection): boolean {
  return SIDEBAR_SECTIONS.has(s.title.toLowerCase());
}

function renderHtml(data: ResumeData): string {
  const mainSections = data.sections.filter((s) => !isSidebar(s));
  const sidebarSections = data.sections.filter((s) => isSidebar(s));

  function section(s: ResumeSection, small = false): string {
    let body = '';
    const c = s.content;
    const sz = small ? 'small' : '';
    if (c.type === 'paragraph') body = `<p class="${sz}">${esc(c.text)}</p>`;
    else if (c.type === 'bullets') body = `<ul class="${sz}">${c.items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
    else if (c.type === 'inline-list') body = `<ul class="${sz}">${c.items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
    else if (c.type === 'experience') {
      body = c.entries.map((e) =>
        `<div class="entry"><h3>${esc(e.heading)}</h3><ul class="${sz}">${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>`
      ).join('');
    }
    return `<div class="section"><h2 class="${small ? 'small-h2' : ''}">${esc(s.title)}</h2>${body}</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page{size:letter;margin:0.5in}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Calibri,Roboto,Arial,sans-serif;font-size:10pt;line-height:1.4;color:#111}
.header{margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #${ACCENT}}
.name{font-size:16pt;font-weight:700;color:#${ACCENT}}
.headline{font-size:10pt;color:#555;margin-top:2px}
.contact{font-size:9pt;color:#555;margin-top:4px}
.layout{display:flex;gap:16px}
.main{flex:7}
.sidebar{flex:3;border-left:1px solid #e5e7eb;padding-left:14px}
.section{margin-top:12px}
h2{font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:.6px;background:#f1f5f9;padding:2px 6px;margin-bottom:6px}
h2.small-h2{font-size:9pt}
h3{font-size:10pt;font-weight:700;margin-top:7px;margin-bottom:2px}
ul{margin-left:15px;margin-bottom:4px}
ul.small{font-size:9pt}
li{margin-bottom:1px}
p{margin-bottom:4px}
p.small{font-size:9pt}
</style></head><body>
<div class="header">
  <div class="name">${esc(data.name)}</div>
  ${data.headline ? `<div class="headline">${esc(data.headline)}</div>` : ''}
  <div class="contact">${esc(data.contact)}</div>
</div>
<div class="layout">
  <div class="main">${mainSections.map((s) => section(s)).join('')}</div>
  <div class="sidebar">${sidebarSections.map((s) => section(s, true)).join('')}</div>
</div>
</body></html>`;
}

async function renderDocx(data: ResumeData): Promise<Buffer> {
  const margin = convertInchesToTwip(0.5);
  const mainSections = data.sections.filter((s) => !isSidebar(s));
  const sidebarSections = data.sections.filter((s) => isSidebar(s));

  function h2(text: string, small = false): Paragraph {
    return new Paragraph({
      spacing: { before: 140, after: 60 },
      shading: { fill: 'f1f5f9', type: 'clear' as never },
      children: [new TextRun({ text: text.toUpperCase(), bold: true, size: small ? 18 : 20, font: FONT, color: ACCENT })],
    });
  }

  function sectionParas(s: ResumeSection, small = false): Paragraph[] {
    const size = small ? 18 : 20;
    const paras: Paragraph[] = [h2(s.title, small)];
    const c = s.content;
    if (c.type === 'paragraph') {
      paras.push(new Paragraph({ children: [new TextRun({ text: c.text, size, font: FONT })], spacing: { after: 60 } }));
    } else if (c.type === 'bullets' || c.type === 'inline-list') {
      const items = c.type === 'inline-list' ? c.items : c.items;
      items.forEach((b) => paras.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: b, size, font: FONT })], spacing: { after: 30 } })));
    } else if (c.type === 'experience') {
      c.entries.forEach((e) => {
        paras.push(new Paragraph({ spacing: { before: 80, after: 30 }, children: [new TextRun({ text: e.heading, bold: true, size, font: FONT })] }));
        e.bullets.forEach((b) => paras.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: b, size, font: FONT })], spacing: { after: 30 } })));
      });
    }
    return paras;
  }

  const headerParas = [
    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: data.name, bold: true, size: 32, font: FONT, color: ACCENT })] }),
    ...(data.headline ? [new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: data.headline, size: 20, font: FONT, color: '555555' })] })] : []),
    new Paragraph({ spacing: { after: 100 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 4 } }, children: [new TextRun({ text: data.contact, size: 18, font: FONT, color: '555555' })] }),
  ];

  const layoutTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 68, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: mainSections.flatMap((s) => sectionParas(s)),
          }),
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 4, color: 'e5e7eb', space: 8 }, right: { style: BorderStyle.NONE } },
            children: sidebarSections.flatMap((s) => sectionParas(s, true)),
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: margin, bottom: margin, left: margin, right: margin } } },
      children: [...headerParas, layoutTable],
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export const techTemplate: Template = {
  id: 'tech',
  displayName: 'Tech',
  description: 'Two-column layout — ideal for tech and PM roles',
  renderHtml,
  renderDocx,
};
