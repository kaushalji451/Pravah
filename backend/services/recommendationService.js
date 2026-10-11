/**
 * Recommended action — rule-based, transparent, and honest about unknowns.
 *
 * Inputs: Pravah risk level + the RWH status recorded in GMDA survey points
 * near the location. Every rule is listed in RULES below and the rule that
 * fired is returned, so the UI can show *why* this action was suggested.
 * Recommendations are Pravah guidance, not an engineering assessment.
 */
import { SOURCES } from '../utils/provenance.js';

const RULES = {
  installUrgent: 'No RWH structure recorded nearby + Moderate/High risk → Install',
  install: 'No RWH structure recorded nearby + Low risk → Install (water-saving opportunity)',
  repair: 'Non-functional or mixed RWH recorded nearby → Repair / upgrade',
  maintainPlus: 'Functional RWH + High risk → Maintain and add recharge capacity',
  maintain: 'Functional RWH + Low/Moderate risk → Maintain existing system',
  inspect: 'RWH present but condition not recorded → Inspect and service',
  audit: 'RWH status not recorded in GMDA → Audit your own system first',
  noData: 'Risk could not be scored → Collect data first',
};

export function computeRecommendation({ risk, rwh, annualMm }) {
  const level = risk?.level ?? 'Insufficient data';
  const status = rwh?.available ? rwh.status : 'not-recorded';
  const elevated = level === 'High' || level === 'Moderate';
  const rainNote = annualMm ? `About ${Math.round(annualMm)} mm of rain falls here in an average year (Open-Meteo, 10-year mean).` : null;

  let r;
  if (level === 'Insufficient data') {
    r = {
      rule: 'noData',
      tone: 'neutral',
      action: 'Collect local data before deciding',
      summary: 'Pravah could not score this location with the data available. Start with a quick walk-through after the next heavy rain.',
      steps: ['Note where water stands after heavy rain and for how long', 'Check whether your society has any RWH structure and if it works', 'Re-run Pravah once rainfall or survey data is available'],
    };
  } else if (status === 'absent') {
    r = elevated
      ? {
          rule: 'installUrgent',
          tone: 'red',
          action: 'Install a rainwater-harvesting system',
          summary: `Survey points nearby record no RWH structure, and the indicative risk is ${level.toLowerCase()}. Capturing roof water reduces what flows onto the street.`,
          steps: ['Get a recharge-pit / storage design sized for one heavy-rain day (use the What-If tool below)', 'Add first-flush diverters and silt traps', 'Apply for Haryana RWH approvals / subsidies where applicable'],
        }
      : {
          rule: 'install',
          tone: 'amber',
          action: 'Install rainwater harvesting to cut water costs',
          summary: 'No RWH structure is recorded nearby. Risk is low, so the main gain is water saved rather than flood relief.',
          steps: ['Estimate your roof area and see the yearly potential below', 'Start with the largest roof block', 'Compare installation cost with the yearly water value'],
        };
  } else if (status === 'non-functional' || status === 'mixed') {
    r = {
      rule: 'repair',
      tone: elevated ? 'red' : 'amber',
      action: 'Repair or upgrade the existing RWH system',
      summary: `GMDA survey points nearby record RWH structures that are not working properly${elevated ? `, in an area with ${level.toLowerCase()} indicative risk` : ''}. Fixing them is usually cheaper than building new.`,
      steps: ['Desilt recharge pits and clean filters before June', 'Check pipes from roof to pit for blockages and breaks', 'If capacity is low, add a pit or tank sized with the What-If tool below'],
    };
  } else if (status === 'functional') {
    r =
      level === 'High'
        ? {
            rule: 'maintainPlus',
            tone: 'amber',
            action: 'Maintain RWH and add recharge capacity',
            summary: 'RWH nearby is recorded as functional, but the indicative risk is still high. More roof area connected or more recharge capacity may help.',
            steps: ['Service the existing system before the monsoon', 'Connect any roof blocks not yet draining into RWH', 'Add recharge capacity for heavy-rain days'],
          }
        : {
            rule: 'maintain',
            tone: 'green',
            action: 'Maintain the existing RWH system',
            summary: 'RWH nearby is recorded as functional and indicative risk is not high. Keep it working.',
            steps: ['Clean filters and desilt pits once a year before June', 'Inspect after the first heavy rain', 'Track how much water you capture'],
          };
  } else if (status === 'present') {
    r = {
      rule: 'inspect',
      tone: elevated ? 'amber' : 'green',
      action: 'Inspect and service your RWH system',
      summary: 'An RWH structure is recorded nearby, but its condition is not. A pre-monsoon check confirms it actually works.',
      steps: ['Check pits, filters and pipes for silt and blockages', 'Pour a bucket test into the inlet and watch it drain', 'Upgrade if it overflows in heavy rain'],
    };
  } else {
    r = {
      rule: 'audit',
      tone: elevated ? 'amber' : 'neutral',
      action: 'Audit your society’s RWH system',
      summary: `GMDA survey points near here do not record rainwater-harvesting status${elevated ? `, and the indicative risk is ${level.toLowerCase()}` : ''}. Find out what you have before spending money.`,
      steps: ['Ask your RWA or maintenance team if RWH exists and when it was last cleaned', 'If none: plan an install sized with the What-If tool below', 'If it exists but overflows or is silted: repair it'],
    };
  }

  return {
    ...r,
    basis: { riskLevel: level, riskScore: risk?.score ?? null, rwhStatus: status, rwhLabel: rwh?.statusLabel ?? 'Not recorded' },
    why: [
      `Indicative risk: ${level}${risk?.score !== null && risk?.score !== undefined ? ` (${risk.score}/100)` : ''}.`,
      `RWH recorded in nearby GMDA survey points: ${rwh?.available ? rwh.statusLabel ?? 'Not recorded' : 'not available'}.`,
      rainNote,
    ].filter(Boolean),
    ruleText: RULES[r.rule],
    rules: RULES,
    disclaimer: 'Pravah guidance from public data and simple rules, not an engineering assessment. Confirm on site before spending.',
    source: SOURCES.pravah,
  };
}
