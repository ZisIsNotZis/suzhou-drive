import { test, expect } from 'playwright/test';

test('supports all weather states and preserves environment controls', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const lighting = [];
  for (const weather of ['clear', 'fog', 'storm']) {
    await page.evaluate((value) => (globalThis as any).__driveDebug.setWeather(value), weather);
    await expect.poll(() => page.evaluate(() => (globalThis as any).__driveDebug.readEnvironment().weather)).toBe(weather);
    lighting.push(await page.evaluate(() => (globalThis as any).__driveDebug.readEnvironment().lighting));
  }
  expect(new Set(lighting.map((state: any) => `${state.background}:${state.fog.color}:${state.sun.intensity}`)).size).toBe(3);
  await page.screenshot({ path: '/tmp/environment-weather.png', fullPage: true });
});
