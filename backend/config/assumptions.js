/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PRAVAH PROJECT ASSUMPTIONS
 *  Every number in this file is a Pravah modelling choice. None of them are
 *  government-approved weights, thresholds or prices. The UI says so, and the
 *  API returns these values alongside every result so they can be inspected.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Relative importance of each factor in the Pravah Indicative Risk Score. */
export const RISK_WEIGHTS = {
  waterlogging: 0.5, // GMDA survey records near the location
  rainfall: 0.3, // recent rainfall intensity
  elevation: 0.2, // is the point lower than its surroundings?
};

export const RISK_PARAMS = {
  waterlogging: {
    // This many waterlogging-reported survey records within the search radius
    // maps to a factor score of 100. Fewer scale linearly.
    saturationReportedCount: 5,
  },
  rainfall: {
    // IMD's daily rainfall categories: "heavy" starts at 64.5 mm,
    // "very heavy" at 115.6 mm. The category thresholds are IMD's; using them
    // to scale a 0–100 score is Pravah's choice.
    heavyDailyMm: 64.5,
    veryHeavyDailyMm: 115.6,
    // 7-day accumulation that maps to a factor score of 100.
    sevenDayCapMm: 150,
  },
  elevation: {
    // Baseline 50. Each metre the point sits BELOW the mean of its surrounding
    // ring adds this many points (each metre above subtracts them).
    // SRTM-derived elevation has several metres of vertical error, so this
    // factor is deliberately the lightest.
    pointsPerMetre: 8,
  },
  // If the factors that have data carry less than this share of the total
  // weight, no score is produced ("Insufficient data").
  minWeightCoverage: 0.5,
  levels: [
    { max: 34, label: 'Low' },
    { max: 64, label: 'Moderate' },
    { max: 100, label: 'High' },
  ],
};

export const RWH_DEFAULTS = {
  // Fraction of rain on a roof that can actually be collected.
  // Hard roofs are commonly taken as roughly 0.75–0.95 in RWH design guides.
  runoffCoefficient: 0.8,
  runoffCoefficientRange: [0.5, 0.95],
  // ₹ per kilolitre (1,000 L). A PLACEHOLDER — replace with what your society
  // actually pays (tanker water or utility tariff).
  waterPricePerKl: 50,
};

export const SQFT_TO_M2 = 0.09290304;

/** Gurugram-wide hotspot grid (city view). Pravah choices, not GMDA categories. */
export const HOTSPOT_PARAMS = {
  // Grid cell size in degrees. 0.01° ≈ 1.1 km north–south, ≈ 1 km east–west here.
  cellDeg: 0.01,
  // Waterlogging points per cell that make a cell "high" / "medium".
  highAtReported: 4,
  mediumAtReported: 2,
  topHotspots: 8,
};

/** Defaults used by the What-If simulator and impact numbers (all editable in the UI). */
export const IMPACT_DEFAULTS = {
  // Typical private water-tanker load in litres, used only to express volumes as "tanker loads".
  tankerLitres: 10000,
  // IMD "heavy rain" day threshold, used to size storage for one heavy-rain day.
  heavyRainDayMm: 64.5,
};
