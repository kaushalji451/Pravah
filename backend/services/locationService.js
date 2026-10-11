/**
 * Orchestrates every data source for one location. Each source is fetched
 * independently (Promise.allSettled) so one failing API never breaks the rest.
 */
import { decodeLocationId } from '../utils/ids.js';
import { cache } from '../utils/cache.js';
import { config } from '../config/index.js';
import { SOURCES } from '../utils/provenance.js';
import { getSurveyNear } from './gmdaService.js';
import { getElevationProfile } from './elevationService.js';
import { getRecentRainfall, getAnnualRainfall } from './rainfallService.js';
import { computeRisk } from './riskService.js';
import { computeRecommendation } from './recommendationService.js';
import { IMPACT_DEFAULTS, RWH_DEFAULTS } from '../config/assumptions.js';

const settle = (r) => (r.status === 'fulfilled' ? { ok: true, value: r.value } : { ok: false, error: r.reason?.message || 'unavailable' });

function rwhOverall(s) {
  if (!s) return { status: null, statusLabel: null };
  const { functional, nonFunctional, present, absent } = s;
  if (functional && nonFunctional) return { status: 'mixed', statusLabel: `Mixed: ${functional} functional, ${nonFunctional} non-functional` };
  if (functional) return { status: 'functional', statusLabel: 'Functional' };
  if (nonFunctional) return { status: 'non-functional', statusLabel: 'Non-functional' };
  if (present) return { status: 'present', statusLabel: 'Present (condition not recorded)' };
  if (absent) return { status: 'absent', statusLabel: 'Not available' };
  return { status: 'not-recorded', statusLabel: 'Not recorded' };
}

export async function getLocationDetails(id) {
  const loc = decodeLocationId(id);
  return cache.getOrSet(`details:${id}`, 10 * 60e3, async () => {
    const [g, e, r, a] = await Promise.allSettled([
      getSurveyNear(loc.lat, loc.lng),
      getElevationProfile(loc.lat, loc.lng),
      getRecentRainfall(loc.lat, loc.lng),
      getAnnualRainfall(loc.lat, loc.lng),
    ]);
    const gmda = settle(g);
    const elevation = settle(e);
    const rainfall = settle(r);
    const annual = settle(a);

    const gv = gmda.ok ? gmda.value : null;
    const wl = gv?.summary.waterlogging ?? null;
    const gmdaSource = config.demoMode ? SOURCES.demo : SOURCES.gmda;
    const locationSource = loc.sourceId === 'gmda' ? SOURCES.gmda : loc.sourceId === 'nominatim' ? SOURCES.nominatim : { id: loc.sourceId, name: loc.sourceId, type: 'public' };

    const risk = computeRisk({ gmda, rainfall, elevation });

    const used = new Map();
    const use = (s) => used.set(s.id, s);
    use(locationSource);
    use(gmdaSource);
    use(SOURCES.openMeteo);
    use(SOURCES.openElevation);
    use(SOURCES.pravah);

    const result = {
      id,
      dataMode: config.demoMode ? 'demo' : 'live',
      generatedAt: new Date().toISOString(),
      location: { name: loc.name, lat: loc.lat, lng: loc.lng, source: locationSource },

      waterlogging: {
        available: gmda.ok && wl !== null,
        error: gmda.ok ? (wl === null ? 'No waterlogging field identified in the GMDA layer.' : undefined) : gmda.error,
        surveyCount: gv ? gv.summary.surveyCount : null,
        reportedCount: wl ? wl.reported : null,
        notReportedCount: wl ? wl.notReported : null,
        unknownCount: wl ? wl.unknown : null,
        status: !wl ? null : wl.reported > 0 ? 'Waterlogging reported nearby' : gv.summary.surveyCount > 0 ? 'No waterlogging in nearby survey records' : 'No survey records nearby',
        field: gv?.roles.waterlogging.field ?? null,
        fieldLabel: gv?.roles.waterlogging.label ?? null,
        radiusM: gv?.radiusM ?? config.gmda.searchRadiusM,
        truncated: gv?.truncated ?? false,
        source: gmdaSource,
      },

      rainwaterHarvesting: {
        available: gmda.ok && gv.summary.rwh !== null,
        error: gmda.ok ? (gv.summary.rwh === null ? 'No rainwater-harvesting field identified in the GMDA layer.' : undefined) : gmda.error,
        ...rwhOverall(gv?.summary.rwh),
        counts: gv?.summary.rwh ?? null,
        fields: gv ? [gv.roles.rwhStatus, gv.roles.rwhCondition].filter((x) => x.field).map((x) => ({ field: x.field, label: x.label })) : [],
        source: gmdaSource,
      },

      elevation: elevation.ok
        ? { available: elevation.value.meters !== null, ...elevation.value }
        : { available: false, error: elevation.error, meters: null, surroundingMeanM: null, relativeM: null, ringRadiusM: config.elevation.ringRadiusM, source: SOURCES.openElevation },

      rainfall: {
        ...(rainfall.ok
          ? { available: true, ...rainfall.value }
          : { available: false, error: rainfall.error, dailyMm: null, dailyDate: null, sevenDayTotalMm: null, sevenDayMaxDailyMm: null, thirtyDayTotalMm: null, series: [], source: SOURCES.openMeteo }),
        annual: annual.ok
          ? { available: annual.value.meanAnnualMm !== null, ...annual.value }
          : { available: false, error: annual.error, meanAnnualMm: null, period: null, years: [], source: SOURCES.openMeteo },
      },

      risk,
      gmda: {
        available: gmda.ok,
        error: gmda.ok ? undefined : gmda.error,
        roles: gv?.roles ?? null,
        records: gv?.records ?? [],
      },
      sources: [...used.values()],
      assumptions: { impact: IMPACT_DEFAULTS, rwh: RWH_DEFAULTS },
    };
    result.recommendation = computeRecommendation({
      risk,
      rwh: result.rainwaterHarvesting,
      annualMm: result.rainfall.annual.meanAnnualMm,
    });
    return result;
  });
}
