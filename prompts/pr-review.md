# PR Review Template

Use this when reviewing a pull request or a completed task against Resume Tailor's standards.

---

## Review: [Feature / PR title]

**Reviewer:** [Agent or person]
**Date:** [YYYY-MM-DD]
**Status:** APPROVED | APPROVED WITH NOTES | CHANGES REQUESTED

---

## Checklist

### Build
- [ ] `npm run build` passes with zero errors and zero new warnings

### Architecture
- [ ] No direct `data/` reads/writes outside `src/lib/storage.ts`
- [ ] No `Anthropic`/`OpenAI` instantiation outside `src/lib/llm/`
- [ ] If schema changed: `types.ts` + `tailor.ts` + `tailor-system-prompt.ts` all updated
- [ ] No deferred features implemented without approval

### Next.js 16 correctness
- [ ] `params` is awaited before destructuring in pages and route handlers
- [ ] Pages reading live data have `export const dynamic = 'force-dynamic'`
- [ ] Binary API responses use `new Uint8Array(buffer)`, not raw `Buffer`

### TypeScript
- [ ] Zero `any` types (check with `grep -r ": any\|as any" src/`)
- [ ] No silent error swallowing (`catch {}` with no user-visible feedback)

### UI completeness
- [ ] Every new async action has a loading state
- [ ] Every new async action has a visible error state
- [ ] Every new list/data view has an empty state

### Code quality
- [ ] No TODO comments left in code
- [ ] No dead code or commented-out blocks
- [ ] No unnecessary abstractions beyond what the task requires

---

## Findings

### Blocking issues
<!-- Must be fixed before this is done -->

| Location | Issue | Required fix |
|----------|-------|-------------|
| `src/[file]:[line]` | [description] | [fix] |

### Notes (non-blocking)
<!-- Observations, suggestions, things to watch -->

- [observation]

---

## What was tested

| Scenario | Result |
|----------|--------|
| Happy path — [action] | ✓ / ✗ |
| Error path — [failure condition] | ✓ / ✗ |
| Edge case — [edge] | ✓ / ✗ |

---

## Verdict

**APPROVED** — all checks pass, no blocking issues.

**APPROVED WITH NOTES** — works correctly; notes above are for future consideration.

**CHANGES REQUESTED** — blocking issues above must be resolved. Re-review after fixes.
