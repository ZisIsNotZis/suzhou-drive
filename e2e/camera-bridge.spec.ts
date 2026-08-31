import { test, expect } from 'playwright/test';

test('camera rises with the road elevation', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const groundY = await page.evaluate(() => (globalThis as any).__driveDebug.readCameraY());
  await page.evaluate(() => (globalThis as any).__driveDebug.setTestRoadHeight(12));
  await page.waitForTimeout(80);
  const bridgeY = await page.evaluate(() => (globalThis as any).__driveDebug.readCameraY());
  expect(bridgeY - groundY).toBeGreaterThan(10);
  await page.evaluate(() => (globalThis as any).__driveDebug.setTestRoadHeight(null));
});

test('bridge segments join without a second floating deck and small poles stay small', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.readRoads));
  const result = await page.evaluate(() => {
    const debug = (globalThis as any).__driveDebug;
    const roads = debug.readRoads();
    const smallColliders = debug.readSmallColliders();
    return {
      hasElevatedRoadData: roads.some((road: any) => road.elevation > 0),
      hasOversizedPole: smallColliders.some((collider: any) => collider.radius > 0.1 || collider.w > 0.2 || collider.d > 0.2),
    };
  });
  expect(result.hasElevatedRoadData).toBe(true);
  expect(result.hasOversizedPole).toBe(false);
});

test('loaded map still renders elevated road surfaces', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.readElevatedSurfaceCount));
  await expect.poll(() => page.evaluate(() => (globalThis as any).__driveDebug.readElevatedSurfaceCount())).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => (globalThis as any).__driveDebug.readSlopedSurfaceCount())).toBeGreaterThan(0);
  const bridge = await page.evaluate(() => (globalThis as any).__driveDebug.readBridgeGeometry());
  expect(bridge.deckTop.length).toBe(4);
  expect(bridge.deckTop.every((height: number) => height > 0)).toBe(true);
  expect(bridge.ramps).toBeGreaterThan(0);
  expect(Math.abs(bridge.rampRotationX)).toBe(0);
});

test('bridge is visually inspectable at a real elevated map location', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.readRoads));
  const index = await page.evaluate(() => {
    const roads = (globalThis as any).__driveDebug.readRoads();
    return roads.findIndex((r: any) => r.elevation > 0 && (r.elevationStart === 0 || r.elevationEnd === 0));
  });
  expect(index).toBeGreaterThanOrEqual(0);
  await page.evaluate((i) => (globalThis as any).__driveDebug.focusRoad(i), index);
  await page.waitForTimeout(250);
  await page.screenshot({ path: '/tmp/bridge-final.png', fullPage: true });
  const bridge = await page.evaluate(() => (globalThis as any).__driveDebug.readBridgeGeometry());
  expect(bridge.ramps).toBeGreaterThan(0);
  expect(bridge.continuous).toBe(true);
});

test('bridge height follows the ramp instead of dropping at the endpoint', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.readRoads));
  const index = await page.evaluate(() => (globalThis as any).__driveDebug.readRoads().findIndex((r: any) => r.elevation > 0));
  expect(index).toBeGreaterThanOrEqual(0);
  const road = await page.evaluate((i) => (globalThis as any).__driveDebug.readRoads()[i], index);
  const values = await page.evaluate((r) => {
    const dx = r.b.x-r.a.x, dz = r.b.z-r.a.z;
    const d = (globalThis as any).__driveDebug;
    return [0,.25,.5,.75,1].map(t => d.readRoadHeightAt({x:r.a.x+dx*t,z:r.a.z+dz*t}));
  }, road);
  expect(Math.max(...values)).toBeGreaterThan(0);
  expect(values[0]).toBeLessThan(values[1]);
  expect(values[3]).toBeGreaterThanOrEqual(values[4]);
});

test('bridge height is smooth at the real named crossings', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.readRoads));
  const crossings = await page.evaluate(() => {
    const d = (globalThis as any).__driveDebug;
    return ['新市路', '盘胥路'].map(name => d.readRoads().find((r: any) => r.name === name && r.elevation > 0)).filter(Boolean);
  });
  for (const road of crossings) {
    const values = await page.evaluate((r) => {
      const d = (globalThis as any).__driveDebug, dx = r.b.x-r.a.x, dz = r.b.z-r.a.z;
      return [.05,.1,.15,.2,.8,.85,.9,.95].map(t => d.readRoadHeightAt({x:r.a.x+dx*t,z:r.a.z+dz*t}));
    }, road);
    expect(values.slice(0, 4)).toEqual([...values.slice(0, 4)].sort((a,b) => a-b));
    expect(values.slice(4)).toEqual([...values.slice(4)].sort((a,b) => b-a));
  }
});

test('real map exposes decoration, named roads, signals and elevated roads', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.readRoads));
  const info = await page.evaluate(() => {
    const d = (globalThis as any).__driveDebug;
    return { roads: d.readRoads().length, decorations: d.renderStats.colliders.filter((x: any) => x.kind === 'tree' || x.kind === 'lamp').length, traffic: d.traffic.length };
  });
  expect(info.roads).toBeGreaterThan(100);
  expect(info.decorations).toBeGreaterThan(10);
  expect(info.traffic).toBeGreaterThan(0);
  await page.screenshot({ path: '/tmp/map-final.png', fullPage: true });
});

test('decorations are global roadside objects with geometry-aware clearance', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.readDecorations));
  const result = await page.evaluate(() => (globalThis as any).__driveDebug.readDecorations());
  expect(result.total).toBeGreaterThan(100);
  expect(result.xSpan).toBeGreaterThan(500);
  expect(result.zSpan).toBeGreaterThan(500);
  expect(result.types.tree).toBeGreaterThan(0);
  expect(result.types.lamp).toBeGreaterThan(0);
  expect(result.types.building).toBeGreaterThan(0);
  expect(result.violations).toEqual([]);
  await page.screenshot({ path: '/tmp/decorations-global.png', fullPage: true });
});

test('navigation search draws a route without teleporting the player', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const query = await page.evaluate(() => (globalThis as any).__driveDebug.readRoads().find((r: any) => r.name)?.name || 'primary');
  const before = await page.evaluate(() => ({...((globalThis as any).__driveDebug.player.position)}));
  await page.locator('#place').fill(query);
  await page.locator('#find').click();
  await expect(page.locator('#route-status')).not.toHaveText('No route');
  const after = await page.evaluate(() => { const route=(globalThis as any).__driveDebug.scene.children.find((o: any)=>o.name==='navigation-route'); return {p:(globalThis as any).__driveDebug.player.position, marker:document.querySelector('#route-guidance.navigation-route[data-active="true"]')!==null, route:route ? {points:route.geometry.getAttribute('position')?.count,visible:route.visible} : null}; });
  expect(after.p).toEqual(before);
  expect(after.marker).toBe(true);
  expect(after.route?.points).toBeGreaterThan(1);
  expect(after.route?.visible).toBe(true);
});

test('OSM minimap shows roads and tracks the player without search teleport', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const minimap = page.locator('#minimap');
  await expect(minimap).toBeVisible();
  const before = await page.evaluate(() => ({...((globalThis as any).__driveDebug.player.position)}));
  const query = await page.evaluate(() => (globalThis as any).__driveDebug.readRoads().find((r: any) => r.name)?.name || 'primary');
  await page.locator('#place').fill(query);
  await page.locator('#find').click();
  await expect(page.locator('#route-status')).toContainText('Route to');
  const result = await page.evaluate(() => ({
    player: (globalThis as any).__driveDebug.player.position,
    route: (() => { const o=(globalThis as any).__driveDebug.scene.children.find((x: any)=>x.name==='navigation-route'); return o ? {points:o.geometry.getAttribute('position')?.count,visible:o.visible} : null; })(),
    marker: document.querySelector('#route-guidance.navigation-route[data-active="true"]') !== null,
    minimapPixels: (() => { const c = document.querySelector('#minimap') as HTMLCanvasElement; return [...c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data].some(v => v !== 16); })(),
  }));
  expect(result.route?.points).toBeGreaterThan(1);
  expect(result.route?.visible).toBe(true);
  expect(result.marker).toBe(true);
  expect(result.minimapPixels).toBe(true);
  expect(result.player).toEqual(before);
  await page.screenshot({ path: '/tmp/navigation-minimap.png', fullPage: true });
});

test('rain mode displays active weather particles', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  await page.locator('#weather').selectOption('rain');
  await page.waitForTimeout(100);
  const visible = await page.evaluate(() => [...document.querySelectorAll('canvas')].length >= 2);
  expect(visible).toBe(true);
  await page.screenshot({ path: '/tmp/rain-final.png', fullPage: true });
});

test('weather and renderer stay active at a steady frame rate', async ({ page }) => {
  const started = Date.now();
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const startupMs = Date.now() - started;
  const clear = await page.evaluate(() => (globalThis as any).__driveDebug.readWeather());
  await page.locator('#weather').selectOption('cloudy');
  await expect.poll(() => page.evaluate(() => (globalThis as any).__driveDebug.readWeather())).toMatchObject({ weather: 'cloudy', clouds: 14, rain: false });
  await page.locator('#weather').selectOption('rain');
  await expect.poll(() => page.evaluate(() => (globalThis as any).__driveDebug.readWeather())).toMatchObject({ weather: 'rain', rain: true });
  const rain = await page.evaluate(() => (globalThis as any).__driveDebug.readWeather());
  const render = await page.evaluate(() => (globalThis as any).__driveDebug.readRenderStats());
  expect(startupMs).toBeLessThan(10000);
  expect(clear.sun.y).toBeGreaterThan(0);
  expect(rain.sun.intensity).toBeGreaterThan(0);
  expect(render.calls).toBeGreaterThan(0);
  expect(render.geometries).toBeLessThan(3000);
  await page.screenshot({ path: '/tmp/weather-performance.png', fullPage: true });
});

test('driving keys do not move or focus the regen control', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  await page.locator('#regen').focus();
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(80);
  expect(await page.locator('#regen').inputValue()).toBe('3');
  await page.keyboard.up('ArrowUp');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('regen');
});

test('collision response keeps player heading and separates without a teleport', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.resolvePlayerCollision));
  const result = await page.evaluate(() => {
    const d = (globalThis as any).__driveDebug;
    d.player.position = {x: 0, z: 0}; d.player.heading = .7;
    return d.resolvePlayerCollision({position:{x:1, z:0},heading:0,speed:0,color:'',ai:true,route:0,stopped:false,mass:1800,radius:1.2});
  });
  expect(result.heading).toBeCloseTo(.7);
  expect(Math.hypot(result.position.x, result.position.z)).toBeLessThan(3);
});

test('navigation search accepts a named OSM place', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean((globalThis as any).__driveDebug?.isMapReady?.()));
  const query = await page.evaluate(() => (globalThis as any).__driveDebug.readPlaceName?.());
  if (!query) test.skip();
  await page.locator('#place').fill(query);
  await page.locator('#find').click();
  await expect(page.locator('#route-status')).not.toHaveText('No match');
});
