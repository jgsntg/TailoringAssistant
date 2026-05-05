import { NextResponse } from 'next/server';
import { TEMPLATES } from '@/lib/exporters/templates';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const customPath = path.join(process.cwd(), 'data', 'custom-format.docx');
  let customAvailable = false;
  try {
    await fs.access(customPath);
    customAvailable = true;
  } catch { /* not uploaded */ }

  return NextResponse.json({
    templates: TEMPLATES.map(({ id, displayName, description }) => ({ id, displayName, description })),
    customAvailable,
  });
}
