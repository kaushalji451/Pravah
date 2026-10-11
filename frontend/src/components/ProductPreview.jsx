import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Building2, Droplets, IndianRupee, Search, Wrench } from "lucide-react";
import LogoMark from "./ui/LogoMark";
import Reveal from "./ui/Reveal";
import SectionTitle from "./ui/SectionTitle";
import Kicker from "./ui/Kicker";
import AnimatedNumber from "./ui/AnimatedNumber";
import { focusRing, PrimaryButton } from "./ui/Buttons";
import { EASE } from "../lib/scenario";

function Panel({ children, className = "" }) {
  return <div className={`rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 ${className}`}>{children}</div>;
}

function RiskGauge({ value = 78 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[230px]">
      <svg viewBox="0 0 200 116" className="w-full" aria-hidden="true">
        <defs>
          <linearGradient id="gauge-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#34D399" />
            <stop offset="0.55" stopColor="#FBBF24" />
            <stop offset="1" stopColor="#F87171" />
          </linearGradient>
        </defs>
        <path d="M 16 104 A 84 84 0 0 1 184 104" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="11" strokeLinecap="round" />
        <motion.path
          d="M 16 104 A 84 84 0 0 1 184 104"
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth="11"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? value / 100 : 0 }}
          transition={{ duration: 1.8, delay: 0.2, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <div className="text-[40px] font-semibold leading-none text-[#E8F3F6]">
          <AnimatedNumber value={value} duration={1.8} />
          <span className="text-base font-normal text-[#8DA4B4]"> / 100</span>
        </div>
        <span className="mt-2 inline-block rounded bg-rose-400/15 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-rose-300">
          HIGH
        </span>
      </div>
    </div>
  );
}

const FACTORS = [
  { label: "Rainfall", level: "High", n: 3 },
  { label: "Terrain", level: "Moderate", n: 2 },
  { label: "Historical incidents", level: "High", n: 3 },
  { label: "Runoff potential", level: "High", n: 3 },
];

function FactorRow({ label, level, n }) {
  const high = n === 3;
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-[#A9BDCA]">{label}</span>
      <span className="flex items-center gap-3">
        <span className="flex gap-1" aria-hidden="true">
          {[1, 2, 3].map((k) => (
            <span
              key={k}
              className={`h-1.5 w-4 rounded-full ${k <= n ? (high ? "bg-rose-400" : "bg-amber-300") : "bg-white/10"}`}
            />
          ))}
        </span>
        <span className={`w-16 text-right text-xs font-medium ${high ? "text-rose-300" : "text-amber-200"}`}>{level}</span>
      </span>
    </div>
  );
}

const ZONES = [
  {
    tone: "high",
    d: "M 352 196 C 372 150 474 140 506 196 C 536 250 506 314 444 322 C 380 330 334 252 352 196 Z",
  },
  { tone: "mod", d: "M 176 128 C 218 96 312 108 322 160 C 332 212 270 242 218 232 C 158 220 146 156 176 128 Z" },
  { tone: "mod", d: "M 500 66 C 542 46 604 66 604 108 C 604 150 552 160 520 146 C 488 132 468 88 500 66 Z" },
  { tone: "low", d: "M 58 280 C 88 238 182 248 202 290 C 218 332 160 362 108 356 C 58 350 38 310 58 280 Z" },
  { tone: "low", d: "M 296 48 C 326 28 400 38 406 74 C 412 106 360 120 328 110 C 292 100 276 68 296 48 Z" },
];
const ZONE_STYLE = {
  high: { fill: "rgba(248,113,113,0.16)", stroke: "rgba(248,113,113,0.55)" },
  mod: { fill: "rgba(251,191,36,0.13)", stroke: "rgba(251,191,36,0.45)" },
  low: { fill: "rgba(52,211,153,0.12)", stroke: "rgba(52,211,153,0.45)" },
};

function DashboardMap() {
  const [layers, setLayers] = useState({ risk: true, terrain: true, drains: true });
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const toggle = (k) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  return (
    <Panel className="flex h-full flex-col p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3.5">
        <p className="text-sm font-medium text-[#D5E3EA]">Waterlogging risk around this society</p>
        <div className="flex gap-1.5" role="group" aria-label="Map layers">
          {[
            ["risk", "Risk"],
            ["terrain", "Elevation"],
            ["drains", "Drains"],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={layers[k]}
              onClick={() => toggle(k)}
              className={`rounded-md border px-2.5 py-1 text-[12px] transition-colors ${focusRing} ${
                layers[k]
                  ? "border-teal-300/30 bg-teal-300/10 text-teal-100"
                  : "border-white/[0.08] text-[#8DA4B4] hover:text-[#C9D8E1]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={ref} className="relative flex-1">
        <svg viewBox="0 0 640 400" className="block h-full min-h-[300px] w-full" preserveAspectRatio="xMidYMid slice" aria-label="Demo risk map">
          <defs>
            <pattern id="dm-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 H 0 V 32" fill="none" stroke="rgba(148,197,214,0.06)" />
            </pattern>
          </defs>
          <rect width="640" height="400" fill="url(#dm-grid)" />

          {/* roads */}
          <g fill="none" stroke="rgba(255,255,255,0.08)" strokeLinecap="round">
            <path d="M -10 140 C 160 152 300 120 650 172" strokeWidth="7" />
            <path d="M 300 -10 C 312 120 290 250 332 410" strokeWidth="7" />
            <path d="M -10 332 C 200 300 420 362 650 302" strokeWidth="5" />
            <path d="M 120 0 C 130 120 100 260 150 400" strokeWidth="2" />
            <path d="M 0 220 C 200 210 420 240 640 230" strokeWidth="2" />
            <path d="M 470 0 C 450 100 560 260 540 400" strokeWidth="2" />
          </g>

          {/* elevation contours */}
          <motion.g animate={{ opacity: layers.terrain ? 1 : 0 }} transition={{ duration: 0.4 }}>
            {[40, 80, 125, 175, 230].map((r) => (
              <ellipse
                key={r}
                cx="438"
                cy="252"
                rx={r * 1.25}
                ry={r * 0.85}
                fill="none"
                stroke="rgba(124,196,255,0.14)"
                strokeDasharray="3 5"
              />
            ))}
            <text x="452" y="300" fontSize="10" fill="rgba(124,196,255,0.7)">Low point</text>
          </motion.g>

          {/* risk zones */}
          <motion.g animate={{ opacity: layers.risk ? 1 : 0 }} transition={{ duration: 0.4 }}>
            {ZONES.map((z, i) => (
              <motion.path
                key={i}
                d={z.d}
                fill={ZONE_STYLE[z.tone].fill}
                stroke={ZONE_STYLE[z.tone].stroke}
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: inView ? 1 : 0 }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.12 }}
              />
            ))}
          </motion.g>

          {/* drains */}
          <motion.g animate={{ opacity: layers.drains ? 1 : 0 }} transition={{ duration: 0.4 }}>
            <motion.path
              d="M 540 -10 C 512 110 478 200 456 410"
              fill="none"
              stroke="#7CC4FF"
              strokeWidth="2"
              strokeDasharray="6 8"
              animate={{ strokeDashoffset: [0, -28] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              opacity="0.7"
            />
            <text x="548" y="26" fontSize="10" fill="rgba(124,196,255,0.75)">Storm drain</text>
          </motion.g>

          {/* society */}
          <path d="M 388 204 L 456 194 L 468 252 L 400 264 Z" fill="rgba(94,234,212,0.08)" stroke="#5EEAD4" strokeDasharray="4 3" />
          <motion.circle
            cx="428"
            cy="229"
            fill="none"
            stroke="#5EEAD4"
            initial={{ r: 6, opacity: 0.7 }}
            animate={{ r: [6, 26], opacity: [0.7, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <circle cx="428" cy="229" r="5" fill="#5EEAD4" />
          <rect x="318" y="168" width="140" height="22" rx="5" fill="rgba(5,13,24,0.85)" stroke="rgba(94,234,212,0.3)" />
          <text x="388" y="183" textAnchor="middle" fontSize="11" fill="#E8F3F6">Sushant Lok Phase 1</text>

          {/* scale */}
          <g transform="translate(560 372)">
            <path d="M 0 0 H 50" stroke="rgba(232,243,246,0.5)" />
            <path d="M 0 -4 V 4 M 50 -4 V 4" stroke="rgba(232,243,246,0.5)" />
            <text x="25" y="-8" textAnchor="middle" fontSize="9" fill="rgba(232,243,246,0.55)">500 m</text>
          </g>
        </svg>

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-lg border border-white/[0.08] bg-[#050D18]/85 px-3 py-2 text-[12px] text-[#A9BDCA] backdrop-blur">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" />High risk</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-300" />Moderate</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Lower</span>
        </div>
      </div>
    </Panel>
  );
}

function MetricCard({ label, children, sub, icon: Icon, accent = "text-[#5EEAD4]" }) {
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <Kicker className="text-[10px]">{label}</Kicker>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-[#E8F3F6]">{children}</div>
      <p className="mt-1.5 text-[13px] text-[#7F97A8]">{sub}</p>
    </Panel>
  );
}

export default function ProductPreview() {
  return (
    <section id="insights" className="relative scroll-mt-16 border-t border-white/[0.06] py-28 sm:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.05] blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <SectionTitle>
              See the water story
              <br className="hidden sm:block" /> of your society.
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="lg:ml-auto">
              <p className="max-w-md text-[17px] leading-relaxed text-[#9FB4C2]">
                Risk, rainwater potential and the next step, together on one screen for any society you select.
              </p>
              <div className="mt-4">
                <PrimaryButton to="/analyse-society" size="sm">
                  Launch Live Analysis
                </PrimaryButton>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={36} className="mt-14">
          <div className="rounded-2xl border border-white/[0.08] bg-[#08131F]/90 p-1.5 shadow-[0_70px_160px_-60px_rgba(45,212,191,0.35)] sm:p-2">
            <div className="overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#050D18]">
              {/* top bar */}
              <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <LogoMark size={24} />
                  <span className="text-xs font-semibold tracking-[0.2em] text-[#E8F3F6]">PRAVAH</span>
                </div>
                <div className="order-3 flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-[#C9D8E1] sm:order-none sm:ml-6 sm:w-auto sm:min-w-[320px]">
                  <Search className="h-4 w-4 text-[#8DA4B4]" />
                  Sushant Lok Phase 1, Gurugram
                </div>
                <div className="ml-auto flex items-center gap-2 text-[11px] text-[#8DA4B4]">
                  <span className="hidden rounded-md border border-white/[0.08] px-2 py-1 sm:inline">Annual view</span>
                  <span className="rounded-md border border-amber-300/20 bg-amber-300/[0.06] px-2 py-1 text-amber-200">Demo data</span>
                </div>
              </div>

              {/* body */}
              <div className="grid gap-3 p-3 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                <div className="flex flex-col gap-3">
                  <Panel>
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                        <Building2 className="h-5 w-5 text-[#7CC4FF]" />
                      </span>
                      <div>
                        <p className="text-lg font-semibold leading-tight text-[#E8F3F6]">Sushant Lok Phase 1</p>
                        <p className="mt-0.5 text-sm text-[#8DA4B4]">Gurugram</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
                      <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                        <p className="text-[#7F97A8]">Rooftop area</p>
                        <p className="tnum mt-0.5 text-[#D5E3EA]">~2,000 m²</p>
                      </div>
                      <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                        <p className="text-[#7F97A8]">Annual rainfall</p>
                        <p className="tnum mt-0.5 text-[#D5E3EA]">~650 mm</p>
                      </div>
                    </div>
                  </Panel>

                  <Panel>
                    <Kicker className="text-[10px]">WATERLOGGING RISK</Kicker>
                    <div className="mt-4">
                      <RiskGauge value={78} />
                    </div>
                    <div className="mt-4 divide-y divide-white/[0.05]">
                      {FACTORS.map((f) => (
                        <FactorRow key={f.label} {...f} />
                      ))}
                    </div>
                  </Panel>
                </div>

                <DashboardMap />
              </div>

              {/* recommended action */}
              <div className="px-3">
                <div className="flex flex-col gap-3 rounded-xl border border-teal-300/15 bg-gradient-to-r from-teal-400/[0.07] to-transparent p-4 sm:flex-row sm:items-center">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-300/10">
                    <Wrench className="h-4 w-4 text-[#5EEAD4]" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-teal-200">RECOMMENDED ACTION: UPGRADE</p>
                    <p className="mt-0.5 text-sm text-[#C9D8E1]">
                      Desilt the existing recharge pits and connect the remaining tower downpipes to storage.
                    </p>
                  </div>
                </div>
              </div>

              {/* bottom metrics */}
              <div className="grid gap-3 p-3 sm:grid-cols-3">
                <MetricCard label="RAINWATER POTENTIAL" icon={Droplets} sub="From rooftops, at full coverage">
                  <AnimatedNumber value={10.4} format={(v) => v.toFixed(1)} /> <span className="text-base font-normal text-[#A9BDCA]">Lakh Litres/year</span>
                </MetricCard>
                <MetricCard label="RWH STATUS" icon={Wrench} accent="text-amber-300" sub="Some pits silted, partial coverage">
                  <span className="text-amber-200">Needs Upgrade</span>
                </MetricCard>
                <MetricCard label="EST. VALUE" icon={IndianRupee} sub="At an illustrative water tariff">
                  ₹<AnimatedNumber value={32400} /> <span className="text-base font-normal text-[#A9BDCA]">/year</span>
                </MetricCard>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

