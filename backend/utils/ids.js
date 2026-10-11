import { config } from '../config/index.js';
import { BadRequestError } from './http.js';

/**
 * Location ids are self-describing (base64url JSON) so the API stays stateless:
 * { n: name, a: lat, o: lng, s: source id }
 */
export function encodeLocationId({ name, lat, lng, source }) {
  const payload = { n: String(name).slice(0, 120), a: +lat.toFixed(6), o: +lng.toFixed(6), s: source };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeLocationId(id) {
  let o;
  try {
    o = JSON.parse(Buffer.from(String(id), 'base64url').toString('utf8'));
  } catch {
    throw new BadRequestError('Invalid location id.');
  }
  const lat = Number(o?.a);
  const lng = Number(o?.o);
  assertInGurugram(lat, lng);
  return { name: String(o.n || 'Selected location'), lat, lng, sourceId: String(o.s || 'unknown') };
}

export function assertInGurugram(lat, lng) {
  const b = config.bounds;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < b.minLat || lat > b.maxLat || lng < b.minLng || lng > b.maxLng) {
    throw new BadRequestError('Coordinates must be inside the Gurugram area.');
  }
}

export function parseLatLng(query) {
  const lat = Number(query.lat);
  const lng = Number(query.lng);
  assertInGurugram(lat, lng);
  return { lat, lng };
}
