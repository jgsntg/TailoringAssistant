import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTailoring } from '@/lib/storage';
import CopyButton from './CopyButton';

export const dynamic = 'force-dynamic';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function TailoringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tailoring = await getTailoring(id);
  if (!tailoring) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {tailoring.job_title} at {tailoring.company}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Saved {formatDate(tailoring.created_at)}
            {tailoring.job_url && (
              <>
                {' · '}
                <a
                  href={tailoring.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-700"
                >
                  View job posting
                </a>
              </>
            )}
          </p>
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 underline">
          Back to home
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Tailored resume</p>
          <CopyButton text={tailoring.tailored_resume} />
        </div>
        <textarea
          readOnly
          defaultValue={tailoring.tailored_resume}
          className="w-full h-[600px] rounded-lg border border-gray-300 p-4 font-mono text-sm leading-relaxed bg-gray-50 resize-y focus:outline-none"
        />
      </div>
    </div>
  );
}
