import { test, expect } from 'playwright/test';

test('collider audit matches representative rendered footprints', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const audit = await page.evaluate(() => (globalThis as any).__driveDebug.readColliderAudit());
  expect(audit.categories).toEqual(['tree', 'lamp', 'building', 'vehicle']);
  for (const kind of audit.categories) expect(audit.summary[kind].count).toBeGreaterThan(0);

  const tree = audit.entries.find((entry: any) => entry.kind === 'tree');
  const lamp = audit.entries.find((entry: any) => entry.kind === 'lamp');
  const vehicle = audit.entries.find((entry: any) => entry.kind === 'vehicle');
  expect(tree.colliderDimensions.width).toBeCloseTo(.35);
  expect(tree.colliderDimensions.depth).toBeCloseTo(.35);
  expect(tree.colliderDimensions.width).toBeLessThan(tree.visualDimensions.width);
  expect(lamp.colliderDimensions.width).toBeCloseTo(.12);
  expect(lamp.colliderDimensions.depth).toBeCloseTo(.12);
  expect(lamp.colliderDimensions.width).toBeLessThan(lamp.visualDimensions.width);
  expect(vehicle.colliderDimensions.width).toBeGreaterThanOrEqual(vehicle.visualDimensions.width);
  expect(vehicle.colliderDimensions.depth).toBeGreaterThanOrEqual(vehicle.visualDimensions.depth);
  expect(audit.entries.every((entry: any) => entry.colliderVolume > 0 && entry.visualVolume > 0)).toBe(true);
  await page.screenshot({ path: '/tmp/collider-geometry-audit.png', fullPage: true });
});
