# Testing Philosophy

---

## Current state

Resume Tailor has no automated test suite. The build (`npm run build`) is the primary correctness gate — it catches type errors, broken imports, and invalid Next.js patterns. Manual testing is the verification method for behavior.

This is intentional for a local single-user tool at this stage. When a test suite is added, the approach below applies.

---

## Manual testing protocol (current)

For every change, verify:

1. **Build passes** — `npm run build` with zero errors
2. **Happy path** — the primary user flow for the changed feature works
3. **Error path** — at least one failure scenario is handled visibly
4. **No regression** — adjacent features still work (e.g., changing `/api/tailor` shouldn't break `/api/compare`)

### Smoke test commands
```bash
# Verify API routes are live
curl -s http://localhost:3000/api/resume | python3 -m json.tool
curl -s http://localhost:3000/api/models | python3 -m json.tool
curl -s http://localhost:3000/api/tailorings | python3 -m json.tool
```

---

## When a test suite is added

### What to test and what not to

**Test:** Pure functions with clear inputs/outputs
- `applyChanges()` in `apply-changes.ts` — the spec includes a full test case list
- `parseResume()` in `exporters/markdown-parser.ts` — parser logic
- `extractJson()` in `llm/extract-json.ts` — edge cases in response cleaning
- `detectAts()` in `scraper.ts` — URL pattern matching

**Do not test:** Next.js internals, React rendering behavior, or the Anthropic/OpenAI APIs themselves.

**Integration test boundary:** The storage layer (`storage.ts`) — test against real file I/O, not mocks. The previous project had mock tests that passed while a real storage migration failed. Use real files.

### Test file location
Co-locate tests with the module they test: `apply-changes.test.ts` next to `apply-changes.ts`.

### Test naming
```ts
describe('applyChanges', () => {
  it('replaces original text with revised text', () => { ... })
  it('returns base resume unchanged for empty accepted array', () => { ... })
  it('logs a warning when original text is not found', () => { ... })
})
```

---

## What the spec defines as test cases for `applyChanges`

The spec (`examples/apply-changes-logic.md`) defines these required cases:
1. Single bullet revision — text is replaced
2. Summary revision — text is replaced
3. Suggested addition into existing section — inserted as first bullet
4. Suggested addition into non-existent section — appended with comment
5. Original text not found — resume returned unchanged for that change
6. Mixed — multiple changes applied in correct order
7. Empty accepted array — no-op

These should be the first tests written when a test runner is added.
