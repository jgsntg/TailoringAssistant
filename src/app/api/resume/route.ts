import { NextResponse } from 'next/server';
import { getBaseResume, saveBaseResume } from '@/lib/storage';

export async function GET() {
  const content = await getBaseResume();
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  const body = await request.json();
  if (typeof body.content !== 'string') {
    return NextResponse.json({ error: 'invalid_request', message: 'content must be a string' }, { status: 400 });
  }
  await saveBaseResume(body.content);
  return NextResponse.json({ ok: true });
}
