---
name: feature-development
description: Build new features in Resume Tailor end-to-end — from reading the spec to a working, type-safe implementation with proper loading/error states.
---

## When to use

- Adding a new API route
- Adding a new UI component or page
- Adding a new export template
- Adding a new LLM provider
- Implementing a previously deferred feature (after explicit approval)

---

## Steps

### 1. Gate check — is this approved?
- Is the feature in the current spec? If not, stop and ask.
- Is the feature on the deferred list in AGENTS.md? If so, confirm with the user before proceeding.

### 2. Read before writing
- Read `AGENTS.md` for the architecture rules that apply
- Read the files you'll be modifying or that the feature depends on
- Identify the existing abstractions to reuse (storage.ts, llm/registry.ts, apply-changes.ts)

### 3. Plan — state the approach
For non-trivial features, write out:
- What files change and why
- What new files are created
- Any schema, system prompt, or type changes (these require all three files updated together)
- What UI states are needed: loading, error, empty, success

### 4. Build in this order
1. **Types first** — add to `src/lib/types.ts` if new data shapes are needed
2. **Storage/lib** — implement the core logic with no UI
3. **API route** — expose it via `/api/`
4. **UI component** — build the client-side
5. **Wire it up** — integrate into the page that uses it

### 5. For every API route, verify the error shape
```ts
// All errors must follow this shape
return NextResponse.json({ error: 'stable_code', message: 'Human readable.' }, { status: 400 });
```

### 6. For every async UI action, add all three states
```tsx
// Loading state
if (isLoading) return <Spinner />

// Error state — visible, not silent
{error && <p className="text-red-600">{error}</p>}

// Success state
{data && <Result data={data} />}
```

### 7. Verify
```bash
npm run build    # must pass with zero errors
```
Then manually test the happy path and at least one error path.

---

## Examples

**Adding a new ATS to the scraper:**
1. Read `src/lib/scraper.ts` to understand the pattern
2. Add URL detection to `detectAts()`
3. Add a new branch in `scrapeJob()` with the right selectors
4. Test with a real URL from that ATS
5. Run `npm run build`

**Adding a new export template:**
1. Read `src/lib/exporters/templates/classic.ts` as the reference
2. Create `src/lib/exporters/templates/[name].ts` with `renderHtml()` and `renderDocx()`
3. Add to `src/lib/exporters/templates/index.ts` registry
4. The `/api/export/templates` and `/api/export/generate` routes pick it up automatically

**Adding a new LLM provider:**
1. Implement `LLMProvider` interface from `src/lib/llm/types.ts`
2. Add to `src/lib/llm/registry.ts` — `ALL_PROVIDERS` array
3. Add `PROVIDER_API_KEY` to `.env.example` and `.env.local`
4. The `/api/models` endpoint and `ModelSelector` UI pick it up automatically

---

## Success Criteria

- `npm run build` passes with zero errors
- All three UI states (loading, error, success) are implemented
- No `any` types introduced
- Feature follows existing patterns (storage through `storage.ts`, LLM through `registry.ts`)
- Manual test of happy path and one error path passes
