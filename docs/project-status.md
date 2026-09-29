# Project status

## Identity

- Product: Suzhou Drive
- Local folder: `drive`
- Package: `suzhou-drive`
- GitHub slug: not assigned; the existing `origin` remote is preserved but has no URL.
- Classification: useful browser simulator (closed milestone).

## Status

Closed as a milestone (2026-09-29). The offline Suzhou driving simulator
reached its documented `roadmap-v2` 0.1.0 milestone; no active development is
planned unless the project's inputs or goals change.

## Evidence

The 2026-08-25 roadmap record reports 40 unit tests, a successful build, and 25 passed / 1 skipped E2E tests. The skip is the named-place fixture absent from the checked-in OSM extract. Screenshots were inspected for route guidance, weather, traffic, signals, and minimap presentation.

## Publication and rights

The repository is not being uploaded or renamed in this task. The software uses AGPL-3.0-only because no prior license decision existed. The OSM extract remains third-party data and needs its required attribution/license treatment before redistribution.

## Deferred

An eligible named-place fixture and target-hardware FPS/memory measurements were
left undone; they would only be worth doing if the slice earns further
investment. Bilibili and arXiv are out of scope.
