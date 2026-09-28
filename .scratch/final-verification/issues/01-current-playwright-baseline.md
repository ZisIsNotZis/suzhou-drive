# Establish current Playwright baseline

Status: ready-for-human
Type: task

Run the complete Playwright suite against the current source and preserve exact pass/failure output. The previous passing run predates later geometry and optimization changes; the latest run was interrupted, so current E2E status is unknown.

Acceptance criteria:

- Full current Playwright suite completes.
- Results are recorded in a comment or verification note.
- Any failure has a reproducing test and a linked follow-up ticket.

## Verification — 2026-08-25

Command:

```text
npm run test:e2e
```

The first sandboxed attempt could not start Vite: `listen EPERM: operation not permitted 127.0.0.1:5175`. After granting localhost server permission, the same command completed against the configured Vite server.

Result: **7 failed, 6 passed (13 total), 3.9m**, one worker. This is not a green baseline.

Passed:

- bridge segments join without a second floating deck and small poles stay small
- loaded map still renders elevated road surfaces
- bridge is visually inspectable at a real elevated map location
- bridge height follows the ramp instead of dropping at the endpoint
- bridge height is smooth at the real named crossings
- collision response keeps player heading and separates without a teleport

Failed:

- `camera rises with the road elevation` — 30s timeout waiting for `__driveDebug.isMapReady()`.
- `real map exposes decoration, named roads, signals and elevated roads` — expected roadside decorations `> 10`, received `0`.
- `decorations are global roadside objects with geometry-aware clearance` — 30s timeout waiting for `__driveDebug.readDecorations`.
- `navigation search draws a route without teleporting the player` — 30s timeout waiting for `__driveDebug.isMapReady()`.
- `rain mode displays active weather particles` — 30s timeout waiting for `__driveDebug.isMapReady()`.
- `driving keys do not move or focus the regen control` — 30s timeout waiting for `__driveDebug.isMapReady()`.
- `navigation search accepts a named OSM place` — 30s timeout waiting for `__driveDebug.isMapReady()`.

Evidence from the failed-page snapshots reports `Map: OSM load failed`. The decoration assertion’s page snapshot also shows the fallback UI and `0` roadside decorations. Playwright error contexts are preserved at:

- `test-results/camera-bridge-camera-rises-with-the-road-elevation/error-context.md`
- `test-results/camera-bridge-real-map-exp-141df--signals-and-elevated-roads/error-context.md`
- `test-results/camera-bridge-decorations--d3298-th-geometry-aware-clearance/error-context.md`
- `test-results/camera-bridge-navigation-s-515fa-hout-teleporting-the-player/error-context.md`
- `test-results/camera-bridge-rain-mode-displays-active-weather-particles/error-context.md`
- `test-results/camera-bridge-driving-keys-eda04--or-focus-the-regen-control/error-context.md`
- `test-results/camera-bridge-navigation-search-accepts-a-named-OSM-place/error-context.md`

Screenshots produced during passing tests: `/tmp/bridge-final.png` and `/tmp/map-final.png`. `/tmp/decorations-global.png` was not produced because its test timed out before the screenshot step. `/tmp/rain-final.png` exists on disk but was not produced by this run because the rain test timed out before its screenshot step; treat it as a pre-existing/stale artifact.

Follow-up references: decoration failures correspond to [05-global-decoration-generation.md](05-global-decoration-generation.md); navigation/readiness failures correspond to [07-player-navigation-minimap-search.md](07-player-navigation-minimap-search.md). No application files or E2E tests were changed; the existing collision test supplies the cheap deterministic regression probe. Changed file: `.scratch/final-verification/issues/01-current-playwright-baseline.md` only.

## Verification — 2026-08-25 — stopped at user request

Command:

```text
npm run test:e2e
```

This was run against the current source after the worker edits. It started at approximately `2026-08-25T15:40:15+08:00` and was stopped at the user's request at approximately `2026-08-25T15:45:29+08:00`; it did not reach the ten-minute limit and did not complete the suite.

Exact Playwright state at interruption: **17 failed, 1 interrupted, 5 did not run (23 total)**. The process exited with code `1` after SIGINT. Five workers were running. No application code or E2E tests were edited.

Failed tests and exact failure point:

- `e2e/camera-bridge.spec.ts:3:1 › camera rises with the road elevation` — 30s timeout waiting for `__driveDebug.isMapReady()`.
- `e2e/camera-bridge.spec.ts:14:1 › bridge segments join without a second floating deck and small poles stay small` — 30s timeout waiting for `__driveDebug.readRoads`.
- `e2e/camera-bridge.spec.ts:30:1 › loaded map still renders elevated road surfaces` — 30s timeout waiting for `__driveDebug.readElevatedSurfaceCount`.
- `e2e/camera-bridge.spec.ts:42:1 › bridge is visually inspectable at a real elevated map location` — 30s timeout waiting for `__driveDebug.readRoads`.
- `e2e/camera-bridge.spec.ts:58:1 › bridge height follows the ramp instead of dropping at the endpoint` — 30s timeout waiting for `__driveDebug.readRoads`.
- `e2e/camera-bridge.spec.ts:74:1 › bridge height is smooth at the real named crossings` — 30s timeout waiting for `__driveDebug.readRoads`.
- `e2e/camera-bridge.spec.ts:91:1 › real map exposes decoration, named roads, signals and elevated roads` — 30s timeout waiting for `__driveDebug.readRoads`.
- `e2e/camera-bridge.spec.ts:104:1 › decorations are global roadside objects with geometry-aware clearance` — 30s timeout waiting for `__driveDebug.readDecorations`.
- `e2e/camera-bridge.spec.ts:118:1 › navigation search draws a route without teleporting the player` — 30s timeout waiting for `__driveDebug.isMapReady()`.
- `e2e/collider-geometry.spec.ts:3:1 › collider audit matches representative rendered footprints` — 30s timeout waiting for `__driveDebug.isMapReady()`.
- `e2e/traffic-routing.spec.ts:8:1 › traffic has centered right-side lanes and progresses its routes` — 30s timeout in `beforeEach`, waiting for `__driveDebug.isMapReady()`.
- `e2e/traffic-routing.spec.ts:18:1 › traffic stops at a red signal node` — 30s timeout in `beforeEach`, waiting for `__driveDebug.isMapReady()`.
- `e2e/traffic-signals-signs.spec.ts:3:1 › map exposes visible signals, live countdowns, conservative signs and mapped arrows` — 30s timeout waiting for `__driveDebug.isMapReady()`.
- `e2e/traffic-signals-signs.spec.ts:22:1 › traffic observes a forced red signal phase` — 30s timeout waiting for `__driveDebug.isMapReady()`.
- `e2e/water-highway.spec.ts:8:1 › roads over water keep their road elevation and water remains classified` — 30s timeout in `beforeEach`, waiting for `__driveDebug.isMapReady()`.
- `e2e/water-highway.spec.ts:23:1 › water entry sinks visibly before respawn` — 30s timeout in `beforeEach`, waiting for `__driveDebug.isMapReady()`.
- `e2e/water-highway.spec.ts:36:1 › leaving an elevated road enters a visible falling state` — 30s timeout in `beforeEach`, waiting for `__driveDebug.isMapReady()`.

Interrupted test:

- `e2e/camera-bridge.spec.ts:130:1 › OSM minimap shows roads and tracks the player without search teleport` — `Test ended` while waiting for `__driveDebug.isMapReady()`.

Not run: 5 tests, because the suite was interrupted before Playwright scheduled them.

Artifacts produced or preserved by this run:

- Playwright error contexts: `test-results/camera-bridge-camera-rises-with-the-road-elevation/error-context.md`, `test-results/camera-bridge-bridge-segme-ef3c3--and-small-poles-stay-small/error-context.md`, `test-results/camera-bridge-loaded-map-s-9712f-ders-elevated-road-surfaces/error-context.md`, `test-results/camera-bridge-bridge-is-vi-28e3e--real-elevated-map-location/error-context.md`, `test-results/camera-bridge-bridge-heigh-a7d66-of-dropping-at-the-endpoint/error-context.md`, `test-results/camera-bridge-bridge-heigh-06b14-at-the-real-named-crossings/error-context.md`, `test-results/camera-bridge-real-map-exp-141df--signals-and-elevated-roads/error-context.md`, `test-results/camera-bridge-decorations--d3298-th-geometry-aware-clearance/error-context.md`, `test-results/camera-bridge-navigation-s-515fa-hout-teleporting-the-player/error-context.md`, `test-results/collider-geometry-collider-1168b-ntative-rendered-footprints/error-context.md`, `test-results/traffic-routing-traffic-ha-a42a1-s-and-progresses-its-routes/error-context.md`, `test-results/traffic-routing-traffic-stops-at-a-red-signal-node/error-context.md`, `test-results/traffic-signals-signs-map--98393-ive-signs-and-mapped-arrows/error-context.md`, `test-results/traffic-signals-signs-traf-2db61-s-a-forced-red-signal-phase/error-context.md`, `test-results/water-highway-roads-over-w-96eb5-nd-water-remains-classified/error-context.md`, `test-results/water-highway-water-entry-sinks-visibly-before-respawn/error-context.md`, `test-results/water-highway-leaving-an-e-10970-ers-a-visible-falling-state/error-context.md`, and `test-results/camera-bridge-OSM-minimap--2ddb6-yer-without-search-teleport/error-context.md`.
- Playwright run metadata: `test-results/.last-run.json`.
- No new screenshots were produced before interruption. Existing `/tmp/bridge-final.png`, `/tmp/map-final.png`, and `/tmp/rain-final.png` are not attributable to this run; `/tmp/rain-final.png` is explicitly stale from the prior verification.

Blocker: all executed tests depend on map initialization and/or debug methods that never became available in this run. The failure is therefore consistent with the app's map-load/readiness failure (the prior run's snapshots reported `Map: OSM load failed`), not evidence that the individual geometry, traffic, water, or navigation assertions pass. The smallest follow-up is to investigate/fix the map-load/readiness path (or, if the debug API was intentionally removed, update the tests' readiness contract); then rerun the complete suite. No failures were masked. `npm test` and `npm run build` were not run.

## Verification — 2026-08-25 — complete current suite

Commands: `npm test`, `npm run build`, `npm run test:e2e -- --workers=1`.

Exact results: unit **24 passed, 0 failed, 0 skipped, 0 todo**; build **passed** (existing Vite warning: 566.00 kB minified JS chunk); E2E **22 passed, 0 failed, 1 skipped (23 total), 4.6m**, exit 0. The sole skip is the intentional named-place test at `e2e/camera-bridge.spec.ts:210`, because the bundled extract exposes no named place through `readPlaceName()`.

Previous readiness failures are cleared. No application or E2E files changed. Fresh screenshots produced and inspected: `/tmp/bridge-final.png`, `/tmp/map-final.png`, `/tmp/decorations-global.png`, `/tmp/navigation-minimap.png`, `/tmp/rain-final.png`, `/tmp/weather-performance.png`, `/tmp/collider-geometry-audit.png`, `/tmp/traffic-routes.png`, `/tmp/traffic-signals-signs-final.png`, `/tmp/water-sinking.png`, `/tmp/highway-fall.png`. They show `Map: offline OSM extract`; bridge/highway, lamps, minimap/route, rain, water, and fall/sink views are present. Signals/colliders are verified by passing debug assertions, not visual overlays.
