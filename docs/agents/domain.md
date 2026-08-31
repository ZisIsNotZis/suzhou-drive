# Domain Docs

How the engineering skills should consume this repo’s domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root, or
- **`CONTEXT-MAP.md`** at the repo root if it exists: it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you’re about to work in. In multi-context repos, also check `src/<context>/docs/adr/` for context-scoped decisions.

If any of these files don’t exist, proceed silently. Don’t flag their absence or suggest creating them upfront; `/domain-modeling` creates them lazily when terms or decisions actually get resolved.

## File structure

This is a single-context repository:

```
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary’s vocabulary

When output names a domain concept (in an issue title, refactor proposal, hypothesis, or test name), use the term as defined in `CONTEXT.md`. If the concept is not defined yet, note the gap for `/domain-modeling`.

## Roadmap source of truth

For current simulator roadmap status and verification evidence, read `.scratch/roadmap-v2/map.md` and the relevant files under `.scratch/roadmap-v2/issues/`. Do not maintain a second status summary in `docs/agents/`.

## Flag ADR conflicts

If output contradicts an existing ADR, surface it explicitly rather than silently overriding it.
