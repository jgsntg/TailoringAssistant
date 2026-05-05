'use client';

import { useState, useEffect } from 'react';

type Props = {
  initialContent: string;
  onSave: (content: string) => Promise<void>;
};

type SaveStatus = 'saved' | 'unsaved' | 'saving';

export default function ResumeEditor({ initialContent, onSave }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(initialContent);
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus(content === saved ? 'saved' : 'unsaved');
  }, [content, saved]);

  async function handleSave() {
    setStatus('saving');
    setError('');
    try {
      await onSave(content);
      setSaved(content);
      setStatus('saved');
    } catch {
      setStatus('unsaved');
      setError('Save failed. Please try again.');
    }
  }

  const statusText: Record<SaveStatus, string> = {
    saved: 'Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved changes',
  };

  const statusColor: Record<SaveStatus, string> = {
    saved: 'text-green-600',
    saving: 'text-gray-400',
    unsaved: 'text-amber-600',
  };

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-[600px] rounded-lg border border-gray-300 p-4 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        placeholder="Paste your full resume in Markdown..."
        spellCheck={false}
      />
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={status === 'saving' || status === 'saved'}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
        <span className={`text-sm font-medium ${statusColor[status]}`}>{statusText[status]}</span>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
