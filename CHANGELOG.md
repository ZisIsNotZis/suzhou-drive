# Changelog

## Unreleased

- Replaced the `LICENSE` stub with the status of the real one: the verbatim AGPL-3.0 text followed by the project copyright and the OpenStreetMap data carve-out, so the file matches what the README and `package.json` declare and GitHub now detects `AGPL-3.0`.
- Pinned the repository's two dates to their own sources: 0.1.0 released 2026-08-25 (`CHANGELOG.md`) and the milestone closed 2026-09-29 (`docs/project-status.md`).
- Moved the README language switcher to the top of both files, marked the E2E counts as the recorded 0.1.0 gate and noted that the current tree declares 27 E2E tests.
- Recorded the verified public visibility and `master` default branch in `docs/project-status.md`, and ignored Playwright's `playwright-report/` output.
- Rebuilt the README around real verification screenshots, a logo, accurate Node requirements and OpenStreetMap/ODbL attribution.
- Moved the in-game hint out of the navigation row and removed a duplicated guidance style rule.
- Preserved verification screenshots in `docs/media/` and removed links to log files that were not retained.
- Reorganized the README into product-first sections and added a native Simplified Chinese README plus a CONTRIBUTING guide.

## 0.1.0 — 2026-08-25

- Added the current OSM-backed driving, navigation, traffic, weather, vehicle, water, and collision slice.
- Recorded 40 unit tests, a successful build, and 25 passed / 1 skipped E2E tests in the roadmap verification.

