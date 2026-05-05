'use client';

import { useState, useEffect } from 'react';

type TemplateInfo = { id: string; displayName: string; description: string };

type Props = {
  markdown: string;
  suggestedFilename: string;
  onClose: () => void;
};

export default function ExportModal({ markdown, suggestedFilename, onClose }: Props) {
  const [format, setFormat] = useState<'docx' | 'pdf'>('docx');
  const [style, setStyle] = useState('modern');
  const [filename, setFilename] = useState(suggestedFilename);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [customAvailable, setCustomAvailable] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/export/templates')
      .then((r) => r.json())
      .then((d) => {
        setTemplates(d.templates ?? []);
        setCustomAvailable(d.customAvailable ?? false);
      });
  }, []);

  // Keep filename extension in sync with format
  useEffect(() => {
    setFilename((prev) => {
      const base = prev.replace(/\.(docx|pdf)$/i, '');
      return `${base}.${format}`;
    });
  }, [format]);

  async function handleGenerate() {
    setError('');
    setIsGenerating(true);
    try {
      const res = await fetch('/api/export/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, format, style, filename }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? 'Export failed.');
      }

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed. Try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Export resume</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Format */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-700">Format</p>
            <div className="flex gap-4">
              {(['docx', 'pdf'] as const).map((f) => (
                <label key={f} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-800">{f.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-slate-700">Style</p>
            <div className="relative">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full appearance-none rounded-lg border-2 border-slate-300 bg-white pl-3 pr-9 py-2 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.displayName} — {t.description}</option>
                ))}
                {customAvailable && (
                  <option value="custom">Custom (your uploaded DOCX)</option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {style === 'custom' && format === 'pdf' && (
              <p className="text-xs text-amber-600">Custom PDF export requires LibreOffice installed on your system.</p>
            )}
          </div>

          {/* Filename */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="rounded-lg border-2 border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !filename.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating…
              </>
            ) : (
              <>↓ Generate</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
