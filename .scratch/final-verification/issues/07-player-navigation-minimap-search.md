# Add player navigation map, search, and route guidance

Status: ready-for-human
Type: task

Provide a lower-corner minimap with searchable places and route/navigation guidance using available OSM names and geometry.

Acceptance criteria:

- Minimap reflects the real Suzhou OSM road network and player position.
- User can search available place/road names.
- A selected destination produces visible route guidance.
- UI behavior has Playwright coverage.

## Comments

- Implemented the real OSM road minimap with player heading/position and route overlay, plus existing named road/place search and graph route guidance.
- Added Playwright coverage for minimap visibility, non-empty rendered pixels, route line, named search, and unchanged player position.
- Verification pending final `npm test`, build, and E2E run.

## Verification — 2026-08-25 — complete current suite

`npm test`: **24 passed, 0 failed, 0 skipped**. `npm run build`: **passed**. `npm run test:e2e -- --workers=1`: **22 passed, 0 failed, 1 skipped (23 total)**. Fresh `/tmp/navigation-minimap.png` was inspected and shows the populated road minimap, player marker, cyan route overlay, and route status. Road-name navigation passed. The named-place test intentionally skipped because the bundled extract returned no named place; next blocker is an extract/fixture with a named point if that probe must run rather than skip.
