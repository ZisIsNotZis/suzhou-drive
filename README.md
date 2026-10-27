<img src="public/logo.svg" width="88" alt="Suzhou Drive logo" align="right" />

# Suzhou Drive

**Drive central Suzhou in your browser, offline, from a real OpenStreetMap extract.**

A Three.js driving simulator with lane-aware routing, working traffic signals, changing weather, collisions and canal hazards. No API key, no tile server, no network at runtime.

[![License: AGPL-3.0-only](https://img.shields.io/badge/license-AGPL--3.0--only-blue)](LICENSE)
![Node](https://img.shields.io/badge/node-20.19%2B%20%7C%2022.12%2B-informational)

<img src="docs/media/road-and-traffic.png" alt="Suzhou Drive: chase camera on a Suzhou road with lane arrows, traffic and the minimap" width="100%" />

<sub>0.1.0 verification capture: OSM roads, lane arrows, traffic, minimap and speedometer.</sub>

## What it does

- **Real streets, no service.** The app renders the checked-in `public/suzhou.osm` (11.5 MB, central Suzhou: 31.28–31.32 N, 120.58–120.62 E) with 7,322 ways and 48,308 nodes. Nothing is fetched at runtime.
- **Lane-aware navigation.** Routes follow the OSM road graph and respect `oneway`, `lanes`, `turn:lanes` and `change:lanes`. Rendered road markings, lane arrows, a route line, a minimap and remaining-distance guidance come from the same data. Wrong-way driving triggers a recalculation.
- **Signals and signs.** Three-or-more-way junctions get signal heads with countdown displays; speed-limit signs are rendered from OSM tags.
- **Weather and time.** Clear, cloudy, rain, fog and storm states, manual or automatic transitions, plus a 24-hour sun/fog/rain cycle.
- **Physical consequences.** Vehicle collisions, adjustable regeneration and collision loss, canal drowning, elevated bridges and falls.
- **Traffic and dressing.** Procedural cars, trees, lamps and buildings placed outside roads and water. The vehicle catalogue also defines motorcycle, bicycle, tricycle, truck, bus, helicopter and jet; aircraft are catalogue-only and not spawned on roads.

## Quick start

Requires Node.js `^20.19.0` or `>=22.12.0` (Vite 7) and npm.

```bash
npm ci
npm run dev
```

Open <http://localhost:5173> and drive. The map loads from the repository; there is no external map service.

### Controls

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` or arrow keys | Drive and steer; `S` reverses after stopping |
| Camera | Toggle chase / cockpit view |
| Reset | Return to the spawn point |
| Regen, Collision loss | Adjust coast braking and the speed lost in a collision |
| Weather, Auto, time slider | Set conditions, enable automatic weather, change the hour |
| Search road/place + Navigate | Build a route to a named OSM road or place |

## Verify

```bash
npm test                                  # 40 unit tests
npm run build                             # tsc && vite build
npx playwright install chromium           # once, for browser tests
npm run test:e2e -- --workers=1           # 26 tests: 25 pass, 1 skipped
```

The recorded 0.1.0 gate reports 40 unit tests passing, a passing build (with Vite's existing >500 kB chunk warning), and 25/26 E2E tests passing in 5.7 minutes. The one skip is named-place navigation: the bundled extract has no eligible matching place. Exact results, the failure that was fixed and the inspected screenshots are in [`.scratch/roadmap-v2/final-verification.md`](.scratch/roadmap-v2/final-verification.md).

<table>
  <tr>
    <td width="50%"><img src="docs/media/navigation-route.png" alt="Route line and minimap guidance to a named Suzhou road" /></td>
    <td width="50%"><img src="docs/media/storm-weather.png" alt="Storm weather with fog, darker lighting and the weather control" /></td>
  </tr>
  <tr>
    <td><sub>Lane route, remaining distance and minimap.</sub></td>
    <td><sub>Storm state: fog, lighting and rain.</sub></td>
  </tr>
</table>

## Status

**Closed milestone: 0.1.0, 2026-09-29.** The documented `roadmap-v2` slice is delivered; no further development is planned unless the inputs or goals change.

| | |
| --- | --- |
| **Done** | Offline OSM world, lane-aware routing, wrong-way recovery, markings and signs, signal countdowns, weather/daylight, collisions, water and bridge hazards, procedural dressing, vehicle catalogue, unit/build/E2E gate. |
| **Not done** | Named-place fixture for the skipped E2E case; sustained FPS and memory measurements on target hardware; the >500 kB bundle warning; aircraft are not spawned. |
| **Next** | None planned. If the slice earns more investment: widen map coverage, add the place fixture, measure performance and split the bundle. |

Multiplayer, external map services and speculative rendering dependencies are out of scope for 0.1.0.

## Design

Pure behavior lives in `src/sim.ts`, `src/navigation.ts`, `src/weather.ts`, `src/vehicles.ts` and `src/osm.ts`, each covered by `node:test` unit tests. `src/main.ts` is the only Three.js integration owner; it adapts those modules to the scene, HUD and debug APIs. Road and place data stays in `public/suzhou.osm`. Roadmap status and verification evidence live under [`.scratch/roadmap-v2/`](.scratch/roadmap-v2/).

## Versioning and releases

`package.json` is the canonical version source; follow SemVer while experimental. Record release notes in [`CHANGELOG.md`](CHANGELOG.md) before tagging. No public release artifact is claimed yet.

## Contributing

Read [`AGENTS.md`](AGENTS.md) and the notes under [`docs/agents/`](docs/agents/) before changing behavior. Open an issue with reproduction steps and evidence. PRs should be focused, include tests for rule changes, and run the unit, build and E2E checks above. Agents may triage, investigate, test, document and implement accepted issues; humans keep review and merge authority. Do not treat generated `dist/`, `test-results/` or `node_modules/` as source.

## Data and license

The software is licensed under [AGPL-3.0-only](LICENSE).

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/). The extract in `public/suzhou.osm` is third-party data and its attribution and ODbL terms apply separately from the software license.

---

## 简体中文

Suzhou Drive 是一个离线优先的浏览器驾驶模拟器，使用仓库内的苏州 OSM 数据（11.5 MB，苏州市中心 31.28–31.32 N、120.58–120.62 E），提供车道级导航、信号灯倒计时、天气与昼夜、碰撞、水域和桥梁危险，以及程序化道路装饰。运行时不需要地图服务或网络。

**状态：** 0.1.0 里程碑已关闭（2026-09-29）。单元测试 40 项通过，构建通过，E2E 25 项通过、1 项跳过（仓库内 OSM 数据没有可匹配的具名地点）。性能测量、地图覆盖扩展和打包体积拆分未完成，且暂无后续开发计划。

安装 Node.js `^20.19.0` 或 `>=22.12.0` 后：

```bash
npm ci
npm run dev
```

打开 <http://localhost:5173>，使用 WASD 或方向键驾驶；`S` 在停车后倒车。Camera 切换视角，Reset 回到出生点，Weather/Auto/时间滑块调整环境，搜索道路或地点后点击 Navigate 规划路线。

路线图与验证证据以 [`.scratch/roadmap-v2/`](.scratch/roadmap-v2/) 为准；贡献前请阅读 [`AGENTS.md`](AGENTS.md)。软件采用 [AGPL-3.0-only](LICENSE)。地图数据 © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)，遵循 [ODbL](https://opendatacommons.org/licenses/odbl/)。
