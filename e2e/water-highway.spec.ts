import { test, expect } from 'playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
});

test('roads over water keep their road elevation and water remains classified', async ({ page }) => {
  const result = await page.evaluate(() => {
    const d = (globalThis as any).__driveDebug;
    const roads = d.readRoads();
    const water = d.readWaterPolygons();
    const crossing = roads.find((r: any) => r.elevation > 0);
    if (!crossing || !water.length) return { crossing: false, water: water.length };
    const p = { x: (crossing.a.x + crossing.b.x) / 2, z: (crossing.a.z + crossing.b.z) / 2 };
    return { crossing: true, water: water.length, height: d.readRoadHeightAt(p), road: d.readRoads().length };
  });
  expect(result.crossing).toBe(true);
  expect(result.water).toBeGreaterThan(0);
  expect(result.height).toBeGreaterThan(0);
});

test('water entry sinks visibly before respawn', async ({ page }) => {
  const d = (globalThis as any).__driveDebug;
  await page.evaluate(() => (globalThis as any).__driveDebug.startTestSinking());
  const before = await page.evaluate(() => (globalThis as any).__driveDebug.readWaterState());
  await page.waitForTimeout(350);
  const during = await page.evaluate(() => (globalThis as any).__driveDebug.readWaterState());
  expect(during.drowning).toBeGreaterThan(before.drowning);
  expect(during.visualY).toBeLessThan(before.visualY);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (globalThis as any).__driveDebug.readWaterState().drowning)).toBeGreaterThan(0);
  await page.screenshot({ path: '/tmp/water-sinking.png', fullPage: true });
});

test('leaving an elevated road enters a visible falling state', async ({ page }) => {
  await page.evaluate(() => (globalThis as any).__driveDebug.startTestFall());
  const before = await page.evaluate(() => (globalThis as any).__driveDebug.readWaterState());
  await page.waitForTimeout(350);
  const during = await page.evaluate(() => (globalThis as any).__driveDebug.readWaterState());
  expect(during.falling).toBeGreaterThan(before.falling);
  expect(during.visualY).toBeLessThan(before.visualY);
  await page.screenshot({ path: '/tmp/highway-fall.png', fullPage: true });
});
