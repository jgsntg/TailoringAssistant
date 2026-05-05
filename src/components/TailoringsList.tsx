'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { TailoringMeta } from '@/lib/types';

type Props = { tailorings: TailoringMeta[] };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TailoringsList({ tailorings }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  if (tailorings.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No tailorings saved yet. Click &ldquo;New tailoring&rdquo; to start.
      </p>
    );
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete the tailoring for "${label}"? This cannot be undone.`)) return;
    setDeleting(id);
    setDeleteError('');
    try {
      const res = await fetch(`/api/tailorings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.refresh();
    } catch {
      setDeleteError('Failed to delete. Please try again.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      {deleteError && (
        <p className="text-sm text-red-600">{deleteError}</p>
      )}
    <ul className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white overflow-hidden">
      {tailorings.map((t) => {
        const label = `${t.job_title} at ${t.company}`;
        return (
          <li key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
            <Link href={`/tailorings/${t.id}`} className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate">{label}</span>
              <span className="text-xs text-gray-400">{formatDate(t.created_at)}</span>
            </Link>
            <button
              onClick={() => handleDelete(t.id, label)}
              disabled={deleting === t.id}
              className="ml-4 shrink-0 text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
            >
              {deleting === t.id ? 'Deleting…' : 'Delete'}
            </button>
          </li>
        );
      })}
    </ul>
    </>
  );
}
