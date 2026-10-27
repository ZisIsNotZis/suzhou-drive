<p align="center">
  <strong>English</strong> | <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <img src="public/logo.svg" width="104" alt="Suzhou Drive logo" />
</p>

<h1 align="center">Suzhou Drive</h1>
<h3 align="center">An offline driving simulator built on a real Suzhou street map.</h3>

<p align="center"><strong>Drive central Suzhou in your browser — lane-aware routing, live signals, weather and canal hazards, all from one checked-in OpenStreetMap extract. No API key, no tile server, no runtime network.</strong></p>

<p align="center">
  <img src="docs/media/road-and-traffic.png" alt="Suzhou Drive: a chase view of a Suzhou road with lane arrows, traffic, the minimap and the speedometer" width="100%" />
</p>

<p align="center"><sub>0.1.0 verification capture: OSM roads, lane arrows, traffic, minimap and speedometer.</sub></p>

## Quick start

Requires Node.js `^20.19.0` or `>=22.12.0` (Vite 7) and npm. From the repository root:

```bash
npm ci
npm run dev
```

Open <http://localhost:5173> and drive. The map is read from `public/suzhou.osm`; nothing is fetched at runtime.

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` or arrow keys | Drive and steer; `S` reverses after stopping |
| Camera | Toggle chase / cockpit view |
| Reset | Return to the spawn point |
| Regen, Collision loss | Adjust coast braking and the speed lost in a collision |
| Weather, Auto, time slider | Set conditions, enable automatic weather, change the hour |
| Search road/place + Navigate | Build a route to a named OSM road or place |

## What it can do now

- **Real streets, no service.** Renders an 11.5 MB extract of central Suzhou (31.28–31.32 N, 120.58–120.62 E) with 7,322 ways and 48,308 nodes, including roads, buildings, water, bridges and named points.
- **Lane-aware navigation.** Routes follow the OSM graph and respect `oneway`, `lanes`, `turn:lanes` and `change:lanes`. Markings, lane arrows, the route line, minimap and remaining-distance guidance all come from the same data. Wrong-way driving triggers a recalculation.
- **Intersections that behave.** Eligible three-or-more-way junctions get signal heads with countdown displays; traffic reacts to the light phase, and speed-limit signs are rendered from OSM tags.
- **Weather and time.** Clear, cloudy, rain, fog and storm, with manual or automatic transitions and a 24-hour sun/fog/rain cycle.
- **Physical consequences.** Vehicle collisions, adjustable regeneration and collision loss, canal drowning, elevated bridges and falls.
- **Traffic and dressing.** Procedural cars, trees, lamps and buildings placed outside roads and water. The catalogue also defines motorcycle, bicycle, tricycle, truck, bus, helicopter and jet; aircraft are catalogue-only and not spawned on roads.

<details>
<summary><strong>More screenshots</strong></summary>
<br />
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
</details>

## Architecture

| Module | Responsibility |
| --- | --- |
| `src/osm.ts` | Parses OSM XML into roads, buildings, water, areas, railways and named points. |
| `src/sim.ts` | Vehicle state, collisions, signals, traffic following and right-side lane rules. |
| `src/navigation.ts` | Lane routes, markings, maneuvers, wrong-way detection and rerouting. |
| `src/weather.ts` | Weather states, automatic transitions and lighting values. |
| `src/vehicles.ts` | Vehicle catalogue, dimensions and dynamics. |
| `src/main.ts` | The only Three.js integration owner: scene, HUD, minimap, controls and debug hooks. |
| `src/style.css` | HUD and control layout. |

`public/suzhou.osm` → `osm.ts` → `main.ts` → Three.js scene and HUD. Navigation, simulation, weather and vehicle behavior stay renderer-independent so they can be unit-tested without a browser. E2E checks drive the real app and read `window.__driveDebug` hooks exposed by `src/main.ts`.

## How to develop

```bash
npm test                                  # 40 unit tests
npm run build                             # tsc && vite build
npx playwright install chromium           # once, for browser tests
npm run test:e2e -- --workers=1           # 26 tests: 25 pass, 1 skipped
```

The recorded 0.1.0 gate reports 40 unit tests passing, a passing build with Vite's existing >500 kB chunk warning, and 25/26 E2E tests passing. The one skip is named-place navigation: the bundled extract has no eligible matching place. Results and inspected screenshots are recorded in [`.scratch/roadmap-v2/final-verification.md`](.scratch/roadmap-v2/final-verification.md).

## How to contribute

Read [`CONTRIBUTING.md`](CONTRIBUTING.md), then [`AGENTS.md`](AGENTS.md) and the notes under [`docs/agents/`](docs/agents/) before changing behavior. Open an issue with reproduction steps and evidence; keep pull requests focused, add tests for rule changes, and run the checks above. Humans keep review and merge authority. Generated `dist/`, `test-results/` and `node_modules/` are not source.

## Roadmap

**Status: closed milestone.** 0.1.0 was released on 2026-08-25 and the milestone closed on 2026-09-29; the documented `roadmap-v2` slice is delivered, and no further development is planned unless the inputs or goals change. `package.json` is the canonical version; release notes live in [`CHANGELOG.md`](CHANGELOG.md).

### Implemented

- The offline OSM world: roads, elevations, bridges, water, buildings and named places.
- Lane-aware routes, markings, lane arrows, wrong-way detection and automatic rerouting.
- Signal countdowns, speed-limit signs and traffic that follows routes and lights.
- Five weather states with automatic transitions, plus the 24-hour lighting cycle.
- Collisions, regeneration and collision-loss controls, canal drowning and bridge falls.
- Procedural traffic and roadside dressing; vehicle catalogue and distinct dynamics.
- The 0.1.0 verification gate and preserved screenshots in `docs/media/`.

### Planned and deferred

No dates or committed scope. The recorded follow-ups, in rough order of value:

- Add a named-place fixture so the skipped navigation E2E case runs.
- Measure startup, sustained FPS and memory on target hardware.
- Address the >500 kB bundle by splitting or trimming dependencies.
- Widen map coverage and refine HUD layout.

Multiplayer, external map services and speculative rendering dependencies are out of scope for 0.1.0.

### Future vision

If the slice earns further investment, Suzhou Drive can become a reusable offline OSM driving sandbox: swap in another city extract, keep the same navigation, traffic, weather and hazard systems, and measure the result. The boundary stays the same — data in the repository, no external map service, and every new capability backed by a test or a visible check.

## Data and license

The software is licensed under [AGPL-3.0-only](LICENSE).

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/). The extract in `public/suzhou.osm` is third-party data; its attribution and ODbL terms apply separately from the software license.
