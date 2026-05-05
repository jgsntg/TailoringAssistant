'use client';

import { useState } from 'react';
import type { ComparisonResult } from '@/lib/types';

type Props = {
  results: ComparisonResult[];
  onUseVersion: (result: ComparisonResult) => void;
  onStartOver: () => void;
};

function ComparisonColumn({
  result,
  onUseVersion,
}: {
  result: ComparisonResult;
  onUseVersion: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!result.tailoredResume) return;
    await navigator.clipboard.writeText(result.tailoredResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Sticky column header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 shrink-0">
        <p className="font-semibold text-gray-900">{result.modelDisplayName}</p>
        {result.stats && (
          <p className="text-xs text-gray-500 mt-0.5">
            {result.stats.totalChanges} changes applied
            {' · '}
            {result.stats.bullets} reframes
            {result.stats.summary ? `, 1 summary` : ''}
            {result.stats.additions ? `, ${result.stats.additions} additions` : ''}
            {result.stats.keywordGaps ? ` · ${result.stats.keywordGaps} keyword gaps` : ''}
          </p>
        )}
        {result.error && (
          <p className="text-xs text-red-600 mt-0.5">{result.error}</p>
        )}
      </div>

      {/* Scrollable markdown body */}
      <div className="flex-1 overflow-y-auto">
        {result.tailoredResume ? (
          <pre className="p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap text-gray-800">
            {result.tailoredResume}
          </pre>
        ) : (
          <div className="p-4 text-sm text-red-600">
            <p className="font-medium">This model failed</p>
            <p className="mt-1 text-gray-500">{result.error}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex gap-2 shrink-0">
        <button
          onClick={onUseVersion}
          disabled={!result.tailoringResponse}
          className="flex-1 px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Use this version →
        </button>
        <button
          onClick={handleCopy}
          disabled={!result.tailoredResume}
          className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function ComparisonView({ results, onUseVersion, onStartOver }: Props) {
  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold">Model comparison</h1>
        <button
          onClick={() => {
            if (confirm('Start over? The comparison results will be lost.')) onStartOver();
          }}
          className="text-sm text-gray-500 hover:text-gray-800 underline"
        >
          Start over
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        {results.map((result) => (
          <ComparisonColumn
            key={result.modelId}
            result={result}
            onUseVersion={() => onUseVersion(result)}
          />
        ))}
      </div>
    </div>
  );
}
