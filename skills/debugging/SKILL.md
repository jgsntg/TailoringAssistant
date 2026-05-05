---
name: debugging
description: Systematically diagnose and fix bugs in the Resume Tailor codebase, including TypeScript errors, runtime failures, API errors, and UI regressions.
---

## When to use

- `npm run build` fails with a type error
- A route returns an unexpected error or wrong shape
- A UI interaction doesn't behave as expected
- The LLM call fails or returns malformed JSON
- A DOCX/PDF export generates a corrupted file

---

## Steps

### 1. Reproduce and isolate
- Identify the exact symptom: error message, HTTP status, UI state
- Narrow to the smallest reproducible case
- Check browser console AND terminal (server-side errors appear in terminal, not browser)

### 2. Check the build first
```bash
npm run build
```
TypeScript errors often reveal the root cause before any runtime investigation.

### 3. Common failure patterns in this project

**LLM malformed JSON**
- Check `src/lib/llm/extract-json.ts` — is the response wrapped in code fences?
- Verify Zod schema matches actual AI output with `console.log(text)` before `JSON.parse`
- Test with a smaller input to isolate whether it's prompt-related or parsing-related

**Next.js 16 `params` error**
- Error: `params.id is not a string` or similar
- Fix: `const { id } = await params` (params is a Promise in Next.js 16)

**Storage file not found**
- `getBaseResume()` returns `''` on missing file — never throws. Check for empty string, not exception.
- `getTailoring(id)` returns `null` on missing file.

**Export binary response error**
- `Buffer` is not assignable to `BodyInit` — use `new Uint8Array(buffer)` in `new Response()`

**Puppeteer/Chromium launch failure**
- Verify `puppeteer` is in `serverExternalPackages` in `next.config.ts`
- Test: `await puppeteer.launch({ headless: true })` in isolation

### 4. Add targeted logging
- Server-side: `console.error('[route-name]', err)` — appears in terminal
- Client-side: `console.log` in component — appears in browser console
- Remove all debug logs before marking the fix complete

### 5. Fix → verify → clean up
```bash
npm run build    # must pass
# Test the specific scenario that was broken
# Remove any debug logging
```

---

## Examples

**Bug:** `/api/export/generate` returns 500 with "Cannot read properties of undefined"
→ Read `src/lib/exporters/markdown-parser.ts` — check what `parseResume()` returns for the failing input
→ Add `console.log(data)` after parse call to inspect the `ResumeData` object
→ Find which section type is `undefined` and add a null guard

**Bug:** Model selector shows no options
→ Check `/api/models` returns data: `curl -s http://localhost:3000/api/models`
→ If empty: check `.env.local` has `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` set
→ If 500: check `src/lib/llm/registry.ts` for instantiation errors

---

## Success Criteria

- `npm run build` passes with zero errors
- The specific bug scenario no longer reproduces
- No debug logging left in the codebase
- No new TypeScript errors introduced
