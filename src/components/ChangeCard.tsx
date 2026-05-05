'use client';

type Props = {
  id: string;
  type: 'summary' | 'bullet' | 'addition';
  section: string;
  original?: string;
  revised: string;
  rationale: string;
  confirmationQuestion?: string;
  accepted: boolean;
  onToggle: (id: string, accepted: boolean) => void;
};

export default function ChangeCard({
  id,
  type,
  section,
  original,
  revised,
  rationale,
  confirmationQuestion,
  accepted,
  onToggle,
}: Props) {
  const isAddition = type === 'addition';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col gap-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isAddition
                ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {isAddition ? 'Suggested addition' : 'Reframe'}
          </span>
          <span className="text-sm font-medium text-gray-600 truncate">{section}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggle(id, true)}
            className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
              accepted
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-green-500 hover:text-green-700'
            }`}
          >
            Accept
          </button>
          <button
            onClick={() => onToggle(id, false)}
            className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
              !accepted
                ? 'bg-gray-700 text-white border-gray-700'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500 hover:text-gray-800'
            }`}
          >
            Reject
          </button>
        </div>
      </div>

      {/* Original */}
      {original && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Original</p>
          <p className="rounded bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700 leading-relaxed">
            {original}
          </p>
        </div>
      )}

      {/* Revised / Suggested */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
          {isAddition ? 'Suggested' : 'Revised'}
        </p>
        <p
          className={`rounded border px-3 py-2 text-sm leading-relaxed ${
            isAddition
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          {revised}
        </p>
      </div>

      {/* Rationale */}
      <p className="text-sm italic text-gray-500">{rationale}</p>

      {/* Confirmation question for additions */}
      {isAddition && confirmationQuestion && (
        <div className="rounded bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-sm text-amber-800">{confirmationQuestion}</p>
        </div>
      )}

      {/* Status */}
      <p className={`text-xs font-medium ${accepted ? 'text-green-600' : 'text-gray-400'}`}>
        {accepted ? '✓ Will be applied' : '✗ Will be skipped'}
      </p>
    </div>
  );
}
