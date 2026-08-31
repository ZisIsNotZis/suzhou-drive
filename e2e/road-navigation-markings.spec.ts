import { test, expect } from 'playwright/test';

test('renders lane markings and route guidance', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const markings = await page.evaluate(() => (globalThis as any).__driveDebug.readLaneMarkings());
  expect(markings.length).toBeGreaterThan(0);
  expect(new Set(markings.map((marking: any) => `${marking.kind}:${marking.style}`)).size).toBeGreaterThanOrEqual(2);
  const input = page.locator('#place');
  await input.fill('primary');
  await page.locator('#find').click();
  await expect(page.locator('#route-guidance')).toBeVisible();
  await expect.poll(() => page.locator('#route-guidance').getAttribute('data-active')).toBe('true');
  expect(await page.locator('#route-guidance').textContent()).toMatch(/\d+ m left/);
  await page.screenshot({ path: '/tmp/road-navigation-markings.png', fullPage: true });
});

test('reports wrong-way navigation state and keeps route metadata available', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.readRoads));
  const roads = await page.evaluate(() => (globalThis as any).__driveDebug.readRoads());
  const road = roads.find((candidate: any) => candidate.name) ?? roads.find((candidate: any) => candidate.highway === 'primary');
  test.skip(!road, 'extract has no routable road');
  await page.evaluate((query) => (globalThis as any).__driveDebug.navigate(query), road.name ?? road.highway);
  const navigation = await page.evaluate(() => (globalThis as any).__driveDebug.readNavigation());
  expect(navigation.active).toBe(true);
  expect(Array.isArray(navigation.travelDirections)).toBe(true);
});
