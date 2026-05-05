'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { TailoringResponse, ComparisonResult } from '@/lib/types';
import { applyChanges, type AcceptedChange } from '@/lib/apply-changes';
import TailoringReview from '@/components/TailoringReview';
import FinalResumeView from '@/components/FinalResumeView';
import ModelSelector from '@/components/ModelSelector';
import ComparisonView from '@/components/ComparisonView';

type Phase = 'input' | 'loading' | 'review' | 'final' | 'comparison';

type ModelInfo = { id: string; displayName: string; vendor: 'anthropic' | 'openai' };

function buildFinalResume(
  baseResume: string,
  response: TailoringResponse,
  acceptedIds: string[]
): string {
  const changes: AcceptedChange[] = [];

  if (acceptedIds.includes('summary') && response.summary_revision) {
    changes.push({
      type: 'summary',
      original: response.summary_revision.original,
      revised: response.summary_revision.revised,
    });
  }
  response.bullet_revisions.forEach((br, i) => {
    if (acceptedIds.includes(`bullet-${i}`)) {
      changes.push({ type: 'bullet', section: br.section, original: br.original, revised: br.revised });
    }
  });
  response.suggested_additions.forEach((sa, i) => {
    if (acceptedIds.includes(`addition-${i}`)) {
      changes.push({ type: 'addition', section: sa.section, suggested_bullet: sa.suggested_bullet });
    }
  });

  return applyChanges(baseResume, changes);
}

export default function TailorPage() {
  const [phase, setPhase] = useState<Phase>('input');

  // Base resume
  const [baseResume, setBaseResume] = useState('');
  const [baseResumeLoaded, setBaseResumeLoaded] = useState(false);

  // Model selection
  const [selectedModel, setSelectedModel] = useState('');
  const [usedModelName, setUsedModelName] = useState('');
  const [cameFromComparison, setCameFromComparison] = useState(false);

  // Comparison mode
  const [compareMode, setCompareMode] = useState(false);
  const [modelB, setModelB] = useState('');
  const [allModels, setAllModels] = useState<ModelInfo[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);

  // Input phase
  const [jobUrl, setJobUrl] = useState('');
  const [jobText, setJobText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  // Review phase
  const [tailoringResponse, setTailoringResponse] = useState<TailoringResponse | null>(null);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [tailorError, setTailorError] = useState('');

  // Final phase
  const [finalResume, setFinalResume] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/resume')
      .then((r) => r.json())
      .then((data: { content: string }) => {
        setBaseResume(data.content);
        setBaseResumeLoaded(true);
      });
    // Fetch models for compare defaults
    fetch('/api/models')
      .then((r) => r.json())
      .then((data: { models: ModelInfo[] }) => {
        setAllModels(data.models);
      });
  }, []);

  function handleToggleCompare(on: boolean) {
    setCompareMode(on);
    if (on && allModels.length > 0) {
      // Default B to first cross-vendor model
      const firstOpenAI = allModels.find((m) => m.vendor === 'openai');
      const firstAnthropic = allModels.find((m) => m.vendor === 'anthropic');
      if (firstOpenAI && selectedModel !== firstOpenAI.id) {
        setModelB(firstOpenAI.id);
      } else if (firstAnthropic && selectedModel !== firstAnthropic.id) {
        setModelB(firstAnthropic.id);
      } else {
        setModelB(allModels[0].id);
      }
    }
  }

  async function handleScrape() {
    setScrapeError('');
    setIsScraping(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      });
      const data = await res.json();
      if (data.error) {
        setScrapeError(data.message);
      } else {
        setJobText(data.jobText);
        if (data.jobTitle) setJobTitle(data.jobTitle);
        if (data.company) setCompany(data.company);
      }
    } catch {
      setScrapeError('Failed to reach the server. Please paste the job description manually.');
    } finally {
      setIsScraping(false);
    }
  }

  async function handleTailor() {
    setTailorError('');
    setPhase('loading');

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out after 60 seconds. Please try again.')), 60000)
    );

    try {
      const res = await Promise.race([
        fetch('/api/tailor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeMd: baseResume, jobText, model: selectedModel }),
        }),
        timeout,
      ]);

      const data = await res.json();
      if (data.error) {
        setTailorError(data.message);
        setPhase('input');
      } else {
        setTailoringResponse(data as TailoringResponse);
        setUsedModelName(data._modelName ?? '');
        setCameFromComparison(false);
        setPhase('review');
      }
    } catch (err) {
      setTailorError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPhase('input');
    }
  }

  async function handleCompare() {
    setTailorError('');
    setPhase('loading');

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Comparison timed out after 90 seconds. Please try again.')), 90000)
    );

    try {
      const res = await Promise.race([
        fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeMd: baseResume, jobText, modelA: selectedModel, modelB }),
        }),
        timeout,
      ]);

      const data = await res.json();
      if (data.error) {
        setTailorError(data.message);
        setPhase('input');
      } else {
        setComparisonResults(data.results);
        setPhase('comparison');
      }
    } catch (err) {
      setTailorError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPhase('input');
    }
  }

  function handleUseVersion(result: ComparisonResult) {
    if (!result.tailoringResponse) return;
    setTailoringResponse(result.tailoringResponse);
    setUsedModelName(result.modelDisplayName);
    setCameFromComparison(true);
    setSavedId(null);
    setPhase('review');
  }

  function handleShowFinal() {
    if (!tailoringResponse) return;
    const final = buildFinalResume(baseResume, tailoringResponse, acceptedIds);
    setFinalResume(final);
    setPhase('final');
  }

  async function handleCopyMarkdown() {
    if (!tailoringResponse) return;
    const final = buildFinalResume(baseResume, tailoringResponse, acceptedIds);
    await navigator.clipboard.writeText(final);
  }

  async function handleSave() {
    if (!tailoringResponse) return;
    setSaveError('');
    const final = finalResume || buildFinalResume(baseResume, tailoringResponse, acceptedIds);
    try {
      const res = await fetch('/api/tailorings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: jobTitle || 'Untitled role',
          company: company || 'Unknown company',
          job_url: jobUrl || undefined,
          job_text: jobText,
          base_resume_snapshot: baseResume,
          tailored_resume: final,
          tailoring_response: tailoringResponse,
          accepted_change_ids: acceptedIds,
        }),
      });
      const data = await res.json();
      if (data.id) setSavedId(data.id);
      else throw new Error('Save failed');
    } catch {
      setSaveError('Failed to save. Please try again.');
    }
  }

  const handleAcceptedUpdate = useCallback((ids: string[]) => {
    setAcceptedIds(ids);
  }, []);

  function resetToInput() {
    setPhase('input');
    setTailoringResponse(null);
    setComparisonResults([]);
    setSavedId(null);
    setCameFromComparison(false);
  }

  // ── Phase: Loading ──────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="text-lg font-medium">
          {compareMode ? 'Running both models in parallel...' : 'Analyzing job and tailoring resume...'}
        </p>
        <p className="text-sm text-gray-500">
          {compareMode ? 'This usually takes 15–30 seconds' : 'This usually takes 10–20 seconds'}
        </p>
      </div>
    );
  }

  // ── Phase: Comparison ───────────────────────────────────────────
  if (phase === 'comparison') {
    return (
      <ComparisonView
        results={comparisonResults}
        onUseVersion={handleUseVersion}
        onStartOver={resetToInput}
      />
    );
  }

  // ── Phase: Review ───────────────────────────────────────────────
  if (phase === 'review' && tailoringResponse) {
    return (
      <div className="flex flex-col gap-4 pb-32">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {jobTitle && company ? `${jobTitle} at ${company}` : 'Tailoring review'}
            </h1>
            {usedModelName && (
              <p className="mt-0.5 text-sm text-gray-500">
                {cameFromComparison
                  ? `Comparing then refining — started with ${usedModelName}`
                  : `Tailored with ${usedModelName}`}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              if (confirm('Start over? Your current review will be lost.')) resetToInput();
            }}
            className="text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Start over
          </button>
        </div>

        <TailoringReview
          response={tailoringResponse}
          onAcceptedChangesUpdate={handleAcceptedUpdate}
        />

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4">
          <div className="mx-auto max-w-4xl flex items-center gap-3">
            {saveError && <span className="text-sm text-red-600 mr-2">{saveError}</span>}
            <button
              onClick={handleShowFinal}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Show final resume
            </button>
            <button
              onClick={handleSave}
              disabled={!!savedId}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savedId ? 'Saved!' : 'Save this version'}
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Copy markdown
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: Final ────────────────────────────────────────────────
  if (phase === 'final') {
    const safeCompany = (company || '').replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    const safeTitle = (jobTitle || 'Resume').replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    const suggestedFilename = safeCompany ? `${safeCompany}-${safeTitle}-Resume` : safeTitle;
    return (
      <FinalResumeView
        markdown={finalResume}
        onBack={() => setPhase('review')}
        onSave={handleSave}
        suggestedFilename={suggestedFilename}
      />
    );
  }

  // ── Phase: Input ────────────────────────────────────────────────
  const canTailor = baseResume.trim().length > 0 && jobText.trim().length > 0;
  const canCompare = canTailor && !!selectedModel && !!modelB;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">New tailoring</h1>

      {/* No base resume warning */}
      {baseResumeLoaded && !baseResume.trim() && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Set up your base resume first before tailoring.{' '}
          <Link href="/resume" className="font-medium underline">Add base resume</Link>
        </div>
      )}

      {/* Compare toggle */}
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(e) => handleToggleCompare(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Compare two models</span>
        </label>
        {compareMode && (
          <p className="text-xs text-gray-400 ml-6">
            Comparison mode runs both models — costs ~2× a single tailoring.
          </p>
        )}
      </div>

      {/* Tailor error */}
      {tailorError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {tailorError}
        </div>
      )}

      {/* URL input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Job posting URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && jobUrl) handleScrape(); }}
            placeholder="https://..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleScrape}
            disabled={!jobUrl || isScraping}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isScraping ? 'Fetching...' : 'Fetch'}
          </button>
        </div>
        {scrapeError && <p className="text-sm text-red-600">{scrapeError}</p>}
        {jobTitle && company && (
          <p className="text-sm text-green-700 font-medium">Fetched: {jobTitle} at {company}</p>
        )}
      </div>

      {/* Paste fallback */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Or paste the job description</label>
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste the full job description here..."
          className="w-full h-48 rounded-md border border-gray-300 px-3 py-2 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Base resume info */}
      <div className="text-sm text-gray-500">
        {baseResumeLoaded ? (
          baseResume.trim() ? (
            <>
              Using base resume:{' '}
              <span className="font-medium text-gray-700">{baseResume.length.toLocaleString()} characters</span>{' '}
              <Link href="/resume" className="underline hover:text-gray-800">Edit</Link>
            </>
          ) : null
        ) : (
          'Loading base resume...'
        )}
      </div>

      {/* Model selectors + action */}
      {compareMode ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-4">
            <ModelSelector value={selectedModel} onChange={setSelectedModel} label="Model A" disabled={!canTailor} />
            <ModelSelector value={modelB} onChange={setModelB} label="Model B" disabled={!canTailor} />
            <button
              onClick={handleCompare}
              disabled={!canCompare}
              className="px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Compare models
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Both models will tailor in parallel. You&apos;ll see their full outputs side-by-side.
          </p>
        </div>
      ) : (
        <div className="flex items-end gap-4">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} disabled={!canTailor} label="Model" />
          <button
            onClick={handleTailor}
            disabled={!canTailor || !selectedModel}
            className="px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Tailor my resume
          </button>
        </div>
      )}
    </div>
  );
}
