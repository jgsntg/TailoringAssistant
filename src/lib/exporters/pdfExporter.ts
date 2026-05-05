import { getTemplate } from './templates';
import type { ResumeData } from './types';

export async function exportToPdf(data: ResumeData, templateId: string): Promise<Buffer> {
  const template = getTemplate(templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  const html = template.renderHtml(data);

  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'Letter', printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
