# Lane-aware navigation and road markings

Status: ready-for-human
Type: task

## Scope

Render dashed/solid road markings and provide navigation guidance using the real OSM road graph. Respect `oneway`, available lane counts, and `turn:lanes`; preserve unknown metadata instead of inventing maneuvers.

## Current implementation

- `src/navigation.ts` provides lane markings, directed lane routes, maneuver direction, distance, and recommended-lane data.
- `src/main.ts` renders marking styles and route guidance, exposes `readLaneMarkings`, and keeps route search non-teleporting.
- UI guidance is exposed through `#route-guidance`.

## Verification

- `npm test`: 40 passed.
- `npm run build`: passed; Vite reports the existing >500 kB chunk warning.
- Single-worker E2E: 25 passed, 1 skipped, 0 failed. The skip is named-place search because the bundled extract has no matching named place.
- Screenshot `/tmp/road-navigation-markings.png` inspected successfully.

## Known limits

- Marking styles use OSM metadata where present and conservative inferred defaults where the extract has no per-line metadata.
- Lane recommendations are absent when `turn:lanes` is absent.
- Wrong-way detection/recalculation and explicit `change:lanes`/`turn:lanes` legality are implemented in `src/navigation.ts` and integrated by `src/main.ts`.
