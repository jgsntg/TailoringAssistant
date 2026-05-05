import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CUSTOM_PATH = path.join(process.cwd(), 'data', 'custom-format.docx');
const META_PATH = path.join(process.cwd(), 'data', 'custom-format-meta.json');

export async function DELETE() {
  try {
    await fs.unlink(CUSTOM_PATH);
    await fs.unlink(META_PATH).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'not_found', message: 'No custom format to remove.' }, { status: 404 });
  }
}
