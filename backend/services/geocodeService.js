/**
 * OpenStreetMap Nominatim geocoding, restricted to a Gurugram bounding box.
 * Usage policy: max 1 request/second and an identifying User-Agent, so calls are
 * throttled server-side and cached for 24 h.
 */
import { config } from '../config/index.js';
import { fetchJson, sleep } from '../utils/http.js';
import { cache } from '../utils/cache.js';

let nextSlot = 0;
async function throttle() {
  const now = Date.now();
  const slot = Math.max(now, nextSlot);
  nextSlot = slot + 1100;
  if (slot > now) await sleep(slot - now);
}

function shortName(d) {
  const a = d.address || {};
  const primary = d.name || d.display_name?.split(',')[0] || 'Unnamed place';
  const area = a.suburb || a.neighbourhood || a.city_district || a.quarter;
  return area && area !== primary ? `${primary}, ${area}` : primary;
}

export async function geocode(q) {
  const key = `geo:${q.toLowerCase()}`;
  return cache.getOrSet(key, 24 * 3600e3, async () => {
    await throttle();
    const qs = new URLSearchParams({
      q: `${q}, Gurugram, Haryana`,
      format: 'jsonv2',
      limit: '8',
      countrycodes: 'in',
      viewbox: config.geocoder.viewbox,
      bounded: '1',
      addressdetails: '1',
    });
    const data = await fetchJson(`${config.geocoder.url}?${qs}`, {
      service: 'Nominatim',
      timeoutMs: 10000,
      headers: { 'User-Agent': config.geocoder.userAgent, 'Accept-Language': 'en' },
    });
    if (!Array.isArray(data)) return [];
    return data.map((d) => ({
      name: shortName(d),
      displayName: d.display_name,
      lat: Number(d.lat),
      lng: Number(d.lon),
      kind: d.type || d.category || null,
    }));
  });
}
