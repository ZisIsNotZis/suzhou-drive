import { strict as assert } from 'node:assert';
import test from 'node:test';
import { vehicleKinds, vehicleSpec, stepVehicle, type VehicleKind } from './vehicles.ts';
import type { Car } from './sim.ts';

const car: Car = { position: { x: 0, z: 0 }, heading: 0, speed: 0, color: '', ai: false, route: 0, stopped: false, mass: 1, radius: 1 };

test('catalogue contains every requested vehicle class with distinct footprints and dynamics', () => {
  for (const kind of ['car', 'motorcycle', 'bicycle', 'tricycle', 'truck', 'bus', 'helicopter', 'jet'] as VehicleKind[]) {
    const spec = vehicleSpec(kind);
    assert.equal(spec.kind, kind);
    assert.ok(spec.dimensions.width > 0 && spec.dimensions.length > 0 && spec.dimensions.height > 0);
    assert.ok(spec.mass > 0 && spec.maxSpeed > 0 && spec.acceleration > 0 && spec.braking > 0 && spec.grip > 0);
  }
  assert.ok(new Set(vehicleKinds.map(kind => `${vehicleSpec(kind).dimensions.length}:${vehicleSpec(kind).mass}:${vehicleSpec(kind).maxSpeed}`)).size >= 6);
});

test('stepVehicle is deterministic and derives collider footprint from the visible footprint', () => {
  const first = stepVehicle(car, .5, { throttle: true, steer: 0 }, 'motorcycle');
  const second = stepVehicle(car, .5, { throttle: true, steer: 0 }, 'motorcycle');
  assert.deepEqual(first, second);
  assert.equal(first.radius, Math.hypot(.9, 2.2) / 2);
  assert.equal(first.visualWidth, .9);
  assert.equal(first.mass, 230);
});

test('heading and movement stay separate and vehicle dynamics differ', () => {
  const straight = stepVehicle(car, 1, { throttle: true }, 'car');
  const turned = stepVehicle(car, 1, { throttle: true, steer: 1 }, 'car');
  assert.equal(straight.heading, 0);
  assert.equal(straight.position.x, 0);
  assert.ok(straight.position.z > 0);
  assert.ok(turned.heading > 0 && turned.position.x > 0);
  assert.ok(stepVehicle(car, 1, { throttle: true }, 'motorcycle').speed > straight.speed);
  assert.ok(stepVehicle(car, 1, { throttle: true }, 'truck').speed < straight.speed);
});
