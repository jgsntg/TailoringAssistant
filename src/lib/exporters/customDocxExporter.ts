import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { modernTemplate } from './templates/modern';
import type { ResumeData } from './types';

const CUSTOM_PATH = path.join(process.cwd(), 'data', 'custom-format.docx');

export async function exportToCustomDocx(data: ResumeData): Promise<Buffer> {
  // Generate a Modern-template DOCX as the base content
  const baseBuffer = await modernTemplate.renderDocx(data);

  // Extract styles.xml from the uploaded custom DOCX
  let stylesXml: string | null = null;
  let themeXml: string | null = null;
  try {
    const customBuffer = await fs.readFile(CUSTOM_PATH);
    const customZip = await JSZip.loadAsync(customBuffer);
    stylesXml = (await customZip.file('word/styles.xml')?.async('string')) ?? null;
    themeXml = (await customZip.file('word/theme/theme1.xml')?.async('string')) ?? null;
  } catch {
    throw new Error('Custom format file not found. Please upload a DOCX on the Base Resume page.');
  }

  if (!stylesXml) throw new Error('Custom DOCX has no styles.xml — cannot extract formatting.');

  // Transplant styles (and optionally theme) into the generated document
  const newZip = await JSZip.loadAsync(baseBuffer);
  newZip.file('word/styles.xml', stylesXml);
  if (themeXml) newZip.file('word/theme/theme1.xml', themeXml);

  return Buffer.from(await newZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}
