# Feature Spec Template

Use this template when specifying a new feature for Resume Tailor before implementation begins.

---

## Feature: [Name]

### User story
As a user, I want **[action]** so that **[outcome]**.

### Problem being solved
[1-2 sentences on what's currently broken or missing and why it matters]

### In scope
- [Specific thing that will be built]
- [Specific thing that will be built]

### Out of scope (this iteration)
- [Thing that sounds related but won't be built now]
- [Deferred behavior]

---

## Acceptance criteria

- [ ] [Specific, testable condition — user can do X]
- [ ] [Specific, testable condition — system returns Y when Z]
- [ ] Loading state shown during [async operation]
- [ ] Error message shown when [failure condition]
- [ ] `npm run build` passes with zero errors

---

## UI states required

| State | Trigger | What user sees |
|-------|---------|----------------|
| Loading | [action] | [UI element] |
| Error | [failure] | [error message location] |
| Success | [completion] | [resulting UI] |
| Empty | [no data] | [empty state message] |

---

## API changes

| Route | Method | Request | Response |
|-------|--------|---------|----------|
| `/api/[route]` | POST | `{ field: type }` | `{ field: type }` |

Error shape: `{ error: 'stable_code', message: 'Human readable.' }`

---

## Files likely to change

- `src/lib/types.ts` — if new types needed (**check schema sync**)
- `src/lib/storage.ts` — if new data persisted
- `src/lib/llm/registry.ts` — if new provider
- `src/app/api/[route]/route.ts` — new or modified route
- `src/components/[Component].tsx` — new or modified component
- `src/app/[page]/page.tsx` — page-level changes

---

## Schema impact

- [ ] No schema change
- [ ] Schema change — requires updating `types.ts` + `tailor.ts` + `tailor-system-prompt.ts` together

---

## Open questions

1. [Question that needs answering before implementation]
