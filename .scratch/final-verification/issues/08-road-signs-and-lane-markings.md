# Verify and complete road signs and lane markings

Status: ready-for-human
Type: task

Render available road metadata as understandable in-world Chinese speed-limit signs and lane direction arrows.

Acceptance criteria:

- Speed limits from map data, where available, appear as Chinese-style speed-limit signs.
- Lane arrows indicate permitted directions and align with the associated lane.
- Signs and arrows are placed on or beside the correct road, readable from the driving view.
- Missing-data behavior is explicit and does not invent misleading signs.
- Playwright screenshots/probes verify representative examples.

## Implementation

- Parser metadata is implemented in `src/osm.ts`: strict positive numeric `maxspeed` values, optional `km/h`/`kph`, and `mph` normalized to km/h; missing, symbolic, zero, and ambiguous values remain `undefined`.
- `turn:lanes` is retained as trimmed pipe-separated slots, including empty slots, so the renderer receives no invented direction metadata.
- The existing renderer consumes `maxspeed` and `turnLanes`; `main.ts` was intentionally unchanged. Renderer integration is therefore already wired, but its fallback currently displays `through` for empty lane slots and is outside this issue's allowed files.

## Verification

- Focused Playwright: `npx playwright test e2e/traffic-signals-signs.spec.ts --workers=1` — passed, 2/2 tests.
- The passing probe verified positive speed signs, mapped lane arrows, and countdown meshes matching signal count.
- Screenshot captured at `/tmp/traffic-signals-signs-final.png` and visually inspected; the driving view renders the road, lane marking, roadside sign/label, and scene HUD.
- `npm test` — passed, 24/24 tests.
- `npm run build` — passed (`tsc && vite build`); Vite emitted only the existing chunk-size warning.

## Comments

- 2026-08-25: Completed final verification. No renderer change was required for signs/arrows; the shared signal display update was corrected in `src/main.ts` while verifying the combined acceptance test.
