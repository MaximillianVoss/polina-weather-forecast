import test from 'node:test';
import assert from 'node:assert/strict';
import { forecastUrl, parseForecast, temperature } from '../src/weather.ts';

function sample() {
  return { daily_units: { temperature_2m_min: '°C', temperature_2m_max: '°C' },
    daily: { time: Array.from({ length: 7 }, (_, i) => '2026-09-' + (20 + i)),
      temperature_2m_min: [-2, 0, 3, 4, 5, 6, null],
      temperature_2m_max: [4, 6, 10, 11, 12, 13, null] } };
}
test('requests 7 daily 2m temperatures in Celsius for the device location', () => {
  const url = new URL(forecastUrl(60.2, 24.9));
  assert.equal(url.searchParams.get('forecast_days'), '7');
  assert.equal(url.searchParams.get('latitude'), '60.2');
  assert.equal(url.searchParams.get('daily'), 'temperature_2m_min,temperature_2m_max');
  assert.equal(url.searchParams.get('temperature_unit'), 'celsius');
  assert.equal(url.searchParams.get('timezone'), 'auto');
});
test('parses 7 days and preserves missing temperatures as null', () => {
  const days = parseForecast(sample());
  assert.equal(days.length, 7);
  assert.deepEqual(days[0], { date: '2026-09-20', min: -2, max: 4 });
  assert.equal(days[6]?.min, null);
  assert.equal(temperature(null), 'not available');
});
test('rejects invalid coordinates and incomplete payloads', () => {
  assert.throws(() => forecastUrl(91, 0));
  assert.throws(() => parseForecast({}));
  const value = sample();
  value.daily.time.pop();
  assert.throws(() => parseForecast(value));
});
test('rejects wrong units and malformed temperature values', () => {
  const value = sample();
  value.daily_units.temperature_2m_min = '°F';
  assert.throws(() => parseForecast(value));
  const reversed = sample();
  reversed.daily.temperature_2m_min[0] = 999;
  assert.throws(() => parseForecast(reversed));
});
