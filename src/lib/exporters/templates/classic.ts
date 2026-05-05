import {
  Document, Paragraph, TextRun, AlignmentType, Packer,
  BorderStyle, UnderlineType, convertInchesToTwip,
} from 'docx';
import type { Template, ResumeData, ResumeSection } from '../types';

function esc(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderHtml(data: ResumeData): string {
  function section(s: ResumeSection): string {
    let body = '';
    const c = s.content;
    if (c.type === 'paragraph') body = `<p>${esc(c.text)}</p>`;
    else if (c.type === 'bullets') body = `<ul>${c.items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
    else if (c.type === 'inline-list') body = `<p>${c.items.map(esc).join(' &bull; ')}</p>`;
    else if (c.type === 'experience') {
      body = c.entries.map((e) =>
        `<div class="entry"><h3>${esc(e.heading)}</h3><ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>`
      ).join('');
    }
    return `<div class="section"><h2>${esc(s.title)}</h2>${body}</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page{size:letter;margin:0.75in}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Times New Roman',Georgia,serif;font-size:11pt;line-height:1.45;color:#000}
.name{font-size:14pt;font-weight:bold;text-align:center;margin-bottom:4px}
.contact{text-align:center;font-size:10pt;margin-bottom:14px}
.headline{text-align:center;font-size:11pt;font-style:italic;margin-bottom:12px}
.section{margin-top:14px}
h2{font-size:12pt;font-variant:small-caps;letter-spacing:.5px;border-bottom:1px solid #000;padding-bottom:2px;margin-bottom:6px;text-transform:uppercase}
h3{font-size:11pt;font-weight:bold;margin-top:8px;margin-bottom:3px}
ul{margin-left:18px;margin-bottom:6px}
li{margin-bottom:2px}
p{margin-bottom:6px}
</style></head><body>
<div class="name">${esc(data.name)}</div>
<div class="contact">${esc(data.contact)}</div>
${data.headline ? `<div class="headline">${esc(data.headline)}</div>` : ''}
${data.sections.map(section).join('')}
</body></html>`;
}

async function renderDocx(data: ResumeData): Promise<Buffer> {
  const margin = convertInchesToTwip(0.75);
  const FONT = 'Times New Roman';

  function heading2(text: string): Paragraph[] {
    return [
      new Paragraph({
        spacing: { before: 200, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 2 } },
        children: [
          new TextRun({ text: text.toUpperCase(), bold: true, allCaps: true, size: 24, font: FONT }),
        ],
      }),
    ];
  }

  function sectionParagraphs(s: ResumeSection): Paragraph[] {
    const paras: Paragraph[] = [...heading2(s.title)];
    const c = s.content;
    if (c.type === 'paragraph') {
      paras.push(new Paragraph({ children: [new TextRun({ text: c.text, size: 22, font: FONT })], spacing: { after: 60 } }));
    } else if (c.type === 'bullets') {
      c.items.forEach((b) =>
        paras.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: b, size: 22, font: FONT })], spacing: { after: 40 } }))
      );
    } else if (c.type === 'inline-list') {
      paras.push(new Paragraph({ children: [new TextRun({ text: c.items.join(' • '), size: 22, font: FONT })], spacing: { after: 60 } }));
    } else if (c.type === 'experience') {
      c.entries.forEach((e) => {
        paras.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: e.heading, bold: true, size: 22, font: FONT })] }));
        e.bullets.forEach((b) =>
          paras.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: b, size: 22, font: FONT })], spacing: { after: 40 } }))
        );
      });
    }
    return paras;
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: margin, bottom: margin, left: margin, right: margin } } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: data.name, bold: true, size: 28, font: FONT })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: data.headline ? 60 : 120 }, children: [new TextRun({ text: data.contact, size: 20, font: FONT })] }),
        ...(data.headline ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: data.headline, italics: true, size: 22, font: FONT })] })] : []),
        ...data.sections.flatMap(sectionParagraphs),
      ],
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export const classicTemplate: Template = {
  id: 'classic',
  displayName: 'Classic',
  description: 'Traditional professional — serif fonts, formal layout',
  renderHtml,
  renderDocx,
};
