/**
 * GMDA OneMap flood-survey integration.
 *
 * Design notes
 * ────────────
 * • Field names are NOT hard-coded. The layer schema is fetched live
 *   (`<layer>?f=json`) and fields are matched to roles by config/gmdaFields.js.
 *   Run `npm run inspect:gmda` to see the real fields and the chosen mapping.
 * • Coded-value domains are decoded, so the UI shows GMDA's own labels.
 * • Spatial queries use an envelope + client-side distance filter. This works
 *   on every ArcGIS Server version (distance queries are not always enabled).
 * • A layer returns at most `maxRecordCount` features per query. If the server
 *   reports `exceededTransferLimit`, the response is flagged `truncated: true`.
 * • Missing values stay null. Nothing is filled in.
 */
import { config } from '../config/index.js';
import {
  FIELD_ROLES,
  SYSTEM_FIELD_PATTERN,
  HIDDEN_FIELD_TYPES,
  WATERLOGGING_NEGATIVE,
  RWH_PATTERNS,
  SURVEY_TYPE_PATTERNS,
} from '../config/gmdaFields.js';
import { fetchJson, UpstreamError } from '../utils/http.js';
import { cache } from '../utils/cache.js';
import { bboxAround, haversineM, esriGeometryToLatLng } from '../utils/geo.js';
import { SOURCES } from '../utils/provenance.js';
import * as demo from './demo/demoGmdaService.js';

const LAYER = config.gmda.layerUrl;

async function arcgis(path, params) {
  const qs = new URLSearchParams({ f: 'json', ...params });
  const data = await fetchJson(`${LAYER}${path}?${qs}`, { service: 'GMDA', timeoutMs: config.gmda.timeoutMs });
  // ArcGIS reports errors with HTTP 200 and an `error` object.
  if (data?.error) {
    throw new UpstreamError('GMDA', `ArcGIS error ${data.error.code ?? ''}: ${data.error.message ?? 'unknown'}`.trim());
  }
  return data;
}

/* ───────────────────────── Schema discovery ───────────────────────── */

export async function getLayerSchema() {
  if (config.demoMode) return demo.getLayerSchema();
  return cache.getOrSet('gmda:schema', 6 * 3600e3, async () => {
    const meta = await arcgis('', {});
    if (!Array.isArray(meta.fields)) throw new UpstreamError('GMDA', 'layer metadata has no field list');
    const fields = meta.fields.map((f) => ({
      name: f.name,
      alias: f.alias || f.name,
      type: f.type,
      domain:
        f.domain?.type === 'codedValue'
          ? Object.fromEntries((f.domain.codedValues || []).map((c) => [String(c.code), c.name]))
          : null,
    }));
    const schema = {
      layerName: meta.name ?? null,
      description: meta.description || null,
      geometryType: meta.geometryType ?? null,
      maxRecordCount: meta.maxRecordCount ?? null,
      capabilities: meta.capabilities ?? null,
      objectIdField: meta.objectIdField || fields.find((f) => f.type === 'esriFieldTypeOID')?.name || null,
      fields,
    };
    schema.roles = resolveFieldRoles(schema);
    return schema;
  });
}

const norm = (s) => String(s || '').toLowerCase().replace(/[_\-]+/g, ' ');

export function resolveFieldRoles(schema) {
  const visible = schema.fields.filter((f) => !HIDDEN_FIELD_TYPES.has(f.type));
  const nonSystem = visible.filter((f) => !SYSTEM_FIELD_PATTERN.test(f.name));

  const pick = (role) => {
    const override = process.env[`GMDA_FIELD_${role.toUpperCase()}`];
    if (override) {
      const f = schema.fields.find((x) => x.name === override);
      return f
        ? { field: f.name, label: f.alias, matchedBy: 'env override' }
        : { field: null, label: null, matchedBy: `env override "${override}" not found in layer` };
    }
    const def = FIELD_ROLES[role];
    const pool = def.includeSystem ? visible : nonSystem;
    let best = null;
    let bestIdx = Infinity;
    for (const f of pool) {
      if (def.types && !def.types.includes(f.type)) continue;
      const text = `${norm(f.name)} ${norm(f.alias)}`;
      const words = text.split(/\s+/);
      if (def.require && !def.require.some((k) => text.includes(k))) continue;
      if (def.exclude && def.exclude.some((e) => words.some((w) => w.startsWith(e)))) continue;
      const idx = def.keywords.findIndex((k) => text.includes(k));
      if (idx >= 0 && idx < bestIdx) {
        best = f;
        bestIdx = idx;
      }
    }
    return best
      ? { field: best.name, label: best.alias, matchedBy: `keyword "${def.keywords[bestIdx]}"` }
      : { field: null, label: null, matchedBy: 'no matching field in layer' };
  };

  const roles = Object.fromEntries(Object.keys(FIELD_ROLES).map((r) => [r, pick(r)]));
  if (roles.rwhCondition.field && roles.rwhCondition.field === roles.rwhStatus.field) {
    roles.rwhCondition = { field: null, label: null, matchedBy: 'same field as rwhStatus' };
  }
  if (roles.waterloggingDepth.field && roles.waterloggingDepth.field === roles.waterlogging.field) {
    roles.waterloggingDepth = { field: null, label: null, matchedBy: 'same field as waterlogging' };
  }
  return roles;
}

/* ───────────────────────── Normalisation ───────────────────────── */

function decodeValue(field, v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  if (field?.domain && field.domain[String(v)] !== undefined) return field.domain[String(v)];
  if (field?.type === 'esriFieldTypeDate' && typeof v === 'number') return new Date(v).toISOString();
  return typeof v === 'string' ? v.trim() : v;
}

export function interpretWaterlogging(value, depth) {
  if (value === null && (depth === null || depth === undefined)) return 'unknown';
  if (value === null) {
    const d = Number(depth);
    return Number.isFinite(d) ? (d > 0 ? 'reported' : 'not-reported') : 'unknown';
  }
  if (typeof value === 'number') return value > 0 ? 'reported' : 'not-reported';
  return WATERLOGGING_NEGATIVE.test(String(value).trim()) ? 'not-reported' : 'reported';
}

export function classifyRwh(status, condition) {
  const s = status === null || status === undefined ? '' : String(status).trim();
  const c = condition === null || condition === undefined ? '' : String(condition).trim();
  if (!s && !c) return 'not-recorded';
  const both = `${c} ${s}`;
  if (RWH_PATTERNS.nonFunctional.test(both)) return 'non-functional';
  if (RWH_PATTERNS.functional.test(both)) return 'functional';
  if (s && RWH_PATTERNS.absent.test(s)) return 'absent';
  if (s && RWH_PATTERNS.present.test(s)) return 'present';
  return 'other';
}

export function normalizeFeature(feature, schema) {
  const attrs = feature.attributes || {};
  const byName = new Map(schema.fields.map((f) => [f.name, f]));
  const val = (name) => (name ? decodeValue(byName.get(name), attrs[name]) : null);
  const { roles } = schema;
  const pos = esriGeometryToLatLng(feature.geometry);

  const wl = val(roles.waterlogging.field);
  const depth = val(roles.waterloggingDepth.field);
  const surveyType = val(roles.surveyType?.field);
  const surveySubtype = val(roles.surveySubtype?.field);
  const isWlSurvey = typeof surveyType === 'string' && SURVEY_TYPE_PATTERNS.waterlogging.test(surveyType);
  const isRwhSurvey = typeof surveyType === 'string' && SURVEY_TYPE_PATTERNS.rwh.test(surveyType);

  // Prefer dedicated RWH fields; fall back to SurveyType/SurveySubtype for RWH survey points.
  const rwhStatus = val(roles.rwhStatus.field) ?? (isRwhSurvey ? surveyType : null);
  const rwhCondition = val(roles.rwhCondition.field) ?? (isRwhSurvey ? surveySubtype : null);

  let wlInterpretation =
    roles.waterlogging.field || roles.waterloggingDepth.field ? interpretWaterlogging(wl, depth) : 'unknown';
  if (wlInterpretation === 'unknown' && isWlSurvey) wlInterpretation = 'reported';

  let rwhClass = classifyRwh(rwhStatus, rwhCondition);
  if (isRwhSurvey && (rwhClass === 'other' || rwhClass === 'not-recorded')) rwhClass = 'present';

  return {
    objectId: schema.objectIdField ? attrs[schema.objectIdField] ?? null : null,
    lat: pos?.lat ?? null,
    lng: pos?.lng ?? null,
    locality: val(roles.locality.field),
    surveyDate: val(roles.surveyDate.field),
    surveyType,
    waterlogging: {
      value: wl ?? (isWlSurvey ? surveyType : null),
      depth,
      interpretation: wlInterpretation,
    },
    rwh: {
      status: rwhStatus,
      condition: rwhCondition,
      classification: rwhClass,
    },
    // Every non-empty, non-system attribute, labelled with GMDA's own alias.
    attributes: schema.fields
      .filter((f) => !HIDDEN_FIELD_TYPES.has(f.type) && !SYSTEM_FIELD_PATTERN.test(f.name))
      .map((f) => ({ field: f.name, label: f.alias, value: decodeValue(f, attrs[f.name]) }))
      .filter((a) => a.value !== null),
    isDemo: false,
  };
}

export function summarize(records, roles) {
  const hasWl = Boolean(roles.waterlogging.field || roles.waterloggingDepth.field || roles.surveyType?.field);
  const hasRwh = Boolean(roles.rwhStatus.field || roles.rwhCondition.field || roles.surveyType?.field);
  const count = (pred) => records.filter(pred).length;

  const rawRwh = new Map();
  for (const r of records) {
    const raw = [r.rwh.status, r.rwh.condition].filter((v) => v !== null).join(' / ');
    if (raw) rawRwh.set(raw, (rawRwh.get(raw) || 0) + 1);
  }

  return {
    surveyCount: records.length,
    waterlogging: hasWl
      ? {
          reported: count((r) => r.waterlogging.interpretation === 'reported'),
          notReported: count((r) => r.waterlogging.interpretation === 'not-reported'),
          unknown: count((r) => r.waterlogging.interpretation === 'unknown'),
        }
      : null,
    rwh: hasRwh
      ? {
          functional: count((r) => r.rwh.classification === 'functional'),
          nonFunctional: count((r) => r.rwh.classification === 'non-functional'),
          present: count((r) => r.rwh.classification === 'present'),
          absent: count((r) => r.rwh.classification === 'absent'),
          other: count((r) => r.rwh.classification === 'other'),
          notRecorded: count((r) => r.rwh.classification === 'not-recorded'),
          rawValues: [...rawRwh.entries()].map(([value, n]) => ({ value, count: n })).sort((a, b) => b.count - a.count),
        }
      : null,
  };
}

/* ───────────────────────── Queries ───────────────────────── */

export async function getSurveyNear(lat, lng, radiusM = config.gmda.searchRadiusM) {
  if (config.demoMode) return demo.getSurveyNear(lat, lng, radiusM);

  const schema = await getLayerSchema();
  const [xmin, ymin, xmax, ymax] = bboxAround(lat, lng, radiusM);
  const key = `gmda:near:${lat.toFixed(5)},${lng.toFixed(5)},${radiusM}`;
  const data = await cache.getOrSet(key, 30 * 60e3, () =>
    arcgis('/query', {
      where: '1=1',
      geometry: `${xmin},${ymin},${xmax},${ymax}`,
      geometryType: 'esriGeometryEnvelope',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: '*',
      returnGeometry: 'true',
      outSR: '4326',
    }),
  );

  const records = (data.features || [])
    .map((f) => normalizeFeature(f, schema))
    .filter((r) => r.lat !== null && r.lng !== null)
    .map((r) => ({ ...r, distanceM: Math.round(haversineM(lat, lng, r.lat, r.lng)) }))
    .filter((r) => r.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM);

  return {
    dataMode: 'live',
    source: SOURCES.gmda,
    radiusM,
    truncated: Boolean(data.exceededTransferLimit),
    roles: schema.roles,
    records,
    summary: summarize(records, schema.roles),
  };
}

/**
 * Searches the GMDA survey's own locality field (if the layer has one).
 * The coordinate returned is the centre of the matching survey points — it is
 * labelled that way, not as an official locality centre.
 */
export async function searchLocalities(q) {
  if (config.demoMode) return [];
  const schema = await getLayerSchema();
  const field = schema.roles.locality.field;
  if (!field) return [];

  const safe = q.replace(/[^\p{L}\p{N}\s.\-]/gu, '').trim().toUpperCase().slice(0, 60);
  if (safe.length < 2) return [];

  const data = await cache.getOrSet(`gmda:search:${safe}`, 60 * 60e3, () =>
    arcgis('/query', {
      where: `UPPER(${field}) LIKE '%${safe}%'`,
      outFields: field,
      returnGeometry: 'true',
      outSR: '4326',
    }),
  );

  const groups = new Map();
  for (const f of data.features || []) {
    const name = String(f.attributes?.[field] ?? '').trim();
    const pos = esriGeometryToLatLng(f.geometry);
    if (!name || !pos) continue;
    const k = name.toLowerCase();
    const g = groups.get(k) || { name, sumLat: 0, sumLng: 0, n: 0 };
    g.sumLat += pos.lat;
    g.sumLng += pos.lng;
    g.n += 1;
    groups.set(k, g);
  }
  return [...groups.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, 6)
    .map((g) => ({ name: g.name, lat: g.sumLat / g.n, lng: g.sumLng / g.n, recordCount: g.n }));
}

/**
 * Every point in the GMDA layer, for the Gurugram-wide hotspot view.
 * Pages through the layer (maxRecordCount per request) and caches for 6 h.
 */
export async function getAllRecords({ maxPages = 15 } = {}) {
  if (config.demoMode) return demo.getAllRecords();
  const schema = await getLayerSchema();
  return cache.getOrSet('gmda:all', 6 * 3600e3, async () => {
    const page = schema.maxRecordCount || 1000;
    const features = [];
    let truncated = false;
    for (let i = 0; i < maxPages; i++) {
      const data = await arcgis('/query', {
        where: '1=1',
        outFields: '*',
        returnGeometry: 'true',
        outSR: '4326',
        resultOffset: String(i * page),
        resultRecordCount: String(page),
        ...(schema.objectIdField ? { orderByFields: schema.objectIdField } : {}),
      });
      const batch = data.features || [];
      features.push(...batch);
      if (!data.exceededTransferLimit || batch.length === 0) break;
      if (i === maxPages - 1) truncated = true;
    }
    const records = features.map((f) => normalizeFeature(f, schema)).filter((r) => r.lat !== null && r.lng !== null);
    return { dataMode: 'live', source: SOURCES.gmda, truncated, roles: schema.roles, records };
  });
}

/** Small sample for the inspect script. */
export async function sampleFeatures(n = 5) {
  return arcgis('/query', { where: '1=1', outFields: '*', returnGeometry: 'true', outSR: '4326', resultRecordCount: String(n) });
}
