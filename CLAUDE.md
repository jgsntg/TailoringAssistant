@AGENTS.md

# Resume Tailor — Claude Code Guide

## What this project is

A single-user local web app (Next.js 16 App Router) that tailors a Markdown resume to job postings using the Anthropic API. The user reviews AI-suggested changes one at a time (accept/reject) and exports the final Markdown. No auth, no database, no deployment — `npm run dev` on localhost only.

---

## Stack (exact versions)

- Next.js **16.2.4** (App Router) + TypeScript 5 + React 19
- Tailwind CSS **v4** (PostCSS plugin — no `content` array config needed)
- `@anthropic-ai/sdk ^0.93.0` — model: **`claude-sonnet-4-6`**
- `cheerio ^1.2.0` — job scraping
- `nanoid ^5.1.11` — ID generation (ESM-only, works fine in App Router)
- `zod ^4.4.3` — AI response validation

---

## Next.js 16 patterns used in this project

### `params` is a Promise — always await it

Both pages and route handlers receive `params` as a `Promise`. Forgetting `await` is a silent type error.

```ts
// Page
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// Route handler
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### Route handlers return `Response.json()` or `NextResponse.json()`

Both work in Next.js 16. We use `NextResponse.json()` (imported from `next/server`) for consistency across the project.

### Server Actions

`'use server'` at the **function level** (inline) works inside server component files. The pattern used in `src/app/resume/page.tsx`:

```ts
async function saveResume(content: string) {
  'use server';
  await saveBaseResume(content);
}
```

For more complex actions, prefer a dedicated `src/app/actions.ts` file with `'use server'` at the top.

### `force-dynamic` on pages that read from disk

Pages that call `listTailorings()`, `getBaseResume()`, etc. must opt out of static generation:

```ts
export const dynamic = 'force-dynamic';
```

Already applied to `/` (home) and `/tailorings/[id]`.

### Tailwind v4

No `tailwind.config.ts` with a `content` array. The PostCSS plugin handles this automatically. Just use utility classes normally.

---

## Project conventions — read before changing anything

### Storage

**All file I/O goes through `src/lib/storage.ts`.** Never read/write `data/` files directly in route handlers or components. This abstraction exists so the storage layer can be swapped to SQLite/Supabase later with one file change.

The `data/` directory is gitignored. Storage functions use `{ recursive: true }` on `mkdir` calls — never assume the directory exists.

### Type schema — three places must stay in sync

The AI response shape is defined in three places simultaneously. Changing one without the others breaks the app:

1. `src/lib/types.ts` — `TailoringResponse` TypeScript type
2. `src/lib/tailor.ts` — `TailoringResponseSchema` (zod) and its inferred type
3. `src/prompts/tailor-system-prompt.ts` — the JSON schema described in the system prompt

**Do not change the JSON schema without updating all three and asking the user first.**

### System prompt

`src/prompts/tailor-system-prompt.ts` — do not edit without asking. The core rules (never invent, verbatim originals, additions as questions) are non-negotiable.

### AI model

`claude-sonnet-4-6` in `src/lib/tailor.ts`. Do not change the model without asking.

### `applyChanges` is a pure client-importable function

`src/lib/apply-changes.ts` has no server-only imports. It can be imported in client components (`'use client'`). Do not add `fs`, `path`, or other Node.js-only imports to it.

---

## File map

```
src/
├── app/
│   ├── layout.tsx              # Root layout — Nav + max-w-4xl wrapper
│   ├── page.tsx                # Home: saved tailorings list (force-dynamic)
│   ├── resume/page.tsx         # Base resume editor (server component + server action)
│   ├── tailor/page.tsx         # Main tailor flow — 4 client-side phases
│   ├── tailorings/[id]/
│   │   ├── page.tsx            # Read-only saved tailoring view (force-dynamic)
│   │   └── CopyButton.tsx      # Thin client component for clipboard
│   └── api/
│       ├── resume/route.ts     # GET/PUT base resume
│       ├── scrape/route.ts     # POST { url } → job text
│       ├── tailor/route.ts     # POST { resumeMd, jobText } → TailoringResponse
│       └── tailorings/
│           ├── route.ts        # GET list (metadata only), POST save
│           └── [id]/route.ts   # GET full, DELETE
├── components/
│   ├── Nav.tsx                 # Top nav — uses usePathname for active state
│   ├── ResumeEditor.tsx        # Textarea + save + dirty tracking
│   ├── ChangeCard.tsx          # Single accept/reject card
│   ├── KeywordGapsBanner.tsx   # Amber banner for keyword gaps
│   ├── TailoringReview.tsx     # List of ChangeCards with accept state
│   ├── FinalResumeView.tsx     # Read-only output + copy/save
│   └── TailoringsList.tsx      # Home page list with delete
├── lib/
│   ├── types.ts                # TailoringResponse, SavedTailoring, TailoringMeta
│   ├── storage.ts              # All file I/O (data/ directory)
│   ├── tailor.ts               # tailorResume() + TailoringResponseSchema (zod)
│   ├── scraper.ts              # ATS-aware fetch+cheerio scraper
│   ├── anthropic.ts            # SDK client singleton (fails loud if no API key)
│   └── apply-changes.ts        # Pure fn: base resume + accepted changes → final MD
└── prompts/
    └── tailor-system-prompt.ts # SYSTEM_PROMPT string — do not edit without asking
data/
├── .gitkeep
├── base-resume.md              # User's base resume (created on first save)
└── tailorings/*.json           # One file per saved tailoring
```

---

## Tailor page — phase state machine

`src/app/tailor/page.tsx` is a client component managing four phases with local state (no URL routing between phases):

| Phase | Trigger | Shows |
|-------|---------|-------|
| `input` | Initial / start over | URL input + paste textarea + Tailor button |
| `loading` | Click "Tailor my resume" | Spinner + 60s timeout |
| `review` | API responds | ChangeCards + sticky footer |
| `final` | Click "Show final resume" | Read-only textarea + copy/save |

Change IDs used for accept/reject:
- `'summary'` — summary revision
- `'bullet-0'`, `'bullet-1'`, … — bullet revisions
- `'addition-0'`, `'addition-1'`, … — suggested additions

Default state: reframes (summary + bullets) = **accepted**, additions = **rejected**.

---

## What NOT to build (deferred features)

Stop and ask before implementing any of these:

- Auth / accounts / multi-user
- Database (SQLite, Postgres, Supabase)
- PDF / DOCX export
- Headless browser scraping (Playwright)
- Multiple base resumes
- Inline editing of suggested text in ChangeCard
- Streaming API responses
- Cost / usage tracking
- Cover letter generation
- ATS match percentage
- Mobile UI
- Deployment / Docker / CI

---

## Key commands

```bash
npm run dev      # Start dev server (usually port 3001 if 3000 is occupied)
npm run build    # Type-check + production build — run after every change
```

Always run `npm run build` to verify type safety before reporting a task complete.
