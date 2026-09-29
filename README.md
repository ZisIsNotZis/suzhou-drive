# Suzhou Drive

English | [简体中文](#简体中文)

> **Status: closed (milestone, 2026-09-29), version 0.1.0.** The offline Suzhou
> driving simulator reached its documented `roadmap-v2` milestone; no further
> development is planned unless the project's inputs or goals change.

An offline-first browser driving simulator using a checked-in Suzhou OSM extract. It combines lane-aware navigation, traffic signals, weather, collisions, water hazards, and procedural roadside dressing in a small Three.js/Vite app. 🚗

Status: closed (milestone), version 0.1.0. The evidence is the local unit/build/E2E record in [`.scratch/roadmap-v2/final-verification.md`](.scratch/roadmap-v2/final-verification.md); one named-place test is skipped because the extract has no eligible fixture.

## Quickstart

Requires Node.js 18+ and npm. From this directory:

```bash
npm ci
npm test
npm run build
npm run dev
```

Open the URL printed by Vite. Drive with WASD or arrow keys; use Camera, Reset, weather, time, and navigation controls in the HUD. The app reads `public/suzhou.osm` locally and does not require an external map service.

## What is measured

The recorded gate reports 40 unit tests, a successful build, and 26 single-worker E2E tests with 25 passed and 1 documented skip. Visual checks inspected route guidance, storm weather, traffic, signals, and minimap screenshots. Re-run the commands above after changes; claims about performance hardware remain unverified.

## Design

Pure behavior lives in `src/sim.ts`, `src/navigation.ts`, `src/weather.ts`, `src/vehicles.ts`, and `src/osm.ts`; `src/main.ts` owns the Three.js integration. Road and place data stays in the checked-in OSM extract. The `.scratch/roadmap-v2/` files are the current roadmap and verification source of truth.

## Future vision

If the navigation slice continues to earn investment: improve map coverage, add a named-place fixture, measure sustained FPS/memory on target hardware, and refine HUD layout. Multiplayer, external map services, and new rendering dependencies are explicitly out of scope for 0.1.0.

## Versioning and releases

The package version in `package.json` is the canonical version source. Follow SemVer while experimental: increment patch for compatible fixes, minor for new user-visible capabilities, and major for breaking contracts. Record release notes in `CHANGELOG.md` before tagging; no public release artifact is claimed yet.

## Contributing, issues, and PRs

Read [`AGENTS.md`](AGENTS.md) and the agent notes under [`docs/agents/`](docs/agents/) before changing behavior. Open an issue with reproduction steps and evidence; PRs should be focused, include tests for rule changes, and run unit, build, and E2E checks. Maintainers review and merge accepted work. Agents can help triage, investigate, test, document, and implement accepted issues; humans retain review and merge authority.

## Agent help

Agents should inspect `.scratch/roadmap-v2/map.md` and the relevant issue file before implementation, preserve the offline/data-driven boundary, and report exact checks plus visual evidence. Do not treat generated `dist/`, `test-results/`, or `node_modules/` as source.

## Rights and license

The software is AGPL-3.0-only; see [`LICENSE`](LICENSE). The OSM extract is third-party data and must be redistributed under its applicable OpenStreetMap attribution and license requirements. No Bilibili upload or arXiv paper is part of this repository’s current scope.

## 简体中文

Suzhou Drive 是一个离线优先的浏览器驾驶模拟器，使用仓库内的苏州 OSM 数据，提供车道导航、信号灯、天气、碰撞、水域危险和程序化道路装饰。当前版本为 0.1.0 实验版。安装 Node.js 18+ 后，在本目录运行 `npm ci && npm test && npm run build && npm run dev`，再打开 Vite 地址，用 WASD 或方向键驾驶。路线图与验证证据以 [`.scratch/roadmap-v2/`](.scratch/roadmap-v2/) 为准；贡献前请阅读 [`AGENTS.md`](AGENTS.md)。软件采用 AGPL-3.0-only；OSM 数据须遵守其独立的署名和许可要求。未来只在当前切片验证通过后考虑地图覆盖、地点测试夹具和目标硬件性能测量。
