import { Router } from 'express';
import { searchLocalities } from '../services/gmdaService.js';
import { geocode } from '../services/geocodeService.js';
import { getLocationDetails } from '../services/locationService.js';
import { encodeLocationId } from '../utils/ids.js';
import { haversineM } from '../utils/geo.js';
import { SOURCES } from '../utils/provenance.js';
import { BadRequestError } from '../utils/http.js';

export const societiesRouter = Router();

/** GET /api/societies/search?q=Sushant */
societiesRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) throw new BadRequestError('Type at least 2 characters to search.');
    if (q.length > 80) throw new BadRequestError('Search text is too long.');

    const [gmda, osm] = await Promise.allSettled([searchLocalities(q), geocode(q)]);
    const results = [];
    const warnings = [];

    if (gmda.status === 'fulfilled') {
      for (const g of gmda.value) {
        results.push({
          id: encodeLocationId({ name: g.name, lat: g.lat, lng: g.lng, source: 'gmda' }),
          name: g.name,
          detail: `Centre of ${g.recordCount} GMDA survey point${g.recordCount === 1 ? '' : 's'} with this name`,
          lat: g.lat,
          lng: g.lng,
          source: SOURCES.gmda,
        });
      }
    } else warnings.push(`GMDA locality search unavailable: ${gmda.reason?.message}`);

    if (osm.status === 'fulfilled') {
      for (const o of osm.value) {
        // Skip OSM hits that duplicate a GMDA hit within 300 m.
        if (results.some((r) => haversineM(r.lat, r.lng, o.lat, o.lng) < 300)) continue;
        results.push({
          id: encodeLocationId({ name: o.name, lat: o.lat, lng: o.lng, source: 'nominatim' }),
          name: o.name,
          detail: o.displayName,
          lat: o.lat,
          lng: o.lng,
          source: SOURCES.nominatim,
        });
      }
    } else warnings.push(`Geocoder unavailable: ${osm.reason?.message}`);

    res.json({ query: q, results: results.slice(0, 8), warnings });
  } catch (err) {
    next(err);
  }
});

/** GET /api/societies/:id — everything Pravah knows about one location. */
societiesRouter.get('/:id', async (req, res, next) => {
  try {
    res.json(await getLocationDetails(req.params.id));
  } catch (err) {
    next(err);
  }
});
