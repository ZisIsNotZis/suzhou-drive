# Restore and verify global roadside decorations

Status: ready-for-human
Type: task

Ensure generated trees, lamps, and buildings are present throughout the loaded map rather than only near the initial spawn.

Acceptance criteria:

- Decorations stream or generate globally as the player travels.
- Trees and lamps are placed beside roads, never on road surfaces, water, buildings, or other objects.
- Generated buildings and trees avoid OSM geometry and one another.
- Far-area Playwright navigation proves decorations continue beyond the spawn region.

## Verification

Implemented in `src/main.ts`:

- The procedural grid covers the complete transformed OSM extent, including both extent boundaries, with deterministic placement and a 32 m spacing.
- Roadside sampling uses a maximum 24 m interval along every rendered road segment, placing trees and lamps on both sides outside the road clearance.
- Placement rejects points inside every OSM water and building polygon, then applies the existing obstacle-grid check so generated decorations and existing colliders cannot overlap.
- Existing `renderStats.colliders` reporting remains intact. `__driveDebug.readDecorationStats()` exposes rendered tree/lamp/building counts for browser verification.

Evidence:

- `npm test`: 24 tests passed, 0 failed.
- `npm run build`: TypeScript and Vite build passed. Vite emitted only the existing chunk-size warning.

Limitations:

- Playwright browser verification was not run in this pass; no screenshot or far-area E2E evidence is available. The implementation is a one-shot full-extent generation pass rather than runtime streaming, which satisfies the loaded-map coverage requirement but does not add decoration generation for newly fetched map tiles.

## Verification — 2026-08-25 — complete current suite

`npm test`: **24 passed, 0 failed, 0 skipped**. `npm run build`: **passed** (existing chunk-size warning). `npm run test:e2e -- --workers=1`: **22 passed, 0 failed, 1 skipped (23 total)**. The decoration test passed its global-span and clearance assertions and produced `/tmp/decorations-global.png`, which was visually inspected. Prior browser-verification limitation is superseded. Remaining scope limitation: one-shot loaded-extract generation, not streaming newly fetched tiles.
