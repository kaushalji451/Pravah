import { motion } from 'framer-motion';
import type { RiskResult } from '@/lib/types';
import { SourceTag } from '../SourceTag';

const LEVEL_COLOR: Record<RiskResult['level'], string> = {
  Low: '#2DD4BF',
  Moderate: '#F5B454',
  High: '#FB7185',
  'Insufficient data': '#8FA7B3',
};

export default function RiskPanel({ risk }: { risk: RiskResult }) {
  const color = LEVEL_COLOR[risk.level];
  return (
    <section aria-labelledby="risk-heading" className="flex h-full flex-col rounded-2xl border border-white/10 bg-basin p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 id="risk-heading" className="text-base font-medium text-ink/90">
          Pravah Risk Assessment
        </h2>
        <SourceTag type="calculated" />
      </div>

      <div className="mt-5 flex items-end gap-5">
        <p className="text-5xl font-semibold leading-none tracking-tight sm:text-6xl" style={{ color }}>
          {risk.level === 'Insufficient data' ? 'Insufficient data' : risk.level}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-mist">
        {risk.score !== null ? (
          <p className="tnum">
            <span className="text-2xl font-medium text-ink">{risk.score}</span> / 100
          </p>
        ) : null}
        <p>
          Confidence: <span className="text-ink">{risk.confidence ?? 'n/a'}</span>
        </p>
      </div>

      <ul className="mt-6 space-y-4">
        {risk.factors.map((f) => (
          <li key={f.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink">{f.label}</span>
              <span className="tnum text-xs text-mist">
                weight {Math.round(f.weight * 100)}%{f.available ? `, factor ${f.score}` : ''}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              {f.available ? (
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${f.score}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : (
                <div className="h-full w-full bg-[repeating-linear-gradient(90deg,rgba(143,167,179,.35)_0_4px,transparent_4px_8px)]" />
              )}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-mist">
              {f.available ? f.detail : `Insufficient data. ${f.detail}`}
            </p>
          </li>
        ))}
      </ul>

      {risk.caveats.length ? (
        <details className="mt-5 text-xs text-mist">
          <summary className="cursor-pointer text-ink/80 hover:text-ink">What lowered confidence</summary>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {risk.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <p className="mt-auto border-t border-white/5 pt-4 text-xs leading-relaxed text-mist">{risk.disclaimer}</p>
    </section>
  );
}
