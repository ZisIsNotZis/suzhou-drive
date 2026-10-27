# Roadmap v2 final verification

Date: 2026-08-25
Repository: `/home/z/vibe/drive`

## Commands and exact results

### `npm test`

Exit code: 0. Result: 40 passed, 0 failed, 0 skipped.

This file previously recorded 34; that was the count before the navigation/weather tests were added. The 40 count matches `map.md`, the three issue trackers, and the 40 test declarations across the six `src/*.test.ts` files. The captured log was not retained in the repository.

### `npm run build`

Exit code: 0. Result: build passed. Vite emitted the existing warning that the JS chunk exceeds 500 kB; no build error. The captured log was not retained in the repository.

### `npm run test:e2e -- --workers=1`

Exit code: 0. Result: 26 tests executed: 25 passed, 1 skipped, 0 failed. Duration: 5.7m.

The skip is `e2e/camera-bridge.spec.ts:210`, `navigation search accepts a named OSM place`; the current offline extract has no eligible matching place. No E2E test failed in the final run.

The captured log was not retained in the repository.

## Initial failure and resolution

The initial full E2E run had 24 passed, 1 failed, and 1 skipped. The failure was the signal countdown assertion timing out after 5 seconds. Error context: [error-context.md](../../test-results/traffic-signals-signs-map--98393-ive-signs-and-mapped-arrows/error-context.md). Runtime inspection showed the signal simulation advanced in roughly 0.05-second frames while the countdown is integer-rounded, so a five-second polling window could miss an integer change under the headless renderer load. The clear, scoped fix was increasing that E2E assertion timeout to 15 seconds. The affected test and all final E2E tests passed on rerun.

## Test-quality audit

- Road markings: asserts returned marking data has multiple kind/style combinations; screenshot also covers the route scene.
- Navigation guidance: asserts route activation and rendered meter-based remaining-distance text after navigation.
- Environment states: compares renderer lighting values across clear, fog, and storm.
- Vehicle diversity/dynamics: asserts five distinct catalogue dynamics tuples and observes live fleet movement.
- These roadmap checks exercise debug data and behavior, not merely DOM selectors.

## Screenshot inspection

Three distinct screenshots were inspected with multimodal image inspection and are preserved in the repository:

- [`docs/media/navigation-route.png`](../../docs/media/navigation-route.png): route line, road center marking, minimap, and guidance panel visible.
- [`docs/media/storm-weather.png`](../../docs/media/storm-weather.png): storm fog/lighting visibly distinct; controls remain present.
- [`docs/media/road-and-traffic.png`](../../docs/media/road-and-traffic.png): stable rendered player/traffic scene with lane arrows and minimap; full catalogue diversity is evidenced by debug fleet data rather than this camera framing.

The other `/tmp` captures listed during the run were either duplicates of these or were not retained. No screenshot showed a rendering failure. A minor presentation issue, overlapping lower-left navigation/hint text, was fixed afterwards by moving the hint into the upper-left HUD column; the preserved captures predate that change.

## Changed files in this gate

- `e2e/traffic-signals-signs.spec.ts`: robust countdown polling timeout.
- `e2e/road-navigation-markings.spec.ts`: behavioral marking and route-guidance assertions.
- `e2e/environment-weather.spec.ts`: lighting-difference assertions.
- `e2e/vehicle-diversity-dynamics.spec.ts`: dynamics-difference and movement assertions.
- `.scratch/roadmap-v2/final-verification.md`: this report and links to exact logs.
- `.scratch/roadmap-v2/map.md` and all three roadmap issue trackers: final evidence/status updates.

