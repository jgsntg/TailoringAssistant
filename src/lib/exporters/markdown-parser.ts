import type { ResumeData, ResumeSection, ResumeContent, ExperienceEntry } from './types';

const SECTION_NAMES = new Set([
  'summary', 'experience', 'professional experience', 'skills', 'education',
  'selected impact', 'impact', 'work experience', 'certifications', 'awards',
  'projects', 'publications', 'volunteer', 'interests', 'languages',
]);

function isGenericSectionName(text: string): boolean {
  return SECTION_NAMES.has(text.toLowerCase().trim());
}

function parseSectionContent(lines: string[]): ResumeContent {
  const nonEmpty = lines.filter((l) => l.trim());
  if (nonEmpty.length === 0) return { type: 'paragraph', text: '' };

  // Experience: contains ### headings
  if (nonEmpty.some((l) => l.startsWith('###'))) {
    const entries: ExperienceEntry[] = [];
    let current: ExperienceEntry | null = null;

    for (const line of lines) {
      if (line.startsWith('###')) {
        if (current) entries.push(current);
        current = { heading: line.replace(/^###\s*/, '').trim(), bullets: [] };
      } else if (line.startsWith('- ') && current) {
        current.bullets.push(line.replace(/^-\s*/, '').trim());
      }
    }
    if (current) entries.push(current);
    return { type: 'experience', entries };
  }

  // Bullets: majority of lines start with "- "
  const bulletLines = nonEmpty.filter((l) => l.startsWith('- '));
  if (bulletLines.length > 0 && bulletLines.length >= nonEmpty.length * 0.6) {
    return { type: 'bullets', items: bulletLines.map((l) => l.replace(/^-\s*/, '').trim()) };
  }

  // Inline-list: single content line with • or | separators
  if (nonEmpty.length <= 3) {
    const joined = nonEmpty.join(' ');
    if (joined.includes('•') || joined.includes(' | ') || joined.includes(' · ')) {
      const sep = joined.includes('•') ? '•' : joined.includes(' | ') ? '|' : '·';
      return { type: 'inline-list', items: joined.split(sep).map((s) => s.trim()).filter(Boolean) };
    }
  }

  return { type: 'paragraph', text: nonEmpty.join('\n') };
}

export function parseResume(markdown: string): ResumeData {
  const lines = markdown.split('\n');
  let i = 0;

  // --- Name ---
  let name = '';
  while (i < lines.length && !name) {
    const l = lines[i].trim();
    if (l.startsWith('# ')) { name = l.replace(/^#\s*/, ''); i++; break; }
    if (l && !l.startsWith('#')) { name = l; i++; break; }
    i++;
  }

  // --- Contact ---
  let contact = '';
  while (i < lines.length && !contact) {
    const l = lines[i].trim();
    if (!l) { i++; continue; }
    if (l.startsWith('#')) break;
    contact = l; i++; break;
  }

  // --- Headline (optional H2 that's not a section name) ---
  let headline: string | undefined;
  // skip blanks
  while (i < lines.length && !lines[i].trim()) i++;
  if (i < lines.length && lines[i].startsWith('## ')) {
    const candidate = lines[i].replace(/^##\s*/, '').trim();
    if (!isGenericSectionName(candidate)) {
      headline = candidate;
      i++;
    }
  }

  // --- Sections ---
  const sections: ResumeSection[] = [];

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      const title = line.replace(/^##\s*/, '').trim();
      i++;
      const contentLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith('## ')) {
        contentLines.push(lines[i]);
        i++;
      }
      const content = parseSectionContent(contentLines);
      sections.push({ title, type: content.type, content });
    } else {
      i++;
    }
  }

  return { name: name || 'Unknown', contact: contact || '', headline, sections };
}
