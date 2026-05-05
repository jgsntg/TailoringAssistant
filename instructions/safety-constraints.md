# Safety Constraints

These constraints protect the user's data, the AI output quality, and the integrity of the system. They are non-negotiable.

---

## API key safety

- API keys live only in `.env.local` — gitignored
- Never log, echo, or return API keys in responses
- `.env.example` contains only placeholder empty values
- `src/lib/llm/anthropic.ts` and `src/lib/llm/openai.ts` fail loudly if keys are missing — don't suppress these errors

## AI output integrity

**The system prompt must not be changed without user approval.** The three non-negotiable rules in the prompt:
1. NEVER INVENT — no new facts, numbers, employers, credentials
2. PRESERVE TRUTH — original text must be quoted verbatim so the UI can locate and replace it
3. SUGGESTED ADDITIONS ARE QUESTIONS — not assertions; the user must confirm they have the experience

Violating these rules means the app could produce resumes with fabricated credentials — a serious harm to the user's credibility.

## Data isolation

- All user data is local to `data/` — no external uploads, no telemetry, no third-party storage
- The only outbound network calls are:
  - Anthropic API (tailoring, when Anthropic key is set)
  - OpenAI API (tailoring, when OpenAI key is set)
  - Target job URL (scraping, initiated by the user)

## Scope protection

The deferred features list in AGENTS.md is not a suggestion. Features like auth, database, and deployment change the security model of the app. Do not implement them without explicit user approval, even if they seem easy or obviously useful.

## Input validation

Validate all user-provided inputs at the API boundary:
- `url` must start with `http` before attempting to fetch
- `content` must be a string in PUT `/api/resume`
- File uploads must be `.docx` only
- Export `format` must be `'docx'` or `'pdf'`; `style` must be a known template ID

Never pass unvalidated user input directly to `fs.readFile`, shell commands, or SQL queries.

## No command injection

The scraper uses `fetch` with a fixed User-Agent string. The URL is fetched as-is — no shell execution. If Playwright is ever added, ensure URLs are passed as arguments, never interpolated into shell strings.

## Error messages

Error messages shown to the user must not leak:
- File system paths
- Internal stack traces
- API key prefixes or partial values
- Raw database errors (when a database is added)

Map internal errors to user-friendly messages at the API boundary.

## Reversible actions

The delete operation (`DELETE /api/tailorings/[id]`) is irreversible. The UI must prompt for confirmation before calling it. This is already implemented — do not remove the confirm dialog.
