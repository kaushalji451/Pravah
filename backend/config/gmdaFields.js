/**
 * How Pravah finds the right GMDA fields WITHOUT hard-coding field names.
 *
 * At startup the backend fetches the layer's own schema (`<layer>?f=json`) and
 * matches each field's name + alias against the keywords below. The result is
 * exposed at GET /api/gmda/schema and printed by `npm run inspect:gmda`, so you
 * can see exactly which real field was used for each role.
 *
 * If a match is wrong, pin it with an env var, e.g.
 *   GMDA_FIELD_WATERLOGGING=<exact field name from inspect:gmda>
 *
 * If no field matches a role, that role is null and the UI says
 * "not provided by GMDA" — nothing is invented.
 */

const TEXT = ['esriFieldTypeString'];
const NUMERIC = [
  'esriFieldTypeDouble',
  'esriFieldTypeSingle',
  'esriFieldTypeInteger',
  'esriFieldTypeSmallInteger',
  'esriFieldTypeBigInteger',
];

/** Earlier keywords win. Text is lowercased with _ and - turned into spaces. */
export const FIELD_ROLES = {
  locality: {
    keywords: ['locality', 'sector', 'colony', 'society', 'location', 'area', 'address', 'site', 'place', 'ward', 'name'],
    types: TEXT,
    exclude: ['rwh', 'rain', 'harvest', 'recharge', 'flood', 'waterlog', 'remark', 'surveyor', 'creator', 'editor', 'user', 'photo', 'image'],
  },
  waterlogging: {
    keywords: ['waterlog', 'water log', 'inundat', 'flood', 'logging'],
    types: [...TEXT, ...NUMERIC],
    exclude: ['depth', 'rwh', 'harvest', 'recharge', 'date', 'id', 'photo', 'image', 'attach', 'remark'],
  },
  waterloggingDepth: {
    keywords: ['depth', 'water level', 'height'],
    require: ['water', 'flood', 'depth', 'log'],
    types: [...TEXT, ...NUMERIC],
    exclude: ['rwh', 'harvest', 'recharge', 'photo', 'image'],
  },
  rwhStatus: {
    keywords: ['rwh', 'rainwater', 'rain water', 'harvest', 'recharge'],
    types: [...TEXT, ...NUMERIC],
    exclude: ['photo', 'image', 'date', 'id', 'depth', 'attach', 'remark', 'condition'],
  },
  rwhCondition: {
    keywords: ['condition', 'functional', 'working', 'operational', 'status'],
    require: ['rwh', 'rain', 'harvest', 'recharge'],
    types: [...TEXT, ...NUMERIC],
    exclude: ['photo', 'image', 'attach', 'date'],
  },
  // GMDA's flood_survey_2 layer stores one point per surveyed asset, with the
  // asset kind in a "SurveyType" field (Waterlogging / Gully Trap / Rainwater
  // Harvesting / Pumping Station) and its condition in "SurveySubtype"
  // (Functional / Non-Functional / Low Capacity / Damaged ...).
  surveyType: {
    keywords: ['surveytype', 'survey type', 'feature type', 'asset type', 'category'],
    types: TEXT,
    exclude: ['date', 'id', 'remark'],
  },
  surveySubtype: {
    keywords: ['surveysubtype', 'survey subtype', 'subtype', 'sub type'],
    types: TEXT,
    exclude: ['date', 'id', 'remark'],
  },
  surveyDate: {
    keywords: ['survey', 'inspect', 'date', 'created', 'time'],
    types: ['esriFieldTypeDate', 'esriFieldTypeDateOnly', 'esriFieldTypeTimestampOffset'],
    includeSystem: true,
  },
};

/** ArcGIS bookkeeping fields that are never shown as survey content. */
export const SYSTEM_FIELD_PATTERN =
  /^(objectid|fid|oid|globalid|shape.*|st_area.*|st_length.*|created_user|created_date|last_edited_user|last_edited_date|creationdate|creator|editdate|editor)$/i;

export const HIDDEN_FIELD_TYPES = new Set([
  'esriFieldTypeGeometry',
  'esriFieldTypeBlob',
  'esriFieldTypeRaster',
  'esriFieldTypeXML',
  'esriFieldTypeOID',
  'esriFieldTypeGlobalID',
]);

/**
 * Interpreting a waterlogging value. ASSUMPTION (documented in the UI):
 *  - empty → unknown
 *  - a value matching NEGATIVE → not reported
 *  - a number → reported if > 0
 *  - any other non-empty value (yes / severity / description) → reported
 * The raw GMDA value is always returned next to the interpretation.
 */
export const WATERLOGGING_NEGATIVE =
  /^(no|n|false|0|none|nil|na|n\/a|not applicable|not waterlogged|no waterlogging|no water logging|dry)$/i;

/**
 * When the layer has a SurveyType field, these decide what kind of asset a
 * point is. A point whose SurveyType is "Waterlogging" is a GMDA-surveyed
 * waterlogging point (the layer marks many as "Major Hotspots"), so it counts
 * as waterlogging reported even if the WaterloggingType detail is empty.
 */
export const SURVEY_TYPE_PATTERNS = {
  waterlogging: /waterlog|water\s*log|flood|inundat/i,
  rwh: /rain\s*water|rwh|harvest|recharge/i,
};

export const RWH_PATTERNS = {
  nonFunctional: /non[\s-]?functional|not\s*(working|functional|operational)|defunct|choked|damaged|broken|blocked|dysfunctional|low\s*capacity/i,
  functional: /functional|working|operational|\bgood\b/i,
  absent: /^(no|n|nil|none|not available|absent|false|0|not present|na|n\/a)$/i,
  present: /^(yes|y|present|available|true|1|exists?)$/i,
};
