import { motion } from 'framer-motion';
import { ArrowDown, CircleAlert, CircleCheck, Search, Wrench } from 'lucide-react';
import type { Recommendation } from '@/lib/types';
import { SourceTag } from '../SourceTag';

const TONE: Record<Recommendation['tone'], { color: string; ring: string; bg: string; label: string; Icon: typeof CircleAlert }> = {
  red: { color: '#FB7185', ring: 'border-[#FB7185]/40', bg: 'from-[#FB7185]/[0.10]', label: 'Act before the monsoon', Icon: CircleAlert },
  amber: { color: '#F5B454', ring: 'border-[#F5B454]/40', bg: 'from-[#F5B454]/[0.09]', label: 'Worth doing', Icon: Wrench },
  green: { color: '#2DD4BF', ring: 'border-[#2DD4BF]/40', bg: 'from-[#2DD4BF]/[0.09]', label: 'On track', Icon: CircleCheck },
  neutral: { color: '#8FA7B3', ring: 'border-white/15', bg: 'from-white/[0.04]', label: 'Check first', Icon: Search },
};

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  const t = TONE[rec.tone] ?? TONE.neutral;
  const { Icon } = t;

  const goToWhatIf = () => document.getElementById('what-if')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <motion.section
      aria-labelledby="rec-heading"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border ${t.ring} bg-gradient-to-br ${t.bg} to-transparent bg-[#0A1522]`}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1" style={{ background: t.color }} />
      <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="rec-heading" className="text-sm text-[#8FA7B3]">
              Recommended action
            </h2>
            <SourceTag type="calculated" />
          </div>

          <div className="mt-3 flex items-start gap-3">
            <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${t.color}1f`, color: t.color }}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl" style={{ color: t.color }}>
                {rec.action}
              </p>
              <p className="mt-1 text-xs font-medium" style={{ color: t.color }}>
                {t.label}
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#C9D8E1]">{rec.summary}</p>

          <ul className="mt-4 space-y-1 text-xs text-[#8FA7B3]">
            {rec.why.map((w) => (
              <li key={w} className="flex gap-2">
                <span aria-hidden="true">·</span>
                {w}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#050B14]/60 p-5">
          <p className="text-sm font-medium text-[#E8F3F6]">Next steps</p>
          <ol className="mt-3 space-y-3">
            {rec.steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-sm leading-snug text-[#C9D8E1]">
                <span className="tnum grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/15 text-[11px] text-[#8FA7B3]">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={goToWhatIf}
            className="mt-5 inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-[#050B14] transition-opacity hover:opacity-90"
            style={{ background: t.color }}
          >
            Model this in What-If
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <details className="border-t border-white/[0.06] px-6 py-3 text-xs text-[#8FA7B3] sm:px-7">
        <summary className="cursor-pointer text-[#C9D8E1] hover:text-[#E8F3F6]">How Pravah picked this</summary>
        <p className="mt-2">
          Rule applied: <span className="text-[#E8F3F6]">{rec.ruleText}</span>
        </p>
        <ul className="mt-2 space-y-1">
          {Object.entries(rec.rules).map(([k, v]) => (
            <li key={k} className={k === rec.rule ? 'text-[#E8F3F6]' : ''}>
              {k === rec.rule ? '→ ' : '  '}
              {v}
            </li>
          ))}
        </ul>
        <p className="mt-3">{rec.disclaimer}</p>
      </details>
    </motion.section>
  );
}
