// Mirrors the Express API response shapes (backend/services/*.js).

export type ProvenanceType = 'official' | 'public' | 'calculated' | 'assumption' | 'user' | 'demo';

export interface SourceRef {
  id: string;
  name: string;
  type: ProvenanceType;
  publisher?: string;
  provides?: string;
  url?: string;
  caveat?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  detail?: string;
  lat: number;
  lng: number;
  source: SourceRef;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  warnings: string[];
}

export interface FieldRole {
  field: string | null;
  label: string | null;
  matchedBy: string;
}

export interface GmdaRecord {
  objectId: string | number | null;
  lat: number;
  lng: number;
  distanceM: number;
  locality: string | null;
  surveyDate: string | null;
  waterlogging: { value: string | number | null; depth: string | number | null; interpretation: 'reported' | 'not-reported' | 'unknown' };
  rwh: {
    status: string | number | null;
    condition: string | number | null;
    classification: 'functional' | 'non-functional' | 'present' | 'absent' | 'other' | 'not-recorded';
  };
  attributes: { field: string; label: string; value: string | number | boolean }[];
  isDemo: boolean;
}

export interface RiskFactor {
  key: 'waterlogging' | 'rainfall' | 'elevation';
  label: string;
  weight: number;
  score: number | null;
  available: boolean;
  detail: string;
}

export interface RiskResult {
  model: string;
  disclaimer: string;
  score: number | null;
  level: 'Low' | 'Moderate' | 'High' | 'Insufficient data';
  confidence: 'Low' | 'Medium' | 'High' | null;
  coverage: number;
  explanation: string[];
  caveats: string[];
  factors: RiskFactor[];
  weights: Record<string, number>;
  source: SourceRef;
}

export interface Unavailable {
  available: boolean;
  error?: string;
}

export interface LocationDetails {
  id: string;
  dataMode: 'live' | 'demo';
  generatedAt: string;
  location: { name: string; lat: number; lng: number; source: SourceRef };
  waterlogging: Unavailable & {
    surveyCount: number | null;
    reportedCount: number | null;
    notReportedCount: number | null;
    unknownCount: number | null;
    status: string | null;
    field: string | null;
    fieldLabel: string | null;
    radiusM: number;
    truncated: boolean;
    source: SourceRef;
  };
  rainwaterHarvesting: Unavailable & {
    status: 'functional' | 'non-functional' | 'mixed' | 'present' | 'absent' | 'not-recorded' | null;
    statusLabel: string | null;
    counts: {
      functional: number;
      nonFunctional: number;
      present: number;
      absent: number;
      other: number;
      notRecorded: number;
      rawValues: { value: string; count: number }[];
    } | null;
    fields: { field: string; label: string }[];
    source: SourceRef;
  };
  elevation: Unavailable & {
    meters: number | null;
    surroundingMeanM: number | null;
    relativeM: number | null;
    ringRadiusM: number;
    source: SourceRef;
  };
  rainfall: Unavailable & {
    dailyMm: number | null;
    dailyDate: string | null;
    sevenDayTotalMm: number | null;
    sevenDayMaxDailyMm: number | null;
    thirtyDayTotalMm: number | null;
    series: { date: string; mm: number | null }[];
    source: SourceRef;
    annual: Unavailable & { meanAnnualMm: number | null; period: string | null; years: { year: number; totalMm: number }[]; source: SourceRef };
  };
  risk: RiskResult;
  recommendation?: Recommendation;
  assumptions?: { impact: ImpactDefaults; rwh: { runoffCoefficient: number; runoffCoefficientRange: [number, number]; waterPricePerKl: number } };
  gmda: { available: boolean; error?: string; roles: Record<string, FieldRole> | null; records: GmdaRecord[] };
  sources: SourceRef[];
}

export interface RwhInput {
  value: number | null;
  unit?: string;
  provenance: ProvenanceType | null;
  label: string | null;
}

export interface RwhResponse {
  inputs: { areaSqft: RwhInput; annualRainfallMm: RwhInput; runoffCoefficient: RwhInput; waterPricePerKl: RwhInput };
  defaults: { runoffCoefficient: number; runoffCoefficientRange: [number, number]; waterPricePerKl: number };
  result: null | {
    areaM2: number;
    litresPerYear: number;
    kilolitresPerYear: number;
    valueInrPerYear: number;
    label: string;
    valueLabel: string;
  };
  steps?: string[];
  message?: string;
  source: SourceRef;
}

export interface SourcesResponse {
  dataMode: 'live' | 'demo';
  sources: SourceRef[];
}

export interface ImpactDefaults {
  tankerLitres: number;
  heavyRainDayMm: number;
}

export interface Recommendation {
  rule: string;
  tone: 'red' | 'amber' | 'green' | 'neutral';
  action: string;
  summary: string;
  steps: string[];
  why: string[];
  basis: { riskLevel: string; riskScore: number | null; rwhStatus: string; rwhLabel: string };
  ruleText: string;
  rules: Record<string, string>;
  disclaimer: string;
  source: SourceRef;
}

export interface OverviewCell {
  key: string;
  id: string;
  name: string;
  lat: number;
  lng: number;
  points: number;
  reported: number;
  rwh: { functional: number; needsWork: number; present: number; absent: number };
  level: 'high' | 'medium' | 'low' | 'none';
}

export interface CityOverview {
  dataMode: 'live' | 'demo';
  generatedAt: string;
  truncated: boolean;
  method: string;
  caveat: string;
  totals: { points: number; reported: number; rwhFunctional: number; rwhNeedsWork: number; cellsHigh: number };
  cells: OverviewCell[];
  hotspots: OverviewCell[];
  sources: SourceRef[];
}

/** Inputs the water-saving calculator shares with the What-If simulator. */
export interface CalcInputs {
  areaSqft: number | null;
  rainMm: number | null;
  coef: number;
  pricePerKl: number | null;
}
