'use client';

import { useState, useEffect } from 'react';
import type { TailoringResponse } from '@/lib/types';
import ChangeCard from './ChangeCard';
import KeywordGapsBanner from './KeywordGapsBanner';

type Props = {
  response: TailoringResponse;
  onAcceptedChangesUpdate: (acceptedIds: string[]) => void;
};

function buildDefaults(response: TailoringResponse): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  if (response.summary_revision) defaults['summary'] = true;
  response.bullet_revisions.forEach((_, i) => { defaults[`bullet-${i}`] = true; });
  response.suggested_additions.forEach((_, i) => { defaults[`addition-${i}`] = false; });
  return defaults;
}

export default function TailoringReview({ response, onAcceptedChangesUpdate }: Props) {
  const [accepted, setAccepted] = useState<Record<string, boolean>>(() => buildDefaults(response));

  useEffect(() => {
    const ids = Object.entries(accepted)
      .filter(([, v]) => v)
      .map(([k]) => k);
    onAcceptedChangesUpdate(ids);
  }, [accepted, onAcceptedChangesUpdate]);

  function handleToggle(id: string, value: boolean) {
    setAccepted((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="flex flex-col gap-4">
      <KeywordGapsBanner gaps={response.keyword_gaps} />

      {response.summary_revision && (
        <ChangeCard
          id="summary"
          type="summary"
          section="Summary"
          original={response.summary_revision.original}
          revised={response.summary_revision.revised}
          rationale={response.summary_revision.rationale}
          accepted={accepted['summary'] ?? true}
          onToggle={handleToggle}
        />
      )}

      {response.bullet_revisions.map((br, i) => (
        <ChangeCard
          key={`bullet-${i}`}
          id={`bullet-${i}`}
          type="bullet"
          section={br.section}
          original={br.original}
          revised={br.revised}
          rationale={br.rationale}
          accepted={accepted[`bullet-${i}`] ?? true}
          onToggle={handleToggle}
        />
      ))}

      {response.suggested_additions.map((sa, i) => (
        <ChangeCard
          key={`addition-${i}`}
          id={`addition-${i}`}
          type="addition"
          section={sa.section}
          revised={sa.suggested_bullet}
          rationale={sa.rationale}
          confirmationQuestion={sa.requires_user_confirmation}
          accepted={accepted[`addition-${i}`] ?? false}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
