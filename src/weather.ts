export type ForecastDay = { date: string; min: number | null; max: number | null };

export function forecastUrl(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('Invalid location coordinates.');
  }
  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: 'temperature_2m_min,temperature_2m_max',
    temperature_unit: 'celsius',
    timezone: 'auto',
    forecast_days: '7',
  });
  return 'https://api.open-meteo.com/v1/forecast?' + query.toString();
}

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('The forecast service returned an invalid response.');
  }
  return value as Record<string, unknown>;
}

export function parseForecast(value: unknown): ForecastDay[] {
  const response = object(value);
  const daily = object(response.daily);
  const units = object(response.daily_units);
  if (units.temperature_2m_min !== '°C' || units.temperature_2m_max !== '°C') {
    throw new Error('The forecast temperatures are not in Celsius.');
  }
  const dates = daily.time;
  const minimums = daily.temperature_2m_min;
  const maximums = daily.temperature_2m_max;
  if (!Array.isArray(dates) || !Array.isArray(minimums) || !Array.isArray(maximums) ||
      dates.length !== 7 || minimums.length !== 7 || maximums.length !== 7) {
    throw new Error('The service did not return a complete 7-day forecast.');
  }
  return dates.map((date: unknown, index) => {
    const min: unknown = minimums[index];
    const max: unknown = maximums[index];
    const valid = (temperature: unknown): temperature is number | null =>
      temperature === null || (typeof temperature === 'number' && Number.isFinite(temperature));
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !valid(min) || !valid(max) || (min !== null && max !== null && min > max)) {
      throw new Error('The service returned an invalid forecast day.');
    }
    return { date, min, max };
  });
}

export async function loadForecast(latitude: number, longitude: number): Promise<ForecastDay[]> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 20000);
  try {
    const response = await fetch(forecastUrl(latitude, longitude), { signal: abort.signal });
    if (!response.ok) throw new Error('Weather request failed (HTTP ' + response.status + ').');
    return parseForecast(await response.json());
  } finally {
    clearTimeout(timer);
  }
}

export function temperature(value: number | null): string {
  return value === null ? 'not available' : value.toFixed(1) + ' °C';
}
