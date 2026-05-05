'use client';

type Props = { gaps: string[] };

export default function KeywordGapsBanner({ gaps }: Props) {
  if (gaps.length === 0) return null;

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
      <p className="text-sm font-semibold text-amber-800">Keyword gaps</p>
      <p className="mt-1 text-sm text-amber-700">
        Mentioned in the job, missing from your resume:{' '}
        <span className="font-medium">{gaps.join(', ')}</span>
      </p>
    </div>
  );
}
