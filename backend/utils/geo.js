const R = 6371000;
const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

export function haversineM(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** [xmin, ymin, xmax, ymax] in WGS84 degrees around a point. */
export function bboxAround(lat, lng, radiusM) {
  const dLat = toDeg(radiusM / R);
  const dLng = toDeg(radiusM / (R * Math.cos(toRad(lat))));
  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat];
}

/** n points evenly spaced on a circle of radiusM around (lat, lng). */
export function ringPoints(lat, lng, radiusM, n = 8) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const bearing = (2 * Math.PI * i) / n;
    const dLat = toDeg((radiusM * Math.cos(bearing)) / R);
    const dLng = toDeg((radiusM * Math.sin(bearing)) / (R * Math.cos(toRad(lat))));
    out.push({ lat: lat + dLat, lng: lng + dLng });
  }
  return out;
}

/**
 * Converts an Esri JSON geometry (already requested with outSR=4326) to a single
 * representative point. Points are used as-is; lines/polygons use the vertex mean.
 */
export function esriGeometryToLatLng(geometry) {
  if (!geometry) return null;
  if (typeof geometry.x === 'number' && typeof geometry.y === 'number') {
    return { lat: geometry.y, lng: geometry.x };
  }
  const parts = geometry.rings || geometry.paths || (geometry.points ? [geometry.points] : null);
  if (!parts?.length) return null;
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const part of parts) for (const [x, y] of part) { sx += x; sy += y; n++; }
  return n ? { lat: sy / n, lng: sx / n } : null;
}

export function isValidLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}
