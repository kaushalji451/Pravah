import { Router } from 'express';
import { config } from '../config/index.js';
import { getLayerSchema } from '../services/gmdaService.js';
import { SOURCES } from '../utils/provenance.js';
import { RISK_WEIGHTS, RISK_PARAMS, RWH_DEFAULTS } from '../config/assumptions.js';

export const metaRouter = Router();

metaRouter.get('/health', (_req, res) => {
  res.json({ ok: true, dataMode: config.demoMode ? 'demo' : 'live', time: new Date().toISOString() });
});

/** Every source and every assumption, for the "Where does Pravah get its data?" section. */
metaRouter.get('/sources', (_req, res) => {
  const list = [SOURCES.gmda, SOURCES.openMeteo, SOURCES.openElevation, SOURCES.nominatim, SOURCES.pravah];
  if (config.demoMode) list.unshift(SOURCES.demo);
  res.json({ dataMode: config.demoMode ? 'demo' : 'live', sources: list, assumptions: { RISK_WEIGHTS, RISK_PARAMS, RWH_DEFAULTS } });
});

/** The live GMDA schema and which real field Pravah uses for each role. */
metaRouter.get('/gmda/schema', async (_req, res, next) => {
  try {
    res.json(await getLayerSchema());
  } catch (err) {
    next(err);
  }
});
