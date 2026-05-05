import { NextResponse } from 'next/server';
import { getAvailableProviders, getProvider } from '@/lib/llm/registry';

export async function POST(request: Request) {
  const body = await request.json();
  const { resumeMd, jobText, model } = body;

  if (typeof resumeMd !== 'string' || !resumeMd.trim()) {
    return NextResponse.json({ error: 'invalid_request', message: 'resumeMd is required' }, { status: 400 });
  }
  if (typeof jobText !== 'string' || !jobText.trim()) {
    return NextResponse.json({ error: 'invalid_request', message: 'jobText is required' }, { status: 400 });
  }

  const providers = getAvailableProviders();
  if (providers.length === 0) {
    return NextResponse.json(
      { error: 'no_providers', message: 'No LLM providers configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.' },
      { status: 500 }
    );
  }

  const provider = model ? getProvider(model) : providers[0];
  if (!provider || !provider.isAvailable()) {
    return NextResponse.json(
      { error: 'invalid_model', message: `Model "${model}" is not available.` },
      { status: 400 }
    );
  }

  try {
    const result = await provider.tailorResume(resumeMd, jobText);
    return NextResponse.json({ ...result, _model: provider.id, _modelName: provider.displayName });
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
