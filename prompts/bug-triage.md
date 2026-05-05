# Bug Triage Template

Use this template to structure a bug report and begin diagnosis before implementing a fix.

---

## Bug: [Short title]

### Symptom
[What the user sees or what output is wrong — be specific]

### Steps to reproduce
1. [Action]
2. [Action]
3. [Observe: ...]

### Expected behavior
[What should happen]

### Actual behavior
[What actually happens — include error messages verbatim]

---

## Diagnosis

### Where is the failure?
- [ ] Client — browser console error
- [ ] Server — terminal error (route handler or server component)
- [ ] TypeScript — `npm run build` fails
- [ ] AI/LLM — malformed response or Zod validation failure
- [ ] Storage — file read/write failure
- [ ] Export — DOCX/PDF generation failure

### Error details
```
[Paste the full error message and stack trace here]
```

### Likely location
| File | Why it's suspect |
|------|-----------------|
| `src/lib/[file].ts` | [reason] |
| `src/app/api/[route]/route.ts` | [reason] |

---

## Common causes by symptom

| Symptom | First place to look |
|---------|-------------------|
| `params.id is undefined` | Missing `await params` — Next.js 16 |
| `Cannot assign Buffer to BodyInit` | Use `new Uint8Array(buffer)` in `new Response()` |
| Zod validation failure | Log AI response text before parsing — check actual shape |
| Empty model selector | Check `.env.local` for `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` |
| Export 500 error | Run `curl -X POST /api/export/generate` with sample body |
| Scrape returns garbled text | Check ATS detection + selector in `scraper.ts` |
| Dark background on page | Check `globals.css` for overriding `background` rule |

---

## Fix plan

[1-3 sentences describing the fix before implementing it]

**Files to change:**
- `src/[file]` — [what changes]

**Verification:**
- `npm run build` passes
- [Specific test step to confirm fix]
- No new errors introduced
