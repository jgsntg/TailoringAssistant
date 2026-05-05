import { NextResponse } from 'next/server';
import { tailorResume } from '@/lib/tailor';

export async function POST(request: Request) {
  const body = await request.json();

  if (typeof body.resumeMd !== 'string' || !body.resumeMd.trim()) {
    return NextResponse.json({ error: 'invalid_request', message: 'resumeMd is required' }, { status: 400 });
  }
  if (typeof body.jobText !== 'string' || !body.jobText.trim()) {
    return NextResponse.json({ error: 'invalid_request', message: 'jobText is required' }, { status: 400 });
  }

  try {
    const result = await tailorResume(body.resumeMd, body.jobText);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/tailor] error:', err);
    const message =
      err instanceof SyntaxError
        ? 'The AI returned malformed JSON. Try again.'
        : err instanceof Error
        ? err.message
        : 'Tailoring failed. Try again.';
    return NextResponse.json({ error: 'tailor_failed', message }, { status: 500 });
  }
}
