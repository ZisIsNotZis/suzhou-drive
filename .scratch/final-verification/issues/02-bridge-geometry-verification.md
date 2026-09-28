# Verify bridge geometry and smooth elevation

Status: needs-triage
Type: task

Verify and fix elevated roads and bridges, especially 新市路 and 盘胥路 crossings.

Acceptance criteria:

- No duplicate elevated road surfaces or floating road segments.
- No sudden vertical drops at water crossings.
- Ramps are aligned with the road travel direction and connect continuously to ground.
- Adjacent road-segment heights produce a smooth transition rather than wiggling.
- Player wheels and camera follow bridge elevation.
- Fresh Playwright probes and screenshots cover ground approach, ramp, bridge deck, and exit.

## Verification — 2026-08-25 — complete current suite

Full E2E: **22 passed, 0 failed, 1 skipped (23 total)**. Bridge/camera probes passed. Fresh `/tmp/bridge-final.png` and `/tmp/map-final.png` were inspected and show elevated road/bridge geometry and approaches. No current automated blocker.
