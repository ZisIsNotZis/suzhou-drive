# Agent instructions

## Workflow

- Use the simplest change that satisfies the request; inspect existing code and tests before adding abstractions or dependencies.
- For multiple substantial tasks, write a concise task list first, use the local Markdown tracker, and parallelize only disjoint work. Give delegated workers complete scope, acceptance criteria, test requirements, and a report format; workers do not delegate recursively.
- Use available tools directly for routine installs, downloads, browsers, and Playwright. Ask only for genuine permission, credential, environment, testing, or materially ambiguous requirement blockers.
- Finish the requested batch: run relevant unit tests, build, and E2E tests; inspect relevant visual artifacts; record exact evidence before claiming completion. A timeout or partial run is not completion.
- If a requirement is incomplete, contradictory, or risky, explain the smallest decision needed and ask before expanding scope.
- Respect an explicit “do not start” boundary.

## Repository references

- Issue conventions: `docs/agents/issue-tracker.md`
- Triage labels: `docs/agents/triage-labels.md`
- Domain documentation and ADR routing: `docs/agents/domain.md`
- Current roadmap, status, decisions, and verification: `.scratch/roadmap-v2/map.md`, `.scratch/roadmap-v2/issues/`, `.scratch/roadmap-v2/final-verification.md`

The roadmap files are the single source of truth for roadmap status and evidence. Do not duplicate project-status summaries in `AGENTS.md` or generic `docs/agents/` guidance.
