import { Router } from 'express';
import { getElevation } from '../services/elevationService.js';
import { getRecentRainfall, getAnnualRainfall } from '../services/rainfallService.js';
import { getLocationDetails } from '../services/locationService.js';
import { computeRwh } from '../services/rwhService.js';
import { getCityOverview } from '../services/overviewService.js';
import { parseLatLng } from '../utils/ids.js';
import { BadRequestError } from '../utils/http.js';

export const dataRouter = Router();

/** GET /api/elevation?lat=28.4595&lng=77.0795 */
dataRouter.get('/elevation', async (req, res, next) => {
  try {
    const { lat, lng } = parseLatLng(req.query);
    res.json(await getElevation(lat, lng));
  } catch (err) {
    next(err);
  }
});

/** GET /api/rainfall?lat=&lng= — recent + 10-year annual (each can fail on its own). */
dataRouter.get('/rainfall', async (req, res, next) => {
  try {
    const { lat, lng } = parseLatLng(req.query);
    const [recent, annual] = await Promise.allSettled([getRecentRainfall(lat, lng), getAnnualRainfall(lat, lng)]);
    res.json({
      recent: recent.status === 'fulfilled' ? recent.value : { error: recent.reason?.message },
      annual: annual.status === 'fulfilled' ? annual.value : { error: annual.reason?.message },
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/risk/:id */
dataRouter.get('/risk/:id', async (req, res, next) => {
  try {
    const d = await getLocationDetails(req.params.id);
    res.json({ location: d.location, dataMode: d.dataMode, ...d.risk });
  } catch (err) {
    next(err);
  }
});

const optNum = (v) => (v === undefined || v === '' ? undefined : Number(v));

/** GET /api/rwh/:id?areaSqft=20000&annualRainfallMm=&runoffCoefficient=&pricePerKl= */
dataRouter.get('/rwh/:id', async (req, res, next) => {
  try {
    const d = await getLocationDetails(req.params.id);
    const userRain = optNum(req.query.annualRainfallMm);
    if (userRain !== undefined && !(userRain > 0 && userRain < 5000)) throw new BadRequestError('Annual rainfall must be between 0 and 5000 mm.');

    const annualRainfall =
      userRain !== undefined
        ? { value: userRain, provenance: 'user', label: 'User-provided' }
        : d.rainfall.annual.available
          ? { value: d.rainfall.annual.meanAnnualMm, provenance: 'public', label: `Open-Meteo mean, ${d.rainfall.annual.period}` }
          : null;

    res.json({
      location: d.location,
      ...computeRwh({
        areaSqft: optNum(req.query.areaSqft),
        annualRainfall,
        runoffCoefficient: optNum(req.query.runoffCoefficient),
        pricePerKl: optNum(req.query.pricePerKl),
      }),
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/overview — Gurugram-wide waterlogging hotspot grid from GMDA survey points. */
dataRouter.get('/overview', async (_req, res, next) => {
  try {
    res.json(await getCityOverview());
  } catch (err) {
    next(err);
  }
});
