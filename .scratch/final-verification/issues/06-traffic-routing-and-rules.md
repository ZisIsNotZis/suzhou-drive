# Make generated traffic follow routes and traffic rules

Status: ready-for-human
Type: task

Implement or verify lane-level traffic routing with destinations, right-side driving, valid turns, signal compliance, and destination reassignment.

Acceptance criteria:

- Traffic vehicles follow lane paths instead of bumping or wandering.
- Vehicles choose destinations, navigate to them, then receive new destinations and continue.
- Vehicles obey right-side traffic, lane direction, turns, and red lights.
- Traffic behavior has focused E2E coverage.

## Implementation

Implemented at the pure simulation layer in `src/sim.ts`, retaining the existing
`advanceCar` API. Added deterministic helpers for direct waypoint progression,
right-side lane selection/offsets, destination reassignment, red-signal braking,
and safe traffic stepping. Focused unit tests cover no wandering, completion and
reassignment, lane direction, and red-light stopping in `src/sim.test.ts`.

`main.ts` now adapts the map graph to lane-centered waypoint routes, selecting
right-side lanes and using `followWaypoints`, `safeTrafficStep`,
`shouldStopAtRedSignal`, and `reassignDestination` during the live render loop.
Traffic mesh rotation remains independent from the player heading/camera.
Debug hooks expose route cursor, destinations, positions, and signal state.

Focused Playwright coverage is in `e2e/traffic-routing.spec.ts` for route
progression/lane separation and red-signal stopping.

Verification:

- `npm test`: passed, 24/24 tests.
- `npm run build`: passed (`tsc` and Vite production build). Vite emitted only
  the existing >500 kB chunk-size warning.
- `npx playwright test e2e/traffic-routing.spec.ts --workers=1`: passed, 2/2.
  The focused test verified distinct lane positions, integer lane assignment,
  and at least one vehicle position/cursor/destination progressed during the
  700 ms observation window. The red-signal test verified `stopped === true`.
- Screenshot captured and visually inspected: `/tmp/traffic-routes.png`.

Final evidence: no additional source edit was needed after inspecting the
current files; the focused E2E suite passes against the current traffic
implementation and the acceptance assertions remain strict.
