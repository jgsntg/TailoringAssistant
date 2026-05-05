---
name: code-review
description: Review a change to Resume Tailor for correctness, architectural compliance, type safety, and UI completeness before it is considered done.
---

## When to use

- Before declaring a feature task complete
- When asked to review a specific file or change
- After a bug fix to ensure the fix doesn't introduce new issues
- Before updating the AGENTS.md or CLAUDE.md configuration

---

## Steps

### 1. Understand the intent
What was this change supposed to do? Read the task description or commit message before reading code.

### 2. Run the build
```bash
npm run build
```
If it fails, the review ends here. Fix the build first.

### 3. Check architecture compliance

| Rule | How to verify |
|------|--------------|
| All I/O through `storage.ts` | `grep -r "data/" src/ --include="*.ts" --include="*.tsx"` — only `storage.ts` should match |
| All LLM calls through registry | `grep -r "new Anthropic\|new OpenAI" src/` — should find nothing outside `src/lib/llm/` |
| `params` awaited | Search for `.params.id` or `.params.slug` without `await` |
| Schema sync | If `types.ts` changed, check `tailor.ts` and `tailor-system-prompt.ts` |

### 4. Check TypeScript quality
- Zero `any` types: `grep -r ": any\|as any" src/`
- No silent error swallowing: `catch {}` with no error handling
- All async functions properly awaited at call sites

### 5. Check UI completeness
For every user-triggered async action in the changed components:
- [ ] Loading state exists and is shown during the async operation
- [ ] Error state exists and is user-visible (not just `console.error`)
- [ ] Success state is clear and distinct from loading

### 6. Check for deferred features
Scan the change for anything on the deferred list: auth, database, headless browser, inline editing, streaming, cost tracking, cover letters, ATS scoring, mobile UI, deployment.

### 7. Form the verdict

**APPROVED** — no blocking issues  
**APPROVED WITH NOTES** — works correctly, non-blocking observations  
**CHANGES REQUESTED** — one or more blocking issues must be fixed

---

## Common Issues Found in This Project

- `params` not awaited (Next.js 16 — silent runtime error)
- `Buffer` passed directly to `new Response()` instead of `new Uint8Array(buffer)`
- Export template added to template file but not registered in `templates/index.ts`
- New LLM provider added but not added to `ALL_PROVIDERS` in `registry.ts`
- Error returned from API but not displayed in UI (silent failure)
- `data/` directory assumed to exist (use `{ recursive: true }` in `mkdir` calls)

---

## Success Criteria

- Build passes
- All blocking issues from the checklist are addressed
- Review output follows the format in `agents/reviewer.md`
