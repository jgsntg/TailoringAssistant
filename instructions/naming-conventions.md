# Naming Conventions

---

## Files and directories

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase `.tsx` | `ChangeCard.tsx` |
| Lib/util modules | camelCase `.ts` | `apply-changes.ts` |
| API routes | `route.ts` in directory | `api/tailor/route.ts` |
| Next.js pages | `page.tsx` in directory | `app/resume/page.tsx` |
| Skill files | `SKILL.md` in named dir | `skills/debugging/SKILL.md` |
| Agent files | kebab-case `.md` | `agents/senior-engineer.md` |

## TypeScript

| Thing | Convention | Example |
|-------|-----------|---------|
| Types and interfaces | PascalCase | `TailoringResponse`, `LLMProvider` |
| Functions | camelCase | `tailorResume()`, `applyChanges()` |
| Constants | camelCase (module-level) or SCREAMING_SNAKE (truly global config) | `ALL_PROVIDERS`, `SYSTEM_PROMPT` |
| React components | PascalCase | `ModelSelector`, `FinalResumeView` |
| CSS classes | Tailwind utilities only — no custom class names unless unavoidable |

## API routes

- Use kebab-case path segments: `/api/custom-format-status` not `/api/customFormatStatus`
- Stable error codes use `snake_case`: `'tailor_failed'`, `'scrape_failed'`, `'invalid_model'`
- Route handler functions named after HTTP method: `export async function GET()`, `POST()`, etc.

## State variables in React

- Boolean states: `is` or `has` prefix — `isLoading`, `hasError`, `isSaving`
- Error strings: `error` or `[noun]Error` — `error`, `scrapeError`, `saveError`
- Async results: noun — `tailoringResponse`, `comparisonResults`, `models`
- Phase strings: plain noun — `'input'`, `'loading'`, `'review'`, `'final'`

## LLM provider IDs

Format: `{vendor}-{model-nickname}` — `anthropic-sonnet`, `anthropic-opus`, `openai-gpt5`, `openai-gpt5-mini`

These IDs are stable UI identifiers stored in `localStorage` — do not change them once shipped.

## Exporter and template IDs

Template IDs: lowercase, single word — `'classic'`, `'modern'`, `'tech'`, `'custom'`
Export format IDs: `'docx'`, `'pdf'`

## Data file paths

- Base resume: `data/base-resume.md`
- Tailorings: `data/tailorings/{nanoid}.json`
- Custom format: `data/custom-format.docx`
- Custom format meta: `data/custom-format-meta.json`
