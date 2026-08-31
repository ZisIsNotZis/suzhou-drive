import { test, expect } from 'playwright/test';

test('map exposes visible signals, live countdowns, conservative signs and mapped arrows', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const before = await page.evaluate(() => {
    const d = (globalThis as any).__driveDebug;
    return { signals: d.readTrafficSignals(), signs: d.readSigns(), arrows: d.readLaneArrows(), countdowns: d.readSignalCountdowns(), countdownMeshes: d.scene.children.filter((o: any) => o.name === 'traffic-signal-countdown').length };
  });
  expect(before.signals.length).toBeGreaterThan(0);
  expect(before.signals.every((s: any) => s.approaches >= 3)).toBe(true);
  expect(before.countdownMeshes).toBe(before.signals.length);
  expect(before.signs.every((s: any) => s.speed > 0)).toBe(true);
  expect(before.arrows.length).toBeGreaterThan(0);
  expect(before.countdowns.every((s: any) => s.countdown >= 1 && s.countdown <= s.period)).toBe(true);
  await expect.poll(async () => {
    const after = await page.evaluate(() => (globalThis as any).__driveDebug.readSignalCountdowns());
    return after.some((s: any, i: number) => s.countdown !== before.countdowns[i]?.countdown || s.phase !== before.countdowns[i]?.phase);
  }, { timeout: 15000 }).toBe(true);
  await page.screenshot({ path: '/tmp/traffic-signals-signs-final.png', fullPage: true });
});

test('traffic observes a forced red signal phase', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const key = await page.evaluate(() => (globalThis as any).__driveDebug.readTrafficSignals()[0]?.key);
  test.skip(!key, 'map has no eligible signal');
  await page.evaluate((k) => (globalThis as any).__driveDebug.setTrafficSignal(k, 'red'), key);
  await expect.poll(() => page.evaluate(() => (globalThis as any).__driveDebug.readTrafficPaths().some((p: any) => p.stopped))).toBe(true);
});
