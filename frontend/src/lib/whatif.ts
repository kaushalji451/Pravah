/**
 * What-If scenario maths. Same formula as the backend calculator
 * (1 mm of rain on 1 m² = 1 L), applied to the share of roof area
 * connected to rainwater harvesting before and after an intervention.
 */
export const SQFT_TO_M2 = 0.09290304;

export interface ScenarioInput {
  areaSqft: number;
  rainMm: number;
  coef: number;
  pricePerKl: number;
  currentPct: number;
  targetPct: number;
  tankerLitres: number;
  heavyRainDayMm: number;
}

export function computeScenario(i: ScenarioInput) {
  const areaM2 = i.areaSqft * SQFT_TO_M2;
  const roofRunoffL = i.rainMm * areaM2 * i.coef; // all roof water reaching gutters in a year
  const before = (roofRunoffL * i.currentPct) / 100;
  const after = (roofRunoffL * i.targetPct) / 100;
  const added = after - before;
  const heavyDayRoofL = i.heavyRainDayMm * areaM2 * i.coef;
  return {
    areaM2,
    roofRunoffL,
    before: { captured: before, toDrains: roofRunoffL - before, valueInr: (before / 1000) * i.pricePerKl },
    after: { captured: after, toDrains: roofRunoffL - after, valueInr: (after / 1000) * i.pricePerKl },
    addedL: added,
    addedValueInr: (added / 1000) * i.pricePerKl,
    addedTankers: added / i.tankerLitres,
    tankersAfter: after / i.tankerLitres,
    runoffCutPctPoints: i.targetPct - i.currentPct,
    heavyDay: {
      roofL: heavyDayRoofL,
      keptOffStreetBefore: (heavyDayRoofL * i.currentPct) / 100,
      keptOffStreetAfter: (heavyDayRoofL * i.targetPct) / 100,
      storageNeededL: (heavyDayRoofL * i.targetPct) / 100,
    },
  };
}

export type Scenario = ReturnType<typeof computeScenario>;

/** 12,40,000 → "12.4 lakh" style for big litre numbers. */
export function lakh(v: number) {
  if (v >= 1e7) return `${(v / 1e7).toFixed(2)} crore`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)} lakh`;
  return Math.round(v).toLocaleString('en-IN');
}
