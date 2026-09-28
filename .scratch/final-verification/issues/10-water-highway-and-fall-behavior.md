# Verify water, highway, and off-road physical behavior

Status: ready-for-human
Type: task

Verify that OSM water parsing does not incorrectly cover roads, roads over water remain drivable, highways/elevated roads have physically connected access, and leaving elevated roads produces realistic falling behavior.

Acceptance criteria:

- Water polygons do not incorrectly render over valid road surfaces.
- Bridge/highway surfaces support vehicle movement at their actual elevation.
- Driving off an elevated surface causes falling rather than invisible support.
- Entering water triggers a visible sinking animation before respawn.
- Water crossings and off-road cases have E2E tests and visual inspection.

## Verification

- Added deterministic `__driveDebug` hooks for water polygons/state, sinking, and falling.
- Roads use `roadHeightAt` for elevated crossing movement and water entry continues to exclude road surfaces.
- Elevated-road departure now enters a falling state; water entry sinks before respawn.
- E2E coverage: `e2e/water-highway.spec.ts`.

## Verification — 2026-08-25 — complete current suite

Full E2E: **22 passed, 0 failed, 1 skipped (23 total)**. All water/highway tests passed. Fresh `/tmp/water-sinking.png` and `/tmp/highway-fall.png` were inspected. No current automated blocker.
