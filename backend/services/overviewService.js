/**
 * Gurugram-wide hotspot view.
 *
 * Bins every GMDA survey point into a grid and counts, per cell, how many are
 * waterlogging points and what rainwater-harvesting structures were recorded.
 * Cell levels are a Pravah calculation from GMDA points — a density of SURVEYED
 * points, not a flood map. A cell with no waterlogging point is not proof that
 * the area never floods.
 */
import { HOTSPOT_PARAMS } from '../config/assumptions.js';
import { cache } from '../utils/cache.js';
import { config } from '../config/index.js';
import { encodeLocationId } from '../utils/ids.js';
import { SOURCES } from '../utils/provenance.js';
import { getAllRecords } from './gmdaService.js';

function levelFor(reported) {
  if (reported >= HOTSPOT_PARAMS.highAtReported) return 'high';
  if (reported >= HOTSPOT_PARAMS.mediumAtReported) return 'medium';
  if (reported >= 1) return 'low';
  return 'none';
}

export async function getCityOverview() {
  return cache.getOrSet(`overview:${config.demoMode ? 'demo' : 'live'}`, 60 * 60e3, async () => {
    const all = await getAllRecords();
    const size = HOTSPOT_PARAMS.cellDeg;
    const cells = new Map();

    for (const r of all.records) {
      const key = `${Math.floor(r.lat / size)}:${Math.floor(r.lng / size)}`;
      const c =
        cells.get(key) ||
        { sumLat: 0, sumLng: 0, wlLat: 0, wlLng: 0, n: 0, reported: 0, functional: 0, needsWork: 0, present: 0, absent: 0, names: new Map() };
      c.n += 1;
      c.sumLat += r.lat;
      c.sumLng += r.lng;
      if (r.waterlogging.interpretation === 'reported') {
        c.reported += 1;
        c.wlLat += r.lat;
        c.wlLng += r.lng;
      }
      const k = r.rwh.classification;
      if (k === 'functional') c.functional += 1;
      else if (k === 'non-functional') c.needsWork += 1;
      else if (k === 'present') c.present += 1;
      else if (k === 'absent') c.absent += 1;
      if (r.locality && typeof r.locality === 'string') c.names.set(r.locality, (c.names.get(r.locality) || 0) + 1);
      cells.set(key, c);
    }

    const out = [...cells.entries()].map(([key, c]) => {
      // Centre the cell on its waterlogging points when it has any, so "Analyse" lands on them.
      const lat = c.reported ? c.wlLat / c.reported : c.sumLat / c.n;
      const lng = c.reported ? c.wlLng / c.reported : c.sumLng / c.n;
      const topName = [...c.names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      const name = topName ? String(topName) : `Area near ${lat.toFixed(3)}, ${lng.toFixed(3)}`;
      return {
        key,
        id: encodeLocationId({ name, lat, lng, source: 'gmda' }),
        name,
        lat: +lat.toFixed(6),
        lng: +lng.toFixed(6),
        points: c.n,
        reported: c.reported,
        rwh: { functional: c.functional, needsWork: c.needsWork, present: c.present, absent: c.absent },
        level: levelFor(c.reported),
      };
    });

    const totals = out.reduce(
      (t, c) => ({
        points: t.points + c.points,
        reported: t.reported + c.reported,
        rwhFunctional: t.rwhFunctional + c.rwh.functional,
        rwhNeedsWork: t.rwhNeedsWork + c.rwh.needsWork,
        cellsHigh: t.cellsHigh + (c.level === 'high' ? 1 : 0),
      }),
      { points: 0, reported: 0, rwhFunctional: 0, rwhNeedsWork: 0, cellsHigh: 0 },
    );

    return {
      dataMode: all.dataMode,
      generatedAt: new Date().toISOString(),
      truncated: all.truncated,
      params: HOTSPOT_PARAMS,
      method: `GMDA survey points grouped into ~${Math.round(HOTSPOT_PARAMS.cellDeg * 111)} km cells. High = ${HOTSPOT_PARAMS.highAtReported}+ waterlogging points, medium = ${HOTSPOT_PARAMS.mediumAtReported}–${HOTSPOT_PARAMS.highAtReported - 1}, low = 1.`,
      caveat: 'Counts of surveyed points, not a flood map. Areas with few survey points may still waterlog.',
      totals,
      cells: out,
      hotspots: out
        .filter((c) => c.reported > 0)
        .sort((a, b) => b.reported - a.reported || b.points - a.points)
        .slice(0, HOTSPOT_PARAMS.topHotspots),
      sources: [all.dataMode === 'demo' ? SOURCES.demo : SOURCES.gmda, SOURCES.pravah],
    };
  });
}
