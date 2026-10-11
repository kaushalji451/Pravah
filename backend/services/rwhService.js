/**
 * Rainwater-harvesting potential.
 *
 *   Harvestable water (L/yr) = annual rainfall (mm) × roof area (m²) × runoff coefficient
 *
 * Unit note: 1 mm of rain on 1 m² is 1 litre (0.001 m × 1 m² = 0.001 m³ = 1 L).
 * Roof area is never taken from a dataset Pravah doesn't have; the user enters it.
 */
import { RWH_DEFAULTS, SQFT_TO_M2 } from '../config/assumptions.js';
import { BadRequestError } from '../utils/http.js';
import { SOURCES } from '../utils/provenance.js';

const positive = (v, name) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new BadRequestError(`${name} must be a positive number.`);
  return n;
};

/**
 * @param {object} p
 * @param {number|undefined} p.areaSqft            user-provided
 * @param {{value:number, provenance:object}} p.annualRainfall
 * @param {number|undefined} p.runoffCoefficient   override (else default assumption)
 * @param {number|undefined} p.pricePerKl          override (else default assumption)
 */
export function computeRwh({ areaSqft, annualRainfall, runoffCoefficient, pricePerKl }) {
  const [cMin, cMax] = RWH_DEFAULTS.runoffCoefficientRange;
  const coefficient = runoffCoefficient === undefined ? RWH_DEFAULTS.runoffCoefficient : positive(runoffCoefficient, 'Runoff coefficient');
  if (coefficient < cMin || coefficient > cMax) throw new BadRequestError(`Runoff coefficient must be between ${cMin} and ${cMax}.`);
  const price = pricePerKl === undefined ? RWH_DEFAULTS.waterPricePerKl : positive(pricePerKl, 'Water value');

  const inputs = {
    areaSqft: { value: areaSqft ?? null, unit: 'sq ft', provenance: 'user', label: 'User-provided estimate' },
    annualRainfallMm: { value: annualRainfall?.value ?? null, unit: 'mm/yr', provenance: annualRainfall?.provenance ?? null, label: annualRainfall?.label ?? null },
    runoffCoefficient: {
      value: coefficient,
      provenance: runoffCoefficient === undefined ? 'assumption' : 'user',
      label: runoffCoefficient === undefined ? 'Pravah default assumption' : 'User-provided',
    },
    waterPricePerKl: {
      value: price,
      unit: '₹/kL',
      provenance: pricePerKl === undefined ? 'assumption' : 'user',
      label: pricePerKl === undefined ? 'Placeholder assumption — replace with your actual cost' : 'User-provided',
    },
  };

  const base = { inputs, defaults: RWH_DEFAULTS, source: SOURCES.pravah };

  if (areaSqft === undefined) {
    return { ...base, result: null, message: 'Enter an estimated rooftop area to calculate capture potential.' };
  }
  const area = positive(areaSqft, 'Rooftop area');
  if (area > 5_000_000) throw new BadRequestError('Rooftop area looks too large (max 5,000,000 sq ft).');
  if (!annualRainfall?.value) {
    return { ...base, result: null, message: 'Annual rainfall is unavailable. Enter it manually to calculate.' };
  }

  const areaM2 = area * SQFT_TO_M2;
  const litres = annualRainfall.value * areaM2 * coefficient;
  const kl = litres / 1000;
  const value = kl * price;

  return {
    ...base,
    result: {
      areaM2: Math.round(areaM2),
      litresPerYear: Math.round(litres),
      kilolitresPerYear: Math.round(kl * 10) / 10,
      valueInrPerYear: Math.round(value),
      label: 'Estimated annual capture potential',
      valueLabel: 'Estimated potential value',
    },
    steps: [
      `${area.toLocaleString('en-IN')} sq ft × 0.0929 = ${Math.round(areaM2).toLocaleString('en-IN')} m²`,
      `${annualRainfall.value} mm × ${Math.round(areaM2).toLocaleString('en-IN')} m² × ${coefficient} = ${Math.round(litres).toLocaleString('en-IN')} L (1 mm on 1 m² = 1 L)`,
      `${(Math.round(kl * 10) / 10).toLocaleString('en-IN')} kL × ₹${price}/kL = ₹${Math.round(value).toLocaleString('en-IN')}`,
    ],
  };
}
