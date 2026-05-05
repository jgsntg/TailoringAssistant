# Coding Principles

These principles apply to all code written for Resume Tailor, by any agent or contributor.

---

## Simplicity over cleverness

Write the simplest code that correctly solves the problem. Three similar lines is better than a premature abstraction. A helper function earns its existence when the same logic appears in three or more places AND the abstraction makes each callsite clearer.

## No speculative design

Don't add parameters, options, or abstractions for hypothetical future requirements. Design for what's needed today. The codebase is small enough that refactoring when requirements actually change is cheap.

## Validate at boundaries, trust internally

Validate user input and third-party API responses (LLM output, scraped HTML). Trust your own functions. Don't add defensive null checks on values you set three lines earlier.

## Errors must be visible

Every async action that can fail must show the failure to the user. `console.error` alone is not error handling. The error pattern:
```ts
// Server: return a structured error
return NextResponse.json({ error: 'stable_code', message: 'Human readable.' }, { status: 500 });

// Client: display it
{error && <p className="text-sm text-red-600">{error}</p>}
```

## Async completeness

Every async user action needs three states: loading (show a spinner or disabled state), error (show the message), success (show the result). Missing any of these is a UI bug.

## Comments explain WHY, not WHAT

Default to no comments. Add one only when the code's intent is non-obvious: a hidden constraint, a workaround for a specific bug, behavior that would surprise a reader. Never describe what the code does — the code already does that.

## Imports are explicit

No barrel exports (`index.ts` re-exporting everything). Import directly from the file that defines the thing. This makes dependencies traceable and avoids circular import issues.

## Functions do one thing

A function that tailors a resume should not also write to disk. A storage function should not call the LLM. Mixing concerns is what makes code hard to change.
