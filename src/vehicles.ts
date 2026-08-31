import { vehicleRadius, type Car, type Vec } from './sim.ts';

export type VehicleKind = 'car' | 'motorcycle' | 'bicycle' | 'tricycle' | 'truck' | 'bus' | 'helicopter' | 'jet';

export type VehicleSpec = {
  kind: VehicleKind;
  dimensions: { width: number; length: number; height: number };
  mass: number;
  maxSpeed: number;
  acceleration: number;
  braking: number;
  grip: number;
  color: string;
};

const catalogue: Record<VehicleKind, VehicleSpec> = {
  car: { kind: 'car', dimensions: { width: 1.8, length: 4.5, height: 1.5 }, mass: 1500, maxSpeed: 22, acceleration: 10, braking: 18, grip: .9, color: '#d94b45' },
  motorcycle: { kind: 'motorcycle', dimensions: { width: .9, length: 2.2, height: 1.4 }, mass: 230, maxSpeed: 28, acceleration: 16, braking: 22, grip: .82, color: '#e0a52b' },
  bicycle: { kind: 'bicycle', dimensions: { width: .6, length: 1.8, height: 1.2 }, mass: 90, maxSpeed: 10, acceleration: 4, braking: 8, grip: .7, color: '#4c9bd6' },
  tricycle: { kind: 'tricycle', dimensions: { width: 1.1, length: 2.1, height: 1.3 }, mass: 140, maxSpeed: 9, acceleration: 3.5, braking: 7, grip: .76, color: '#67b56d' },
  truck: { kind: 'truck', dimensions: { width: 2.5, length: 9, height: 3.5 }, mass: 9000, maxSpeed: 15, acceleration: 4, braking: 11, grip: .7, color: '#b86b45' },
  bus: { kind: 'bus', dimensions: { width: 2.6, length: 11, height: 3.4 }, mass: 12000, maxSpeed: 14, acceleration: 3.5, braking: 10, grip: .65, color: '#8473bb' },
  helicopter: { kind: 'helicopter', dimensions: { width: 3.2, length: 8, height: 3 }, mass: 3200, maxSpeed: 30, acceleration: 7, braking: 12, grip: .55, color: '#6b778d' },
  jet: { kind: 'jet', dimensions: { width: 8, length: 38, height: 6 }, mass: 42000, maxSpeed: 75, acceleration: 12, braking: 8, grip: .4, color: '#d7dbe1' },
};

/** Return an immutable-by-convention catalogue entry for a known vehicle class. */
export function vehicleSpec(kind: VehicleKind = 'car'): VehicleSpec {
  return catalogue[kind];
}

export type VehicleInput = { throttle?: boolean; brake?: boolean; steer?: number };

/**
 * Advance a Car-shaped state. Position follows heading; steering never changes
 * the velocity vector directly, which keeps heading and movement independent
 * for collision responses. All calculations are deterministic for fixed input.
 */
export function stepVehicle(car: Car, dt: number, input: VehicleInput = {}, kind: VehicleKind = 'car'): Car {
  const spec = vehicleSpec(kind), seconds = Math.max(0, dt), steer = Math.max(-1, Math.min(1, input.steer ?? 0));
  let speed = car.speed;
  if (input.throttle) speed += (speed < 0 ? spec.braking : spec.acceleration) * seconds;
  else if (input.brake) speed -= (speed > 0 ? spec.braking : spec.acceleration * .7) * seconds;
  else speed -= Math.sign(speed) * spec.braking * .12 * seconds;
  speed = Math.max(-spec.maxSpeed * .35, Math.min(spec.maxSpeed, speed));
  if (Math.abs(speed) < .01 && !input.throttle && !input.brake) speed = 0;

  const heading = Math.abs(speed) < .01 ? car.heading : car.heading + steer * spec.grip * speed * seconds / Math.max(1, spec.dimensions.length);
  const direction = speed < 0 ? heading + Math.PI : heading;
  const velocity: Vec = { x: Math.sin(direction) * Math.abs(speed), z: Math.cos(direction) * Math.abs(speed) };
  return {
    ...car,
    heading,
    speed,
    mass: spec.mass,
    radius: vehicleRadius(spec.dimensions.width, spec.dimensions.length),
    color: spec.color,
    velocity,
    visualWidth: spec.dimensions.width,
    visualLength: spec.dimensions.length,
    visualHeight: spec.dimensions.height,
    position: { x: car.position.x + velocity.x * seconds, z: car.position.z + velocity.z * seconds },
  };
}

export const vehicleKinds = Object.keys(catalogue) as VehicleKind[];
