import { NextResponse } from 'next/server';
import { getAvailableProviders } from '@/lib/llm/registry';

export async function GET() {
  const models = getAvailableProviders().map((p) => ({
    id: p.id,
    displayName: p.displayName,
    vendor: p.vendor,
  }));
  return NextResponse.json({ models });
}
