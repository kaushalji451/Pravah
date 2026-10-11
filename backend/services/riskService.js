/**
 * Pravah Indicative Risk Score — a transparent, configurable project model.
 * NOT an official flood-risk rating. Weights live in config/assumptions.js.
 *
 * Missing inputs are never treated as zero: a factor without data is dropped,
 * the remaining weights are re-normalised, and confidence goes down. If too
 * little weight remains, the result is "Insufficient data".
 */
import { RISK_WEIGHTS, RISK_PARAMS } from '../config/assumptions.js';
import { SOURCES } from '../utils/provenance.js';

const clamp = (v) => Math.max(0, Math.min(100, v));

function waterloggingFactor(gmda) {
  if (!gmda?.ok) return { score: null, detail: `GMDA survey unavailable (${gmda?.error || 'no response'}).` };
  const s = gmda.value.summary;
  if (!s.waterlogging) return { score: null, detail: 'The GMDA layer has no field Pravah could identify as waterlogging.' };
  const radius = gmda.value.radiusM;
  const what = gmda.value.dataMode === 'demo' ? 'DEMO (synthetic) records' : 'GMDA survey records';
  if (s.surveyCount === 0) {
    return {
      score: 0,
      detail: `No ${what} within ${radius} m. That is not evidence of no waterlogging.`,
      caveat: 'No GMDA survey records nearby, so the waterlogging factor is weak evidence.',
    };
  }
  const { reported, notReported, unknown } = s.waterlogging;
  const score = clamp((reported / RISK_PARAMS.waterlogging.saturationReportedCount) * 100);
  return {
    score: Math.round(score),
    detail: `${reported} of ${s.surveyCount} ${what} within ${radius} m report waterlogging (${notReported} do not, ${unknown} unrecorded).`,
  };
}

function rainfallFactor(rain) {
  if (!rain?.ok) return { score: null, detail: `Recent rainfall unavailable (${rain?.error || 'no response'}).` };
  const { sevenDayMaxDailyMm: maxDaily, sevenDayTotalMm: total } = rain.value;
  if (maxDaily === null && total === null) return { score: null, detail: 'Rainfall source returned no values for the last 7 days.' };
  const p = RISK_PARAMS.rainfall;
  const intensity = maxDaily === null ? 0 : (maxDaily / p.veryHeavyDailyMm) * 100;
  const accumulation = total === null ? 0 : (total / p.sevenDayCapMm) * 100;
  const heavy = maxDaily !== null && maxDaily >= p.heavyDailyMm;
  return {
    score: Math.round(clamp(Math.max(intensity, accumulation))),
    detail: `${total ?? '—'} mm over the last 7 days, wettest day ${maxDaily ?? '—'} mm${heavy ? ' (heavy by IMD daily category)' : ''}.`,
  };
}

function elevationFactor(elev) {
  if (!elev?.ok) return { score: null, detail: `Elevation unavailable (${elev?.error || 'no response'}).` };
  const { relativeM, meters, ringRadiusM } = elev.value;
  if (relativeM === null) return { score: null, detail: 'Could not compare elevation with the surrounding area.' };
  const score = clamp(50 - relativeM * RISK_PARAMS.elevation.pointsPerMetre);
  const where = relativeM < -0.5 ? 'lower than' : relativeM > 0.5 ? 'higher than' : 'about level with';
  return {
    score: Math.round(score),
    detail: `${meters} m, ${Math.abs(relativeM)} m ${where} the average ${ringRadiusM} m around it.`,
  };
}

function levelFor(score) {
  return RISK_PARAMS.levels.find((l) => score <= l.max)?.label ?? 'High';
}

const CONF = ['Low', 'Medium', 'High'];

/** Each input is { ok: true, value } | { ok: false, error }. */
export function computeRisk({ gmda, rainfall, elevation }) {
  const raw = {
    waterlogging: waterloggingFactor(gmda),
    rainfall: rainfallFactor(rainfall),
    elevation: elevationFactor(elevation),
  };
  const labels = { waterlogging: 'GMDA waterlogging survey', rainfall: 'Recent rainfall', elevation: 'Relative elevation' };

  const totalWeight = Object.values(RISK_WEIGHTS).reduce((a, b) => a + b, 0);
  const factors = Object.entries(raw).map(([key, f]) => ({
    key,
    label: labels[key],
    weight: RISK_WEIGHTS[key] / totalWeight,
    score: f.score,
    available: f.score !== null,
    detail: f.detail,
  }));

  const usable = factors.filter((f) => f.available);
  const coverage = usable.reduce((a, f) => a + f.weight, 0);
  const caveats = Object.values(raw).map((f) => f.caveat).filter(Boolean);
  for (const f of factors) if (!f.available) caveats.push(`${f.label} left out: ${f.detail}`);

  const base = {
    model: 'Pravah Indicative Risk Score',
    disclaimer:
      'A Pravah project model built from public data. It is not an official flood-risk rating, and its weights are Pravah assumptions, not government-approved values.',
    weights: RISK_WEIGHTS,
    params: RISK_PARAMS,
    factors,
    coverage: Math.round(coverage * 100) / 100,
    caveats,
    source: SOURCES.pravah,
  };

  if (coverage < RISK_PARAMS.minWeightCoverage) {
    return {
      ...base,
      score: null,
      level: 'Insufficient data',
      confidence: null,
      explanation: ['Not enough of the inputs were available to produce a score.', ...factors.filter((f) => f.available).map((f) => f.detail)],
    };
  }

  const score = Math.round(usable.reduce((a, f) => a + f.weight * f.score, 0) / coverage);
  let conf = coverage >= 0.99 ? 2 : coverage >= 0.7 ? 1 : 0;
  if (!factors.find((f) => f.key === 'waterlogging').available || raw.waterlogging.caveat) conf = Math.max(0, conf - 1);

  return {
    ...base,
    score,
    level: levelFor(score),
    confidence: CONF[conf],
    explanation: usable.sort((a, b) => b.weight * b.score - a.weight * a.score).map((f) => f.detail),
  };
}
