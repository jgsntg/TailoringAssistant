@AGENTS.md
@instructions/coding-principles.md
@instructions/naming-conventions.md
@instructions/safety-constraints.md

# Claude Code — Resume Tailor

> This file is Claude Code-specific. Cross-platform rules live in AGENTS.md (imported above).

---

## Next.js 16 — Read before writing any code

This is Next.js 16.2.4 with breaking API changes. Before writing route handlers or page components, check the relevant guide in `node_modules/next/dist/docs/`. Key patterns already confirmed for this project are in AGENTS.md.

---

## Specialized Agents (Claude Code only)

These live in `.claude/agents/` and are invoked via the Agent tool:

| Agent | When to use |
|-------|-------------|
| `prompt-tuner` | AI output is inventing facts, too bland, or keyword gaps are wrong |
| `scraper-fix` | A job URL fails to scrape or returns garbled text |
| `storage-migrator` | Migrating from local JSON files to SQLite or Supabase |
| `feature-builder` | Implementing any item from the deferred features list |

---

## Claude Preferences

- Concise responses — no trailing summaries of what was just done
- File references use markdown link syntax: `[filename.ts](src/path/filename.ts#L42)`
- Always run `npm run build` and show the result before declaring a task complete
- When something seems missing from the spec, ask — don't improvise

---

## Useful Debug Commands

```bash
# Check which LLM providers are active
curl -s http://localhost:3000/api/models | python3 -m json.tool

# Full dev server restart (clears cache)
pkill -f "next dev" && rm -rf .next && npm run dev

# Verify a specific API route
curl -s http://localhost:3000/api/resume | python3 -m json.tool
```

---

## Memory

Project memories: `~/.claude/projects/-Users-josesantiago-Workspaces-TailoringAssistant/memory/`
Check `MEMORY.md` in that directory at session start for user preferences.
