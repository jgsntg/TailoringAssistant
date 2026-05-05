export type AcceptedChange =
  | { type: 'summary'; original: string; revised: string }
  | { type: 'bullet'; section: string; original: string; revised: string }
  | { type: 'addition'; section: string; suggested_bullet: string };

export function applyChanges(baseResume: string, accepted: AcceptedChange[]): string {
  if (accepted.length === 0) return baseResume;

  const replacements = accepted.filter(
    (c): c is Extract<AcceptedChange, { type: 'summary' | 'bullet' }> =>
      c.type === 'summary' || c.type === 'bullet'
  );
  const additions = accepted.filter(
    (c): c is Extract<AcceptedChange, { type: 'addition' }> => c.type === 'addition'
  );

  let resume = baseResume;

  for (const change of replacements) {
    if (resume.includes(change.original)) {
      resume = resume.replace(change.original, change.revised);
    } else {
      console.warn(`Original text not found for change in section "${('section' in change ? change.section : 'Summary')}"`);
    }
  }

  for (const change of additions) {
    const lines = resume.split('\n');
    const sectionIndex = lines.findIndex((line) =>
      line.startsWith('###') && line.toLowerCase().includes(change.section.toLowerCase())
    );

    if (sectionIndex === -1) {
      resume +=
        `\n\n<!-- Could not locate section "${change.section}" — bullet appended below -->\n` +
        `- ${change.suggested_bullet}`;
      continue;
    }

    // Skip past the heading and any non-bullet prose lines
    let insertIndex = sectionIndex + 1;
    while (insertIndex < lines.length && lines[insertIndex] !== '' && !lines[insertIndex].startsWith('-')) {
      insertIndex++;
    }
    // Skip blank lines between heading and first bullet
    while (insertIndex < lines.length && lines[insertIndex] === '') {
      insertIndex++;
    }

    lines.splice(insertIndex, 0, `- ${change.suggested_bullet}`);
    resume = lines.join('\n');
  }

  return resume;
}
