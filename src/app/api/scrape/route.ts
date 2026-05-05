import { NextResponse } from 'next/server';
import { scrapeJob } from '@/lib/scraper';

export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.url !== 'string' || !body.url.startsWith('http')) {
    return NextResponse.json({ error: 'invalid_request', message: 'url must be a valid http(s) URL' }, { status: 400 });
  }

  try {
    const result = await scrapeJob(body.url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scraping failed. Please paste the job description manually.';
    return NextResponse.json({ error: 'scrape_failed', message }, { status: 200 });
  }
}
