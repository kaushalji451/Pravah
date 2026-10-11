/**
 * Open-Elevation lookups (server-side only).
 * The profile samples the point AND a ring of 8 points around it, so Pravah can
 * say whether the location sits lower than its surroundings. Elevation alone
 * does not predict flooding; it is one supporting factor.
 */
import { config } from '../config/index.js';
import { fetchJson, UpstreamError } from '../utils/http.js';
import { cache } from '../utils/cache.js';
import { ringPoints } from '../utils/geo.js';
import { SOURCES } from '../utils/provenance.js';

async function lookup(points) {
  const data = await fetchJson(config.elevation.url, {
    method: 'POST',
    service: 'Open-Elevation',
    timeoutMs: config.elevation.timeoutMs,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locations: points.map((p) => ({ latitude: p.lat, longitude: p.lng })) }),
  });
  if (!Array.isArray(data?.results)) throw new UpstreamError('Open-Elevation', 'unexpected response shape');
  return data.results.map((r) => (typeof r.elevation === 'number' ? r.elevation : null));
}

export async function getElevation(lat, lng) {
  return cache.getOrSet(`elev:${lat.toFixed(5)},${lng.toFixed(5)}`, 7 * 24 * 3600e3, async () => {
    const [elevation] = await lookup([{ lat, lng }]);
    return { elevation, unit: 'meters', source: 'Open-Elevation', provenance: SOURCES.openElevation };
  });
}

export async function getElevationProfile(lat, lng) {
  const radius = config.elevation.ringRadiusM;
  return cache.getOrSet(`elevp:${lat.toFixed(5)},${lng.toFixed(5)},${radius}`, 7 * 24 * 3600e3, async () => {
    const ring = ringPoints(lat, lng, radius, 8);
    const values = await lookup([{ lat, lng }, ...ring]);
    const center = values[0];
    const ringVals = values.slice(1).filter((v) => v !== null);
    const mean = ringVals.length ? ringVals.reduce((a, b) => a + b, 0) / ringVals.length : null;
    return {
      meters: center,
      surroundingMeanM: mean === null ? null : Math.round(mean * 10) / 10,
      relativeM: center === null || mean === null ? null : Math.round((center - mean) * 10) / 10,
      ringRadiusM: radius,
      ringSamples: ringVals.length,
      source: SOURCES.openElevation,
    };
  });
}
