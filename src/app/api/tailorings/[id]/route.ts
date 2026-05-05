import { NextResponse } from 'next/server';
import { getTailoring, deleteTailoring } from '@/lib/storage';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tailoring = await getTailoring(id);
  if (!tailoring) {
    return NextResponse.json({ error: 'not_found', message: 'Tailoring not found' }, { status: 404 });
  }
  return NextResponse.json(tailoring);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteTailoring(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'not_found', message: 'Tailoring not found' }, { status: 404 });
  }
}
