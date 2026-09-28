# Complete rendering polish, performance verification, and dead-code cleanup

Status: ready-for-human
Type: task

Finish the environment presentation and verify runtime performance after removing obsolete demo-map code.

Acceptance criteria:

- Sun orbit, physically coherent lighting/shadows, clouds, rain, and weather transitions are implemented or explicitly scoped.
- Real OSM map is the only active map path; obsolete demo-map/dead code is removed.
- Startup time, frame rate, and memory behavior are measured on the target 4090 setup.
- Current Playwright screenshots verify rendering in spawn, bridge, and distant areas.

## Verification — 2026-08-25 — complete current suite

Results: `npm test` **24 passed, 0 failed, 0 skipped**; `npm run build` **passed** with the existing 566.00 kB chunk warning; `npm run test:e2e -- --workers=1` **22 passed, 0 failed, 1 skipped (23 total)**. Fresh screenshots inspected: bridge, map/distant, decorations, minimap/navigation, rain/weather, traffic, signals/signs, collider, water-sinking, and highway-fall artifacts at `/tmp/bridge-final.png`, `/tmp/map-final.png`, `/tmp/decorations-global.png`, `/tmp/navigation-minimap.png`, `/tmp/rain-final.png`, `/tmp/weather-performance.png`, `/tmp/traffic-routes.png`, `/tmp/traffic-signals-signs-final.png`, `/tmp/collider-geometry-audit.png`, `/tmp/water-sinking.png`, `/tmp/highway-fall.png`.

Runnable rendering/weather verification is complete and the active source uses the bundled OSM path. Remaining blocker: this run did not measure startup, sustained FPS, or memory on the target 4090; the build warning also remains non-failing.
