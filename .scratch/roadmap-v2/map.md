# Roadmap v2 — navigation, realism, and vehicle variety

## Goal

Make the Suzhou driving simulator more useful as a navigation-oriented driving game while preserving the real OSM map, current collision behavior, and the existing green baseline.

## Execution order

1. Build disjoint pure modules and their unit tests.
2. Integrate them once in `src/main.ts`.
3. Add focused Playwright coverage with persisted screenshots.
4. Run the complete unit/build/E2E gate and update every ticket with evidence.

## Final verification (2026-08-25)

- Unit suite: 40 passed, 0 failed, 0 skipped after navigation/weather completion. [Exact output](verification-artifacts/npm-test.final.log)
- Build: passed; existing Vite chunk-size warning only. [Exact output](verification-artifacts/npm-build.final.log)
- Previous full single-worker E2E: 25 passed, 1 skipped, 0 failed (26 tests collected). The focused navigation E2E now passes 2/2 after integration.
- The one skip is `camera-bridge.spec.ts` named OSM place navigation; the current extract has no eligible matching place.
- New roadmap E2E checks assert rendered data/behavior: marking styles, route activation/distance, lighting differences, fleet dynamics diversity and live movement. They are not selector-only checks.
- Inspected screenshots: `/tmp/road-navigation-markings.png`, `/tmp/environment-weather.png`, `/tmp/vehicle-diversity-dynamics.png`, `/tmp/traffic-signals-signs-final.png`, `/tmp/traffic-routes.png`, and `/tmp/weather-performance.png`. No rendering failure observed; route guidance, storm fog, rain presentation, minimap, and controls are visible. Vehicle screenshot shows the stable player/traffic view, while all catalogue classes are evidenced through the debug fleet data rather than the camera composition.

## Shared integration contract

- `src/navigation.ts`: lane-aware route and marking data; renderer-independent.
- `src/weather.ts`: deterministic weather/lighting state; renderer-independent.
- `src/vehicles.ts`: vehicle catalogue and dynamics; renderer-independent.
- `src/main.ts`: the only integration owner; adapts all three modules to Three.js and current debug APIs.

## Deliberate scope

This batch targets road markings, serious lane guidance, richer environment/weather, vehicle diversity, and better driving dynamics. It does not add multiplayer, external map services, or speculative rendering dependencies.

## Remaining verification backlog

- Named-place fixture or expanded extract for non-skipped place navigation.
- RTX 4090 startup, sustained FPS, memory, and bundle-size measurements.

## Completed formerly-unimplemented functionality

- Wrong-way detection and automatic route recalculation are integrated in `src/main.ts` and covered by unit/focused E2E tests.
- Lane-topology routing uses `change:lanes` and `turn:lanes` where OSM provides them, with strict rejection of explicitly illegal transitions.
- OSM road-marking tags are preserved and override inferred marking styles when present.
- Automatic weather transitions use non-repeating random choices; renderer-neutral volumetric-style light beams complement fog/cloud/rain effects.
