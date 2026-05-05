# Architecture Design Template

Use this template when designing a significant structural change — a new module, a storage migration, or a new integration — before any implementation begins.

---

## Design: [Name]

### Problem
[What structural problem does this solve? Why is the current state insufficient?]

### Constraints (non-negotiable)
- Markdown is canonical — no formatting during tailoring/review
- All I/O through `storage.ts`
- All LLM calls through `llm/registry.ts`
- Schema changes require updating `types.ts` + `tailor.ts` + system prompt together
- `npm run build` must pass at every step

---

## Proposal

### Approach
[1 paragraph describing the chosen approach and why it was chosen over alternatives]

### Key tradeoff
**Chose:** [approach A]
**Over:** [approach B]
**Because:** [concrete reason grounded in this project's constraints]

---

## File structure changes

```
src/
├── [new/changed file] — [purpose]
└── [new/changed file] — [purpose]
```

### Files that must NOT change (stable interfaces)
- `src/lib/storage.ts` — function signatures must remain identical
- `src/lib/llm/types.ts` — `LLMProvider` interface must remain identical
- `src/prompts/tailor-system-prompt.ts` — locked unless approved

---

## Migration path (if applicable)

This project uses local JSON file storage. If moving to a database:

| Step | What changes | What stays the same |
|------|-------------|-------------------|
| 1. Add dependency | `package.json` | All function signatures |
| 2. Rewrite `storage.ts` internals | File I/O logic | Public function API |
| 3. Update `.env.example` | New env vars | Application code |
| 4. Test each storage function | — | User behavior |

---

## Open questions before proceeding

1. [Question that must be answered before implementation]
2. [Dependency or constraint that needs verification]

---

## Success criteria

- [ ] `npm run build` passes at every step
- [ ] All existing functionality works identically after the change
- [ ] No changes to public APIs or user-visible behavior (unless intentional)
- [ ] New module follows existing patterns (error shape, async handling)
