# Audit collider dimensions against rendered objects

Status: ready-for-human
Type: task

Measure collider volume and rendered geometry for trees, lamps, poles, buildings, and traffic vehicles. Small-object colliders have previously been several times larger than the visible object.

Acceptance criteria:

- Each collider is derived from or tightly bounds the visible geometry.
- Trees and poles use trunk/pole-sized collision, not canopy or oversized proxy bounds.
- Building and vehicle colliders cover every rendered instance.
- A debug report exposes rendered dimensions and collider dimensions/volume per object category.
- E2E tests verify representative collision extents.

## Verification — 2026-08-25

Implemented in `src/main.ts` and `e2e/collider-geometry.spec.ts` only. `src/sim.ts` and `src/osm.ts` were not changed.

Geometry audit:

- Trees render a 0.35 × 3 × 0.35 trunk plus a variant canopy; collision is the exact 0.35 × 3 × 0.35 trunk footprint.
- Lamps render a 0.12 × 3 × 0.12 post plus a 0.35 × 0.15 × 0.35 bulb; collision is the exact 0.12 × 3 × 0.12 post footprint.
- OSM buildings retain their polygon collider and report polygon bounds, height, and volume. Procedural buildings use their exact rendered box dimensions.
- Player and traffic vehicles derive their circular collision radius from the rendered body width and length, so the collision envelope covers each rendered body without using fixed oversized proxies.
- `__driveDebug.readColliderAudit()` reports categories, every instance’s rendered/collider dimensions, and visual/collider volumes plus category summaries.

Test results:

- `npm test`: **24 passed, 0 failed**.
- `npm run build`: **passed**. TypeScript and Vite build completed; Vite emitted only the existing chunk-size warning.
- `npm run test:e2e -- e2e/collider-geometry.spec.ts`: **1 passed**.
- Fresh screenshot: `/tmp/collider-geometry-audit.png`; visually inspected successfully.

Remaining limitations: vehicle collision remains a circular 2D envelope because the shared simulation API accepts only `radius`; the reported radius is the circumscribed radius of each rendered body footprint. Building collision uses the existing polygon path, while its reported dimensions are axis-aligned bounds.
