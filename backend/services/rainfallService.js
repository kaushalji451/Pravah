/**
 * Rainfall from Open-Meteo (no key needed).
 *
 * Why not IMD directly? IMD's web APIs are granted on request with IP
 * whitelisting, and its gridded rainfall is distributed as bulk files rather
 * than a point API. Open-Meteo is used so the prototype works out of the box,
 * and it is labelled as Open-Meteo (never as IMD) everywhere.
 * To plug in IMD or India-WRIS later, implement getRecentRainfall /
 * getAnnualRainfall with the same return shape.
 */
import { config } from '../config/index.js';
import { fetchJson, UpstreamError } from '../utils/http.js';
import { cache } from '../utils/cache.js';
import { SOURCES } from '../utils/provenance.js';

const round1 = (v) => Math.round(v * 10) / 10;
const todayIST = () => new Intl.DateTimeFormat('en-CA', { timeZone: config.rainfall.timezone }).format(new Date());

function readDaily(data) {
  const t = data?.daily?.time;
  const p = data?.daily?.precipitation_sum;
  if (!Array.isArray(t) || !Array.isArray(p)) throw new UpstreamError('Open-Meteo', 'response has no daily precipitation');
  return t.map((date, i) => ({ date, mm: typeof p[i] === 'number' ? round1(p[i]) : null }));
}

export async function getRecentRainfall(lat, lng) {
  return cache.getOrSet(`rain:recent:${lat.toFixed(3)},${lng.toFixed(3)}`, 30 * 60e3, async () => {
    const qs = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      daily: 'precipitation_sum',
      past_days: '30',
      forecast_days: '1',
      timezone: config.rainfall.timezone,
    });
    const data = await fetchJson(`${config.rainfall.forecastUrl}?${qs}`, { service: 'Open-Meteo', timeoutMs: config.rainfall.timeoutMs });
    const today = todayIST();
    const past = readDaily(data).filter((d) => d.date < today); // completed days only
    const known = (arr) => arr.filter((d) => d.mm !== null);
    const last7 = past.slice(-7);
    const lastDay = past.at(-1) ?? null;
    const sum = (arr) => (known(arr).length ? round1(known(arr).reduce((a, d) => a + d.mm, 0)) : null);
    const max = (arr) => (known(arr).length ? Math.max(...known(arr).map((d) => d.mm)) : null);
    return {
      dailyMm: lastDay?.mm ?? null,
      dailyDate: lastDay?.date ?? null,
      sevenDayTotalMm: sum(last7),
      sevenDayMaxDailyMm: max(last7),
      thirtyDayTotalMm: sum(past),
      series: past,
      source: SOURCES.openMeteo,
    };
  });
}

/** Mean annual rainfall over the last N complete calendar years. */
export async function getAnnualRainfall(lat, lng) {
  const years = config.rainfall.climatologyYears;
  const endYear = new Date().getFullYear() - 1;
  const startYear = endYear - years + 1;
  return cache.getOrSet(`rain:annual:${lat.toFixed(2)},${lng.toFixed(2)},${startYear}`, 7 * 24 * 3600e3, async () => {
    const qs = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      start_date: `${startYear}-01-01`,
      end_date: `${endYear}-12-31`,
      daily: 'precipitation_sum',
      timezone: config.rainfall.timezone,
    });
    const data = await fetchJson(`${config.rainfall.archiveUrl}?${qs}`, { service: 'Open-Meteo archive', timeoutMs: 25000 });
    const byYear = new Map();
    for (const d of readDaily(data)) {
      if (d.mm === null) continue;
      const y = Number(d.date.slice(0, 4));
      const e = byYear.get(y) || { total: 0, days: 0 };
      e.total += d.mm;
      e.days += 1;
      byYear.set(y, e);
    }
    // Only count years with near-complete data.
    const yearly = [...byYear.entries()]
      .filter(([, e]) => e.days >= 360)
      .map(([year, e]) => ({ year, totalMm: Math.round(e.total) }))
      .sort((a, b) => a.year - b.year);
    const mean = yearly.length ? Math.round(yearly.reduce((a, y) => a + y.totalMm, 0) / yearly.length) : null;
    return { meanAnnualMm: mean, period: `${startYear}–${endYear}`, years: yearly, source: SOURCES.openMeteo };
  });
}
