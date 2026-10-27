# Contributing to Suzhou Drive

Thanks for helping. This project is a small, offline-first driving simulator; focused fixes and well-evidenced issues are welcome.

## Before you start

- Read [`AGENTS.md`](AGENTS.md) and the notes under [`docs/agents/`](docs/agents/) before changing behavior.
- Current roadmap status and verification live in [`.scratch/roadmap-v2/`](.scratch/roadmap-v2/). Do not maintain a second status summary elsewhere.
- The bundled `public/suzhou.osm` is the world. Keep the app working without external map services or runtime network access.

## Set up

Requires Node.js `^20.19.0` or `>=22.12.0` and npm.

```bash
npm ci
npm run dev
```

Open <http://localhost:5173>.

## Checks

Run these before opening a pull request:

```bash
npm test
npm run build
npx playwright install chromium   # once
npm run test:e2e -- --workers=1
```

The recorded 0.1.0 gate and its known skip are described in [`.scratch/roadmap-v2/final-verification.md`](.scratch/roadmap-v2/final-verification.md). Do not commit `dist/`, `test-results/`, `node_modules/` or local logs.

## Issues and pull requests

- Open an issue with reproduction steps, expected behavior and evidence (screenshot, log or test output).
- Keep a pull request focused on one change. Add or update tests when behavior or rules change.
- Preserve the renderer-independent modules where possible; `src/main.ts` is the integration owner.
- Humans review and merge. Agents may triage, investigate, test, document and implement accepted issues.

## License

By contributing, you agree that your contribution is licensed under the project's [AGPL-3.0-only](LICENSE) license. Map data remains subject to its own OpenStreetMap/ODbL terms as described in the [README](README.md#data-and-license).
