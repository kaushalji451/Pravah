/**
 * DEMO MODE ONLY (DEMO_MODE=true).
 *
 * Generates SYNTHETIC survey-like records so the UI can be shown offline.
 * Every record has isDemo: true, every response has dataMode: 'demo', and the
 * UI shows "DEMO DATA — NOT OFFICIAL". Live mode never calls this file.
 * Field names are deliberately prefixed `demo_` so they can't be mistaken for
 * GMDA fields.
 */
import { SOURCES } from '../../utils/provenance.js';
import { haversineM } from '../../utils/geo.js';

const FIELDS = [
  { name: 'demo_locality', alias: 'Locality (demo)', type: 'esriFieldTypeString', domain: null },
  { name: 'demo_waterlogging', alias: 'Waterlogging observed (demo)', type: 'esriFieldTypeString', domain: null },
  { name: 'demo_rwh_status', alias: 'RWH structure (demo)', type: 'esriFieldTypeString', domain: null },
];

const ROLES = {
  locality: { field: 'demo_locality', label: 'Locality (demo)', matchedBy: 'demo mode' },
  waterlogging: { field: 'demo_waterlogging', label: 'Waterlogging observed (demo)', matchedBy: 'demo mode' },
  waterloggingDepth: { field: null, label: null, matchedBy: 'demo mode' },
  rwhStatus: { field: 'demo_rwh_status', label: 'RWH structure (demo)', matchedBy: 'demo mode' },
  rwhCondition: { field: null, label: null, matchedBy: 'demo mode' },
  surveyType: { field: null, label: null, matchedBy: 'demo mode' },
  surveySubtype: { field: null, label: null, matchedBy: 'demo mode' },
  surveyDate: { field: null, label: null, matchedBy: 'demo mode' },
};

export function getLayerSchema() {
  return { layerName: 'DEMO — synthetic layer', geometryType: 'esriGeometryPoint', maxRecordCount: null, fields: FIELDS, roles: ROLES, objectIdField: null };
}

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

export function getSurveyNear(lat, lng, radiusM) {
  const rand = rng(Math.round(lat * 1e4) * 31 + Math.round(lng * 1e4));
  const n = 4 + Math.floor(rand() * 10);
  const records = [];
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt(rand()) * radiusM;
    const t = rand() * 2 * Math.PI;
    const pLat = lat + (r * Math.cos(t)) / 111320;
    const pLng = lng + (r * Math.sin(t)) / (111320 * Math.cos((lat * Math.PI) / 180));
    const wl = rand() < 0.45 ? 'Yes' : 'No';
    const rwh = ['Functional', 'Non-functional', 'Not available'][Math.floor(rand() * 3)];
    const classification = rwh === 'Functional' ? 'functional' : rwh === 'Non-functional' ? 'non-functional' : 'absent';
    records.push({
      objectId: `demo-${i + 1}`,
      lat: pLat,
      lng: pLng,
      distanceM: Math.round(haversineM(lat, lng, pLat, pLng)),
      locality: 'Demo locality',
      surveyDate: null,
      waterlogging: { value: wl, depth: null, interpretation: wl === 'Yes' ? 'reported' : 'not-reported' },
      rwh: { status: rwh, condition: null, classification },
      attributes: [
        { field: 'demo_locality', label: 'Locality (demo)', value: 'Demo locality' },
        { field: 'demo_waterlogging', label: 'Waterlogging observed (demo)', value: wl },
        { field: 'demo_rwh_status', label: 'RWH structure (demo)', value: rwh },
      ],
      isDemo: true,
    });
  }
  records.sort((a, b) => a.distanceM - b.distanceM);
  const c = (p) => records.filter(p).length;
  return {
    dataMode: 'demo',
    source: SOURCES.demo,
    radiusM,
    truncated: false,
    roles: ROLES,
    records,
    summary: {
      surveyCount: records.length,
      waterlogging: {
        reported: c((r) => r.waterlogging.interpretation === 'reported'),
        notReported: c((r) => r.waterlogging.interpretation === 'not-reported'),
        unknown: 0,
      },
      rwh: {
        functional: c((r) => r.rwh.classification === 'functional'),
        nonFunctional: c((r) => r.rwh.classification === 'non-functional'),
        present: 0,
        absent: c((r) => r.rwh.classification === 'absent'),
        other: 0,
        notRecorded: 0,
        rawValues: [],
      },
    },
  };
}

/** Synthetic city-wide points for the hotspot view (DEMO MODE ONLY). */
export function getAllRecords() {
  const centres = [];
  for (let lat = 28.39; lat <= 28.5; lat += 0.018) for (let lng = 76.99; lng <= 77.11; lng += 0.018) centres.push([lat, lng]);
  const records = centres.flatMap(([lat, lng]) => getSurveyNear(lat, lng, 700).records);
  return { dataMode: 'demo', source: SOURCES.demo, truncated: false, roles: ROLES, records };
}
