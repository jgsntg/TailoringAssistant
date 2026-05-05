import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/llm/registry';
import { applyAllChanges } from '@/lib/apply-changes';
import type { TailoringResponse, ComparisonResult } from '@/lib/types';

export async function POST(request: Request) {
  const body = await request.json();
  const { resumeMd, jobText, modelA, modelB } = body;

  if (!resumeMd || !jobText || !modelA || !modelB) {
    return NextResponse.json(
      { error: 'invalid_request', message: 'resumeMd, jobText, modelA, and modelB are required.' },
      { status: 400 }
    );
  }

  const providerA = getProvider(modelA);
  const providerB = getProvider(modelB);

  if (!providerA?.isAvailable() || !providerB?.isAvailable()) {
    return NextResponse.json(
      { error: 'invalid_model', message: 'One or both selected models are unavailable.' },
      { status: 400 }
    );
  }

  const [settledA, settledB] = await Promise.allSettled([
    providerA.tailorResume(resumeMd, jobText),
    providerB.tailorResume(resumeMd, jobText),
  ]);

  function buildResult(
    settled: PromiseSettledResult<TailoringResponse>,
    id: string,
    displayName: string
  ): ComparisonResult {
    if (settled.status === 'fulfilled') {
      const resp = settled.value;
      return {
        modelId: id,
        modelDisplayName: displayName,
        tailoringResponse: resp,
        tailoredResume: applyAllChanges(resumeMd, resp),
        stats: {
          totalChanges:
            (resp.summary_revision ? 1 : 0) +
            resp.bullet_revisions.length +
            resp.suggested_additions.length,
          bullets: resp.bullet_revisions.length,
          summary: resp.summary_revision ? 1 : 0,
          additions: resp.suggested_additions.length,
          keywordGaps: resp.keyword_gaps.length,
        },
        error: null,
      };
    }
    return {
      modelId: id,
      modelDisplayName: displayName,
      tailoringResponse: null,
      tailoredResume: null,
      stats: null,
      error: settled.reason instanceof Error ? settled.reason.message : String(settled.reason),
    };
  }

  return NextResponse.json({
    results: [
      buildResult(settledA, providerA.id, providerA.displayName),
      buildResult(settledB, providerB.id, providerB.displayName),
    ],
  });
}
