# Environment lighting and weather

Status: ready-for-human
Type: task

## Scope

Provide coherent sun/shadow lighting and deterministic weather states without resetting player, traffic, route, or camera state.

## Current implementation

- `src/weather.ts` provides pure weather state, hour normalization, non-repeating random automatic transitions, and renderer-neutral lighting for clear, cloudy, rain, fog, and storm.
- `src/main.ts` applies that state to sun, hemisphere light, fog, clouds, rain, shadows, controls, and debug APIs.
- UI supports manual weather selection and automatic progression; `readEnvironment`, `setWeather`, `setHour`, and `readWeather` are available.

## Verification

- `npm test`: 40 passed.
- `npm run build`: passed; Vite reports the existing >500 kB chunk warning.
- Single-worker E2E: 25 passed, 1 skipped, 0 failed.
- Screenshots `/tmp/environment-weather.png` and `/tmp/weather-performance.png` inspected successfully.

## Known limits

- Atmospheric effects use rain/cloud particles, fog, and lightweight renderer-neutral volumetric-style light beams; a full GPU volumetric-light system is intentionally out of scope.
