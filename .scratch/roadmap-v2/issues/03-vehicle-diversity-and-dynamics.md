# Vehicle diversity and driving dynamics

Status: ready-for-human
Type: task

## Scope

Add diverse vehicle classes and stable dynamics with distinct dimensions, mass, acceleration, braking, maximum speed, grip, and collision footprints.

## Current implementation

- `src/vehicles.ts` provides car, motorcycle, bicycle, tricycle, truck, bus, helicopter, and jet specifications plus deterministic `stepVehicle`.
- `src/main.ts` uses catalogue specs for player/traffic dimensions, color, mass, radius, and player dynamics; `readVehicleFleet` exposes the active fleet.
- Aircraft entries remain catalogue-backed and decorative-only; they are not spawned into road traffic.

## Verification

- `npm test`: 40 passed.
- `npm run build`: passed; Vite reports the existing >500 kB chunk warning.
- Single-worker E2E: 25 passed, 1 skipped, 0 failed.
- Screenshot `/tmp/vehicle-diversity-dynamics.png` inspected successfully; catalogue diversity is also verified through fleet debug data.

## Known limits

- The current map has no dedicated airspace, so helicopter/jet meshes are not spawned.
- Collision envelopes remain circular because the shared collision API uses a radius.
