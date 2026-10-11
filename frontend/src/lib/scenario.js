/*
  PRAVAH — Demo model & shared tokens
*/

export const EASE = [0.22, 1, 0.36, 1];

// Demo society: ~2,000 m² rooftop × ~650 mm rain × 0.8 runoff coefficient ≈ 10.4 lakh L/yr
export const ANNUAL_POTENTIAL_L = 1040000;
export const COST_PER_KL = 31.15; // ₹ per 1,000 L — illustrative blended tanker/municipal cost
export const RUNOFF_CUT_AT_FULL = 28 / 0.6; // calibrated so 60% coverage → 28% less runoff

export function scenario(coverage) {
  const captured = (ANNUAL_POTENTIAL_L * coverage) / 100;
  return {
    captured,
    runoffCut: Math.round((RUNOFF_CUT_AT_FULL * coverage) / 100),
    value: Math.round(((captured / 1000) * COST_PER_KL) / 100) * 100,
  };
}

export const fmtIN = (v) => Math.round(v).toLocaleString("en-IN");

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const NAV_LINKS = [
  { label: "How It Works", href: "#how" },
  { label: "Insights", href: "#insights" },
  { label: "Impact", href: "#impact" },
  { label: "Analyse Society", href: "/analyse-society" },
];


