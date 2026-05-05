import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { listTailorings, saveTailoring } from '@/lib/storage';
import type { SavedTailoring } from '@/lib/types';

export async function GET() {
  const tailorings = await listTailorings();
  const meta = tailorings.map(({ id, job_title, company, created_at }) => ({
    id,
    job_title,
    company,
    created_at,
  }));
  return NextResponse.json({ tailorings: meta });
}

export async function POST(request: Request) {
  const body = await request.json();

  const tailoring: SavedTailoring = {
    ...body,
    id: nanoid(),
    created_at: new Date().toISOString(),
  };

  await saveTailoring(tailoring);
  return NextResponse.json({ id: tailoring.id, created_at: tailoring.created_at });
}
