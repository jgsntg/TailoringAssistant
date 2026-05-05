import Link from 'next/link';
import { listTailorings, getBaseResume } from '@/lib/storage';
import TailoringsList from '@/components/TailoringsList';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [tailorings, baseResume] = await Promise.all([listTailorings(), getBaseResume()]);

  const meta = tailorings.map(({ id, job_title, company, created_at }) => ({
    id,
    job_title,
    company,
    created_at,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* No base resume banner */}
      {!baseResume.trim() && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          You haven&apos;t saved a base resume yet.{' '}
          <Link href="/resume" className="font-medium underline hover:text-amber-900">
            Set up base resume
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved Tailorings</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/resume"
            className="text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Edit base resume
          </Link>
          <Link
            href="/tailor"
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            New tailoring
          </Link>
        </div>
      </div>

      <TailoringsList tailorings={meta} />
    </div>
  );
}
