import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CUSTOM_PATH = path.join(process.cwd(), 'data', 'custom-format.docx');
const META_PATH = path.join(process.cwd(), 'data', 'custom-format-meta.json');

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'invalid_file', message: 'No file provided.' }, { status: 400 });
  }
  if (!file.name.endsWith('.docx')) {
    return NextResponse.json({ error: 'invalid_file', message: 'File must be a .docx' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(path.dirname(CUSTOM_PATH), { recursive: true });
  await fs.writeFile(CUSTOM_PATH, buffer);
  await fs.writeFile(META_PATH, JSON.stringify({ filename: file.name, uploadedAt: new Date().toISOString() }));

  return NextResponse.json({ ok: true, filename: file.name });
}
