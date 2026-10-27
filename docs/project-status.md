# Project status

## Identity

- Product: Suzhou Drive
- Local folder: `drive`
- Package: `suzhou-drive`
- GitHub: [`ZisIsNotZis/suzhou-drive`](https://github.com/ZisIsNotZis/suzhou-drive) (`origin`, SSH), public, default branch `master`.
- Classification: useful browser simulator (closed milestone).

## Status

Closed as a milestone (2026-09-29). The offline Suzhou driving simulator
reached its documented `roadmap-v2` 0.1.0 milestone; no active development is
planned unless the project's inputs or goals change.

## Evidence

The 2026-08-25 roadmap record reports 40 unit tests, a successful build, and 25 passed / 1 skipped E2E tests. The skip is the named-place fixture absent from the checked-in OSM extract. Screenshots for route guidance, weather and the road/traffic scene are preserved in [`docs/media/`](media/); the full record is [`.scratch/roadmap-v2/final-verification.md`](../.scratch/roadmap-v2/final-verification.md).

## Publication and rights

The software uses AGPL-3.0-only (see `LICENSE`). The OSM extract remains third-party data: any redistribution must carry the OpenStreetMap attribution and ODbL terms, which the README states.

## Deferred

An eligible named-place fixture and target-hardware FPS/memory measurements were
left undone; they would only be worth doing if the slice earns further
investment. Bilibili and arXiv are out of scope.
