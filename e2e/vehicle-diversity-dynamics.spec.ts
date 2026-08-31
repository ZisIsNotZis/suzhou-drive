import { test, expect } from 'playwright/test';

test('renders a diverse catalogue-backed fleet', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const fleet = await page.evaluate(() => (globalThis as any).__driveDebug.readVehicleFleet());
  expect(new Set(fleet.map((vehicle: any) => vehicle.kind)).size).toBeGreaterThanOrEqual(5);
  expect(fleet.every((vehicle: any) => vehicle.spec.mass > 0 && vehicle.spec.dimensions.length > 0)).toBe(true);
  expect(new Set(fleet.map((vehicle: any) => `${vehicle.spec.mass}:${vehicle.spec.acceleration}:${vehicle.spec.braking}:${vehicle.spec.grip}`)).size).toBeGreaterThanOrEqual(5);
  const before = fleet.map((vehicle: any) => vehicle.position);
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => (globalThis as any).__driveDebug.readVehicleFleet());
  expect(after.some((vehicle: any, i: number) => Math.hypot(vehicle.position.x - before[i].x, vehicle.position.z - before[i].z) > 0.1)).toBe(true);
  await page.screenshot({ path: '/tmp/vehicle-diversity-dynamics.png', fullPage: true });
});
