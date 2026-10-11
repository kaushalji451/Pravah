import { motion } from 'framer-motion';
import { ArrowRight, Droplets } from 'lucide-react';
import type { CalcInputs, ImpactDefaults } from '@/lib/types';
import { fmt, fmtInr } from '@/lib/format';
import { lakh, type Scenario } from '@/lib/whatif';
import { SourceTag } from '../SourceTag';

type Props = {
  inputs: CalcInputs;
  impact: ImpactDefaults;
  currentPct: number;
  targetPct: number;
  onCurrent: (v: number) => void;
  onTarget: (v: number) => void;
  scenario: Scenario | null;
  onUseExample: () => void;
};

const PRESETS = [25, 50, 75, 100];

function Slider({ id, value, onChange, label }: { id: string; value: number; onChange: (v: number) => void; label: string }) {
  return (
    <input
      id={id}
      type="range"
      min={0}
      max={100}
      step={5}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="pravah-range"
      style={{ ['--val' as string]: `${value}%` }}
      aria-label={label}
    />
  );
}

/** One stacked bar: captured (teal) vs sent to drains (grey). */
function SplitBar({ captured, total, label }: { captured: number; total: number; label: string }) {
  const pct = total > 0 ? (captured / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-[#C9D8E1]">{label}</span>
        <span className="tnum text-[#8FA7B3]">
          {lakh(captured)} L captured · {lakh(total - captured)} L to drains
        </span>
      </div>
      <div className="mt-1.5 flex h-3 overflow-hidden rounded-full bg-[#64798A]/40">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#7CC4FF] to-[#2DD4BF]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default function WhatIfSimulator({ inputs, impact, currentPct, targetPct, onCurrent, onTarget, scenario, onUseExample }: Props) {
  const missing = !inputs.areaSqft ? 'area' : !inputs.rainMm ? 'rain' : null;

  return (
    <section id="what-if" aria-labelledby="whatif-heading" className="scroll-mt-28 rounded-2xl border border-white/10 bg-[#0A1522]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 p-6">
        <div>
          <h2 id="whatif-heading" className="text-xl font-semibold tracking-tight">
            What if you upgrade?
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[#8FA7B3]">
            Set how much of your roof drains into rainwater harvesting today, then drag the target to see what changes. Uses the roof area,
            rainfall, runoff coefficient and water value from the calculator above.
          </p>
        </div>
        <SourceTag type="calculated" />
      </div>

      {missing ? (
        <div className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg text-[15px] text-[#C9D8E1]">
            {missing === 'area'
              ? 'Enter your rooftop area in the calculator to run the simulation.'
              : 'Annual rainfall is missing. Enter it in the calculator to run the simulation.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => document.getElementById('rwh-calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="rounded-lg border border-white/15 px-3.5 py-2 text-sm text-[#E8F3F6] hover:border-white/30"
            >
              Go to calculator
            </button>
            {missing === 'area' ? (
              <button type="button" onClick={onUseExample} className="rounded-lg bg-[#2DD4BF] px-3.5 py-2 text-sm font-semibold text-[#050B14] hover:bg-[#5EEAD4]">
                Try a 20,000 sq ft example
              </button>
            ) : null}
          </div>
        </div>
      ) : scenario ? (
        <div className="grid lg:grid-cols-[1fr_1.25fr]">
          {/* Controls */}
          <div className="space-y-7 p-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="cov-now" className="text-sm text-[#E8F3F6]">
                  Roof connected to RWH today: <span className="tnum font-semibold">{currentPct}%</span>
                </label>
                <SourceTag type="user" label="Your estimate" />
              </div>
              <Slider id="cov-now" value={currentPct} onChange={(v) => onCurrent(Math.min(v, targetPct))} label="Roof connected today" />
              <p className="mt-1.5 text-xs text-[#8FA7B3]">0% if you have no working system. GMDA does not record this for societies.</p>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="cov-after" className="text-sm text-[#E8F3F6]">
                  After intervention: <span className="tnum font-semibold text-[#5EEAD4]">{targetPct}%</span>
                </label>
                <div className="flex gap-1">
                  {PRESETS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onTarget(Math.max(v, currentPct))}
                      className={`tnum rounded-md border px-2 py-0.5 text-[11px] transition-colors ${
                        targetPct === v ? 'border-[#2DD4BF] bg-[#2DD4BF]/15 text-[#5EEAD4]' : 'border-white/10 text-[#8FA7B3] hover:text-[#E8F3F6]'
                      }`}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>
              <Slider id="cov-after" value={targetPct} onChange={(v) => onTarget(Math.max(v, currentPct))} label="Roof connected after intervention" />
            </div>

            <div className="space-y-4 rounded-xl border border-white/[0.06] bg-[#050B14]/50 p-4">
              <SplitBar label="Today" captured={scenario.before.captured} total={scenario.roofRunoffL} />
              <SplitBar label="After intervention" captured={scenario.after.captured} total={scenario.roofRunoffL} />
              <p className="text-[11px] leading-relaxed text-[#8FA7B3]">
                Roof runoff per year: {lakh(scenario.roofRunoffL)} L ({fmt(inputs.areaSqft)} sq ft × {fmt(inputs.rainMm)} mm × {inputs.coef.toFixed(2)}).
              </p>
            </div>
          </div>

          {/* Result */}
          <div className="flex flex-col gap-6 border-t border-white/5 bg-gradient-to-br from-[#2DD4BF]/[0.07] to-[#7CC4FF]/[0.03] p-6 lg:border-l lg:border-t-0">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="rounded-xl border border-white/[0.07] bg-[#050B14]/50 p-4">
                <p className="text-xs text-[#8FA7B3]">Today</p>
                <p className="tnum mt-1 text-2xl font-semibold">{lakh(scenario.before.captured)} L</p>
                <p className="tnum text-xs text-[#8FA7B3]">{fmtInr(scenario.before.valueInr)} / yr</p>
              </div>
              <ArrowRight aria-hidden="true" className="h-5 w-5 text-[#5EEAD4]" />
              <div className="rounded-xl border border-[#2DD4BF]/40 bg-[#2DD4BF]/[0.08] p-4">
                <p className="text-xs text-[#5EEAD4]">After</p>
                <p className="tnum mt-1 text-2xl font-semibold text-[#5EEAD4]">{lakh(scenario.after.captured)} L</p>
                <p className="tnum text-xs text-[#8FA7B3]">{fmtInr(scenario.after.valueInr)} / yr</p>
              </div>
            </div>

            <div aria-live="polite">
              <p className="text-sm text-[#8FA7B3]">Extra water captured each year</p>
              <p className="tnum mt-1 flex items-baseline gap-2 text-4xl font-semibold tracking-tight text-[#E8F3F6] sm:text-5xl">
                <Droplets className="h-7 w-7 self-center text-[#7CC4FF]" aria-hidden="true" />
                {lakh(scenario.addedL)} <span className="text-xl font-medium text-[#E8F3F6]/70">litres</span>
              </p>
              <p className="tnum mt-2 text-sm text-[#C9D8E1]">
                ≈ {fmtInr(scenario.addedValueInr)} a year · about {fmt(scenario.addedTankers)} tanker loads
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#050B14]/50 p-4">
              <p className="text-sm text-[#E8F3F6]">On a heavy-rain day ({impact.heavyRainDayMm} mm)</p>
              <p className="tnum mt-1 text-sm text-[#C9D8E1]">
                Your roof sheds {lakh(scenario.heavyDay.roofL)} L. At {targetPct}% connected, {lakh(scenario.heavyDay.keptOffStreetAfter)} L stays off the
                street instead of {lakh(scenario.heavyDay.keptOffStreetBefore)} L today.
              </p>
              <p className="tnum mt-2 text-xs text-[#8FA7B3]">
                To hold that, tanks plus recharge pits need about <span className="text-[#E8F3F6]">{lakh(scenario.heavyDay.storageNeededL)} L</span> of
                capacity ({fmt(scenario.heavyDay.storageNeededL / 1000, 1)} m³).
              </p>
            </div>

            <p className="mt-auto text-[11px] leading-relaxed text-[#8FA7B3]">
              Assumptions: tanker load {fmt(impact.tankerLitres)} L; heavy-rain day = IMD &quot;heavy&quot; threshold. Real yield depends on storage size, first-flush
              losses and maintenance.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
