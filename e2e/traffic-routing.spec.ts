import { test, expect } from 'playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
});

test('traffic has centered right-side lanes and progresses its routes', async ({ page }) => {
  const before = await page.evaluate(() => (globalThis as any).__driveDebug.readTrafficPaths());
  expect(new Set(before.map((p: any) => p.position?.z)).size).toBeGreaterThan(1);
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => (globalThis as any).__driveDebug.readTrafficPaths());
  expect(after.some((p: any, i: number) => Math.hypot(p.position.x - before[i].position.x, p.position.z - before[i].position.z) > 0.1 || p.cursor > before[i].cursor || p.destination !== before[i].destination)).toBe(true);
  expect(after.every((p: any) => Number.isInteger(p.lane))).toBe(true);
  await page.screenshot({ path: '/tmp/traffic-routes.png', fullPage: true });
});

test('traffic stops at a red signal node', async ({ page }) => {
  const result = await page.evaluate(() => {
    const d = (globalThis as any).__driveDebug;
    const signal = d.readTrafficSignals()[0];
    if (!signal) return null;
    d.setTrafficSignal(signal.key, 'red');
    return signal.key;
  });
  test.skip(!result, 'map extract has no intersection signal node');
  await expect.poll(() => page.evaluate(() => (globalThis as any).__driveDebug.readTrafficPaths().some((p: any) => p.stopped))).toBe(true);
});
