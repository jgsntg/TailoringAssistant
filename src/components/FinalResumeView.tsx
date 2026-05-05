'use client';

import { useState } from 'react';
import ExportModal from './ExportModal';

type Props = {
  markdown: string;
  onBack: () => void;
  onSave: () => Promise<void>;
  suggestedFilename?: string;
};

export default function FinalResumeView({ markdown, onBack, onSave, suggestedFilename = 'Resume' }: Props) {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showExport, setShowExport] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Final tailored resume</h2>
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 underline">
          Back to review
        </button>
      </div>

      <textarea
        readOnly
        value={markdown}
        className="w-full h-[600px] rounded-lg border border-slate-300 p-4 font-mono text-sm leading-relaxed bg-white resize-y focus:outline-none shadow-sm"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
        >
          {copied ? 'Copied!' : 'Copy markdown'}
        </button>
        <button
          onClick={() => setShowExport(true)}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Export ↓
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || saved}
          className="px-4 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save this version'}
        </button>
      </div>

      {showExport && (
        <ExportModal
          markdown={markdown}
          suggestedFilename={`${suggestedFilename}.docx`}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
