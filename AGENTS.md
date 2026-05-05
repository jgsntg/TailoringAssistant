# Resume Tailor — Agent Configuration
> **Single source of truth.** All agents (Claude Code, Codex, etc.) read this file first.
> Compatible with: Claude Code, OpenAI Codex, and any agent that reads AGENTS.md.

---

## Project

Single-user local web app: paste a job URL → AI suggests resume changes → accept/reject per change → export DOCX/PDF. Runs on `npm run dev`. No auth, no database, no deployment target.

**v2 enhancements (built):** Multi-model selection (Anthropic + OpenAI), side-by-side comparison mode, DOCX/PDF export with Classic/Modern/Tech templates + custom DOCX style upload.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router) + TypeScript 5 + React 19 |
| Styling | Tailwind CSS v4 — no `tailwind.config.ts` content array needed |
| AI — Anthropic | `claude-sonnet-4-6`, `claude-opus-4-7` |
| AI — OpenAI | `gpt-5`, `gpt-5-mini` |
| Storage | Local JSON files in `data/` (gitignored) |
| Export | `docx` library + Puppeteer (PDF) + JSZip (custom styles) |
| Scraping | cheerio (ATS-aware: Greenhouse, Lever, Ashby, Workable, Stripe) |
| Validation | Zod v4 |

---

## Commands

```bash
npm run dev      # Dev server — port 3000 (or next available)
npm run build    # TypeScript check + production build — REQUIRED after every change
```

**Rule:** `npm run build` must pass with zero errors before any task is reported complete.

---

## Critical Architecture Rules

### 1. Storage — all I/O through one module
`src/lib/storage.ts` is the only place that reads/writes `data/`. Route handlers and components never touch `data/` directly. This abstraction exists for future SQLite/Supabase migration.

### 2. LLM — all calls through the registry
`src/lib/llm/registry.ts` holds all providers. Route handlers call `getProvider(id).tailorResume()`. Never instantiate `Anthropic` or `OpenAI` clients outside `src/lib/llm/`.

### 3. Schema sync — three files, always together
The AI response shape lives in three places simultaneously. Changing one without the others breaks the app silently:
- `src/lib/types.ts` — TypeScript types
- `src/lib/tailor.ts` — Zod schema (`TailoringResponseSchema`)
- `src/prompts/tailor-system-prompt.ts` — JSON schema in the prompt text

### 4. System prompt is locked
Do not edit `src/prompts/tailor-system-prompt.ts` without explicit user approval. The core rules (never invent facts, verbatim originals, additions as questions) are non-negotiable.

### 5. Markdown is canonical
DOCX/PDF are output-only transformations applied at export time. They are never generated during tailoring, review, or comparison. Templates live in `src/lib/exporters/templates/`.

### 6. Next.js 16 — breaking patterns
- `params` is a **Promise** — always `const { id } = await params` before use
- Pages reading live data: `export const dynamic = 'force-dynamic'`
- Route handlers: `NextResponse.json()` or `new Response()` with `new Uint8Array(buffer)` for binary

---

## File Map

```
src/
├── app/
│   ├── layout.tsx, page.tsx (home, force-dynamic)
│   ├── resume/page.tsx          (editor + custom format upload)
│   ├── tailor/page.tsx          (5-phase client flow: input/loading/review/comparison/final)
│   ├── tailorings/[id]/page.tsx (read-only, force-dynamic)
│   └── api/
│       ├── resume/, scrape/, tailor/, models/, compare/
│       ├── tailorings/, tailorings/[id]/
│       └── export/ (generate, templates, upload-format, custom-format, custom-format-status)
├── components/
│   ├── Nav, ResumeEditor, ChangeCard, KeywordGapsBanner
│   ├── TailoringReview, ComparisonView, FinalResumeView
│   ├── ModelSelector, ExportModal, CustomFormatUpload, TailoringsList
├── lib/
│   ├── types.ts           (TailoringResponse, SavedTailoring, ComparisonResult — LOCKED)
│   ├── storage.ts         (ALL file I/O)
│   ├── tailor.ts          (TailoringResponseSchema — LOCKED)
│   ├── apply-changes.ts   (applyChanges + applyAllChanges — pure, client-importable)
│   ├── scraper.ts         (ATS scraper)
│   ├── llm/               (types, registry, anthropic, openai, extract-json)
│   └── exporters/         (types, markdown-parser, docx/pdf exporters, templates/)
└── prompts/tailor-system-prompt.ts   (LOCKED)
data/                      (gitignored: base-resume.md, tailorings/*.json, custom-format.docx)
```

---

## API Contract

All error responses: `{ error: string, message: string }` + HTTP status code.
All success responses: `200` with the documented shape.
Binary responses (export): `Content-Type` + `Content-Disposition: attachment` headers.

---

## Agent Behavior

### DO
- Read relevant source files before making changes
- Run `npm run build` after every change; fix all errors before proceeding
- Show inline errors in UI — never silent failures
- Ask before touching: system prompt, JSON schema, or deferred features

### DO NOT
- Instantiate `Anthropic`/`OpenAI` outside `src/lib/llm/`
- Read/write `data/` outside `src/lib/storage.ts`
- Add `any` types or leave TODO comments in delivered code
- Implement deferred features without explicit approval

### Deferred — ask before building
Auth, database, headless browser scraping, multiple base resumes, inline ChangeCard editing, streaming responses, cost tracking, cover letters, ATS scoring, mobile UI, deployment/CI.

---

## Task Workflow

1. **Read** — understand the relevant files before acting
2. **Plan** — for non-trivial tasks, state the approach before implementing
3. **Build** — implement one concern at a time
4. **Verify** — run `npm run build`; fix errors before moving on
5. **Report** — what changed, what to test, any open questions
