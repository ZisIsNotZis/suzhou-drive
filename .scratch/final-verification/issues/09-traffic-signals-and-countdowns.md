# Add and verify traffic signals at intersections

Status: ready-for-human
Type: task

Place mock traffic lights at cross and T intersections, with randomized but rule-consistent phase durations and Suzhou-style countdown displays.

Acceptance criteria:

- Signals appear at eligible intersections rather than arbitrary road locations.
- Vehicle behavior responds to signal phases.
- Countdown displays match the active phase timing.
- Signals are visible in fresh Playwright screenshots at representative intersections.

## Implementation

- Signals are created only for primary/secondary/tertiary road endpoint clusters with at least three distinct approach directions.
- Each eligible intersection receives deterministic rule-consistent phase duration, traffic-light meshes, and a countdown display.
- Traffic uses the shared red-phase stopping/braking logic; the forced-red E2E probe confirms a vehicle stops.
- Countdown rendering is driven by the current elapsed/phase state and updates the display and light meshes when the displayed second or phase changes.

## Verification

- `npx playwright test e2e/traffic-signals-signs.spec.ts --workers=1` — passed, 2/2 tests.
- The first test verified `signals.length > 0`, every signal has at least three approaches, countdown mesh count equals signal count, countdown bounds are valid, and arrows/signs are present; `expect.poll` observed a live countdown/phase change.
- The second test forced the first signal red and observed a stopped traffic path.
- Fresh screenshot captured at `/tmp/traffic-signals-signs-final.png` and visually inspected.
- `npm test` — passed, 24/24 tests.
- `npm run build` — passed (`tsc && vite build`); Vite emitted only the existing chunk-size warning.

## Comments

- 2026-08-25: Initial focused run failed because countdown values remained unchanged within the poll window. Root cause was the renderer updating an oversized signal scene scan without maintaining the light/display state needed for reliable elapsed/phase presentation. Added keyed signal-light tracking and state-change display updates in `src/main.ts`; rerun passed 2/2.
