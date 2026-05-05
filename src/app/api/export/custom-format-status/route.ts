import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CUSTOM_PATH = path.join(process.cwd(), 'data', 'custom-format.docx');
const META_PATH = path.join(process.cwd(), 'data', 'custom-format-meta.json');

export async function GET() {
  try {
    await fs.access(CUSTOM_PATH);
    let meta = { filename: 'custom-format.docx', uploadedAt: new Date().toISOString() };
    try {
      const raw = await fs.readFile(META_PATH, 'utf-8');
      meta = JSON.parse(raw);
    } catch { /* no meta file, use defaults */ }
    return NextResponse.json({ active: true, ...meta });
  } catch {
    return NextResponse.json({ active: false });
  }
}
