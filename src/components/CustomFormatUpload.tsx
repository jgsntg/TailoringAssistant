'use client';

import { useState, useEffect, useRef } from 'react';

type Status = { active: false } | { active: true; filename: string; uploadedAt: string };

export default function CustomFormatUpload() {
  const [status, setStatus] = useState<Status | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch('/api/export/custom-format-status');
    setStatus(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(file: File) {
    if (!file.name.endsWith('.docx')) {
      setError('File must be a .docx');
      return;
    }
    setError('');
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/export/upload-format', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    if (!confirm('Remove custom format?')) return;
    await fetch('/api/export/custom-format', { method: 'DELETE' });
    await load();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 mt-2">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Custom format <span className="text-xs font-normal text-slate-400 ml-1">(optional)</span></h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload a DOCX of your existing resume. The export module will reuse its formatting (fonts, margins, colors) when you choose &ldquo;Custom&rdquo; as the export style.
        </p>
      </div>

      {status === null ? (
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
      ) : status.active ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <svg className="h-5 w-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{status.filename}</p>
            <p className="text-xs text-slate-400">Uploaded {formatDate(status.uploadedAt)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="text-xs text-blue-600 hover:underline"
            >
              Replace
            </button>
            <button onClick={handleRemove} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 rounded-md border-2 border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 transition-colors"
          >
            {isUploading ? 'Uploading...' : '+ Upload .docx file'}
          </button>
          <p className="mt-1.5 text-xs text-slate-400">No custom format uploaded.</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }}
      />
    </div>
  );
}
