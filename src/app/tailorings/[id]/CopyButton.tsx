'use client';

import { useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
    >
      {copied ? 'Copied!' : 'Copy markdown'}
    </button>
  );
}
