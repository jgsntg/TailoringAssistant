---
name: refactoring
description: Improve the internal structure of Resume Tailor code without changing external behavior — improving clarity, reducing duplication, or preparing for a known future change.
---

## When to use

- A function has grown beyond ~50 lines and has multiple responsibilities
- The same logic appears in 3+ places (copy-paste duplication)
- A module boundary is wrong (e.g., business logic in a route handler)
- Preparing for a migration (e.g., storage layer before adding SQLite)
- After a feature lands and the "make it work" code needs cleanup

## When NOT to use

- When there's no concrete quality problem — don't refactor for taste
- When the refactor changes observable behavior — that's a bug fix or feature
- On the system prompt, Zod schema, or type definitions without schema sync

---

## Steps

### 1. Define the goal
State exactly what structural problem you're fixing:
- "Extract X from Y because it's used in Z places"
- "Separate concerns: route handler should not contain parsing logic"
- "Prepare `storage.ts` for SQLite by making the interface explicit"

### 2. Confirm zero behavior change is the goal
Refactoring must not change what the code does. If you need to change behavior AND structure, do them in separate steps.

### 3. Read everything you'll touch
- Read all callers of the code being moved
- Read the tests (if any) — they define the contract
- Note: in this project there are no automated tests; manual behavior verification is required

### 4. Make the change
- Move or extract one thing at a time
- Keep existing function signatures where possible (rename only with full caller update)
- If moving code between files, update all imports before verifying

### 5. Verify no regressions
```bash
npm run build    # TypeScript catches most regressions
```
Then manually test the feature that was refactored.

---

## Constraints for this project

**Do not refactor:**
- `src/prompts/tailor-system-prompt.ts` — locked
- `src/lib/tailor.ts` (Zod schema) — locked unless schema change is approved
- `src/lib/types.ts` (TailoringResponse shape) — locked

**Safe to refactor:**
- Component internals (as long as props API stays the same)
- Route handler error handling patterns
- Storage function implementations (function signatures must stay the same)
- Exporter template internals

---

## Examples

**Extract JSON cleaning into shared util (already done):**
- `src/lib/llm/extract-json.ts` was extracted because both `AnthropicProvider` and `OpenAIProvider` needed the same logic

**Future: split tailor page into sub-components:**
- `src/app/tailor/page.tsx` has 5 phases — each could be its own component
- Props: the phase state machine lives in the parent; phases receive data + callbacks
- No behavior change, just component boundary clarity

---

## Success Criteria

- `npm run build` passes with zero errors
- The refactored feature behaves identically to before
- The structural problem stated in step 1 is resolved
- No new `any` types introduced
- No TODO comments left behind
