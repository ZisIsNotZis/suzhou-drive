export const weatherKinds = ['clear', 'cloudy', 'rain', 'fog', 'storm'] as const;
export type WeatherKind = (typeof weatherKinds)[number];

export type WeatherState = {
  weather: WeatherKind;
  hour: number;
  elapsed: number;
};

export type Lighting = {
  background: string;
  fog: { color: string; near: number; far: number };
  sun: { color: string; intensity: number; elevation: number };
  hemi: { sky: string; ground: string; intensity: number };
  rain: number;
  clouds: number;
  atmosphericIntensity: number;
  volumetricIntensity: number;
};

const order: WeatherKind[] = ['clear', 'cloudy', 'rain', 'fog', 'storm'];
const durations: Record<WeatherKind, number> = { clear: 300, cloudy: 240, rain: 210, fog: 180, storm: 150 };

/** Keep clock values useful at boundaries while accepting arbitrary input. */
export function normalizeHour(hour: number): number {
  if (!Number.isFinite(hour)) return 0;
  return ((hour % 24) + 24) % 24;
}

export function weatherState(weather: WeatherKind = 'clear', hour = 12): WeatherState {
  return { weather, hour: normalizeHour(hour), elapsed: 0 };
}

/** Pure, fixed-order weather progression; dt is seconds and may span transitions. */
export function advanceWeather(state: WeatherState, dt: number): WeatherState {
  let weather = state.weather;
  let elapsed = Math.max(0, Number.isFinite(state.elapsed) ? state.elapsed : 0);
  let remaining = Math.max(0, Number.isFinite(dt) ? dt : 0);
  let hour = normalizeHour(state.hour + remaining / 60);
  while (remaining > 0) {
    const untilChange = durations[weather] - elapsed;
    if (remaining < untilChange) return { weather, hour, elapsed: elapsed + remaining };
    remaining -= Math.max(0, untilChange);
    weather = order[(order.indexOf(weather) + 1) % order.length];
    elapsed = 0;
  }
  return { weather, hour, elapsed };
}

/** Advance through the same weather durations, choosing the next state randomly. */
export function advanceWeatherRandom(state: WeatherState, dt: number, random: () => number = Math.random): WeatherState {
  let weather = state.weather;
  let elapsed = Math.max(0, Number.isFinite(state.elapsed) ? state.elapsed : 0);
  let remaining = Math.max(0, Number.isFinite(dt) ? dt : 0);
  let hour = normalizeHour(state.hour + remaining / 60);
  while (remaining > 0) {
    const untilChange = durations[weather] - elapsed;
    if (remaining < untilChange) return { weather, hour, elapsed: elapsed + remaining };
    remaining -= Math.max(0, untilChange);
    const candidates = order.filter(kind => kind !== weather);
    weather = candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(Math.max(0, Math.min(.999999, random())) * candidates.length)))]!;
    elapsed = 0;
  }
  return { weather, hour, elapsed };
}

function daylight(hour: number): number {
  return Math.max(0, Math.sin((normalizeHour(hour) - 6) * Math.PI / 12));
}

/** Convert simulation state into serializable renderer inputs. */
export function lightingFor(weather: WeatherKind, hour = 12): Lighting {
  const day = daylight(hour);
  const settings: Record<WeatherKind, Omit<Lighting, 'sun' | 'hemi'>> = {
    clear: { background: '#9ac5df', fog: { color: '#9ac5df', near: 80, far: 310 }, rain: 0, clouds: 0, atmosphericIntensity: .08, volumetricIntensity: .16 },
    cloudy: { background: '#899ca2', fog: { color: '#899ca2', near: 65, far: 250 }, rain: 0, clouds: .55, atmosphericIntensity: .22, volumetricIntensity: .28 },
    rain: { background: '#607887', fog: { color: '#607887', near: 35, far: 180 }, rain: 1, clouds: .8, atmosphericIntensity: .48, volumetricIntensity: .2 },
    fog: { background: '#a9b2ae', fog: { color: '#a9b2ae', near: 12, far: 95 }, rain: 0, clouds: .35, atmosphericIntensity: .8, volumetricIntensity: .1 },
    storm: { background: '#394957', fog: { color: '#394957', near: 25, far: 145 }, rain: 1, clouds: 1, atmosphericIntensity: .72, volumetricIntensity: .08 },
  };
  const base = settings[weather];
  return {
    ...base,
    sun: { color: day > .05 ? '#fff1d0' : '#9baec4', intensity: .12 + day * (weather === 'storm' ? .7 : weather === 'cloudy' ? 1.15 : .1 + 1.55), elevation: day },
    hemi: { sky: base.background, ground: '#43504b', intensity: .2 + day * (weather === 'storm' ? .25 : weather === 'rain' ? .55 : .9) },
  };
}
