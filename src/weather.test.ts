import { strict as assert } from 'node:assert';
import test from 'node:test';
import { advanceWeather, advanceWeatherRandom, lightingFor, normalizeHour, weatherState } from './weather.ts';

test('normalizes arbitrary hours into [0, 24)', () => {
  assert.equal(normalizeHour(24), 0);
  assert.equal(normalizeHour(-1), 23);
  assert.equal(normalizeHour(49.5), 1.5);
});

test('automatic weather transitions are deterministic and preserve unrelated state', () => {
  const state = weatherState('clear', 23.5);
  const next = advanceWeather(state, 300);
  assert.deepEqual(next, { weather: 'cloudy', hour: 4.5, elapsed: 0 });
  assert.deepEqual(advanceWeather(state, 300), next);
  assert.equal(state.weather, 'clear');
});

test('large and negative time steps remain bounded', () => {
  assert.equal(advanceWeather(weatherState('storm', 0), 0).weather, 'storm');
  assert.equal(advanceWeather(weatherState('clear', 0), -10).elapsed, 0);
  assert.ok(advanceWeather(weatherState(), 10_000).hour >= 0 && advanceWeather(weatherState(), 10_000).hour < 24);
});

test('automatic weather transitions choose a non-repeating state', () => {
  const next = advanceWeatherRandom(weatherState('clear'), 301, () => 0);
  assert.equal(next.weather, 'cloudy');
  assert.ok(lightingFor('clear').volumetricIntensity > 0);
});

test('lighting distinguishes every weather state and includes renderer-neutral controls', () => {
  const clear = lightingFor('clear', 12);
  for (const weather of ['cloudy', 'rain', 'fog', 'storm'] as const) {
    const lighting = lightingFor(weather, 12);
    assert.notDeepEqual(lighting, clear);
    assert.ok(lighting.fog.near > 0 && lighting.fog.far > lighting.fog.near);
    assert.ok(lighting.atmosphericIntensity >= 0);
  }
  assert.equal(lightingFor('rain').rain, 1);
  assert.equal(lightingFor('clear').clouds, 0);
});
