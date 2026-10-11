import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CloudRainWind, Droplets } from "lucide-react";
import Kicker from "./ui/Kicker";
import { EASE } from "../lib/scenario";

// Paths in the hero diagram (viewBox 0 0 560 480)
const CAPTURE_PATH = "M 84 134 H 198 V 184 H 306 V 368 H 298";
const RECHARGE_PATH = "M 255 398 V 452";
const RUNOFF_PATH = "M 312 326 H 420 C 434 326 440 334 456 345";
const GROUND_PATH = "M 0 330 H 430 C 442 330 446 352 470 352 H 510 C 534 352 538 330 550 330 H 560";
const POOL_PATH = "M 440 338 C 444 349 456 352 470 352 H 510 C 524 352 536 349 540 338 Z";

const HERO_DROPS = (() => {
  let seed = 11;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: 36 }, () => {
    const x = 24 + rnd() * 520;
    const land = x >= 70 && x <= 190 ? 140 : x >= 210 && x <= 300 ? 190 : 330;
    return {
      x,
      land,
      len: 8 + rnd() * 9,
      delay: rnd() * 3,
      dur: 1.3 + rnd() * 0.9,
      op: 0.25 + rnd() * 0.45,
    };
  });
})();

function DiagramLabel({ x, y, active, tone, children, anchor = "start" }) {
  const activeFill = tone === "good" ? "#5EEAD4" : "#FCA5A5";
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize="9.5"
      fontWeight="600"
      letterSpacing="1.6"
      fill={active ? activeFill : "rgba(141,164,180,0.55)"}
      style={{ transition: "fill 0.6s ease" }}
    >
      {children}
    </text>
  );
}

function HeroDiagram({ on }) {
  const reduce = useReducedMotion();
  const drops = HERO_DROPS;

  const windowsA = [];
  for (let r = 0; r < 6; r += 1) {
    for (let c = 0; c < 5; c += 1) windowsA.push({ x: 84 + c * 22, y: 158 + r * 26, lit: (r * 5 + c) % 7 === 2 });
  }
  const windowsB = [];
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 4; c += 1) windowsB.push({ x: 222 + c * 20, y: 206 + r * 24, lit: (r * 4 + c) % 6 === 1 });
  }

  const flowT = (o) => ({
    strokeDashoffset: { duration: 1.2, repeat: Infinity, ease: "linear" },
    opacity: { duration: 0.8, ease: EASE },
    ...o,
  });

  return (
    <svg
      viewBox="0 0 560 480"
      className="relative block h-auto w-full"
      role="img"
      aria-label="Diagram: rain falling on a housing society. Without PRAVAH, runoff flows into a waterlogged low point. With PRAVAH, rooftop rain flows into a collection tank and recharges groundwater."
    >
      <defs>
        <linearGradient id="hv-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7CC4FF" stopOpacity="0.09" />
          <stop offset="1" stopColor="#7CC4FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hv-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0F2032" />
          <stop offset="1" stopColor="#071220" />
        </linearGradient>
        <linearGradient id="hv-bldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15293E" />
          <stop offset="1" stopColor="#0B1828" />
        </linearGradient>
        <linearGradient id="hv-aquifer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2DD4BF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#2DD4BF" stopOpacity="0.4" />
          <stop offset="1" stopColor="#2DD4BF" stopOpacity="0" />
        </linearGradient>
        <filter id="hv-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="560" height="330" fill="url(#hv-sky)" />
      <rect y="330" width="560" height="150" fill="url(#hv-soil)" />

      {/* soil texture */}
      {Array.from({ length: 40 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 137) % 560}
          cy={350 + ((i * 53) % 110)}
          r="0.9"
          fill="rgba(148,197,214,0.12)"
        />
      ))}

      {/* aquifer band */}
      <motion.rect
        x="70"
        y="448"
        width="420"
        height="20"
        rx="10"
        fill="url(#hv-aquifer)"
        animate={{ opacity: on ? 1 : 0.3 }}
        transition={{ duration: 1.2 }}
      />

      {/* buildings */}
      <rect x="70" y="140" width="120" height="190" fill="url(#hv-bldg)" stroke="rgba(148,197,214,0.18)" />
      <rect x="210" y="190" width="90" height="140" fill="url(#hv-bldg)" stroke="rgba(148,197,214,0.18)" />
      {windowsA.map((w, i) => (
        <rect
          key={`a${i}`}
          x={w.x}
          y={w.y}
          width="10"
          height="7"
          rx="1"
          fill={w.lit ? "rgba(251,191,36,0.28)" : "rgba(124,196,255,0.09)"}
        />
      ))}
      {windowsB.map((w, i) => (
        <rect
          key={`b${i}`}
          x={w.x}
          y={w.y}
          width="9"
          height="7"
          rx="1"
          fill={w.lit ? "rgba(251,191,36,0.28)" : "rgba(124,196,255,0.09)"}
        />
      ))}

      {/* rooftop highlight when capturing */}
      <motion.path
        d="M 70 140 H 190 M 210 190 H 300"
        stroke="#5EEAD4"
        strokeWidth="2"
        animate={{ opacity: on ? 0.9 : 0.15 }}
        transition={{ duration: 0.8 }}
        filter="url(#hv-glow)"
      />

      {/* ground + low point */}
      <path d={GROUND_PATH} fill="none" stroke="rgba(148,197,214,0.35)" strokeWidth="1.2" />
      <line x1="320" y1="336" x2="420" y2="336" stroke="rgba(148,197,214,0.1)" strokeDasharray="6 8" />

      {/* waterlogging pool */}
      <motion.path
        d={POOL_PATH}
        fill="rgba(124,196,255,0.22)"
        stroke="rgba(248,113,113,0.6)"
        strokeWidth="1"
        style={{ originX: 0.5, originY: 1 }}
        animate={{ scaleY: on ? 0.25 : 1, opacity: on ? 0.55 : 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      />
      <motion.g animate={{ opacity: on ? 0 : 1 }} transition={{ duration: 0.8 }}>
        {[0, 1.1].map((d) => (
          <motion.ellipse
            key={d}
            cx="490"
            cy="342"
            fill="none"
            stroke="rgba(248,113,113,0.5)"
            initial={{ rx: 4, ry: 1, opacity: 0.7 }}
            animate={reduce ? { rx: 18, ry: 3, opacity: 0.4 } : { rx: [4, 40], ry: [1, 5], opacity: [0.7, 0] }}
            transition={{ duration: 2.2, delay: d, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
      </motion.g>

      {/* collection tank */}
      <rect x="213" y="348" width="84" height="50" rx="7" fill="rgba(7,17,30,0.9)" stroke="rgba(94,234,212,0.45)" />
      <motion.rect
        x="216"
        y="351"
        width="78"
        height="44"
        rx="5"
        fill="rgba(45,212,191,0.38)"
        style={{ originX: 0.5, originY: 1 }}
        initial={{ scaleY: 0.1 }}
        animate={{ scaleY: on ? 0.85 : 0.1 }}
        transition={{ duration: 1.8, ease: EASE }}
      />

      {/* pipe structure (always visible) */}
      <path d={CAPTURE_PATH} fill="none" stroke="rgba(148,197,214,0.22)" strokeWidth="4" strokeLinejoin="round" />
      <path d={RECHARGE_PATH} fill="none" stroke="rgba(148,197,214,0.18)" strokeWidth="3" strokeDasharray="2 4" />

      {/* capture flow */}
      <motion.path
        d={CAPTURE_PATH}
        fill="none"
        stroke="#5EEAD4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 10"
        filter="url(#hv-glow)"
        animate={{ strokeDashoffset: reduce ? 0 : [0, -32], opacity: on ? 1 : 0.1 }}
        transition={flowT()}
      />
      <motion.path
        d={RECHARGE_PATH}
        fill="none"
        stroke="#34D399"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 8"
        filter="url(#hv-glow)"
        animate={{ strokeDashoffset: reduce ? 0 : [0, -24], opacity: on ? 1 : 0.08 }}
        transition={flowT()}
      />

      {/* runoff flow */}
      <motion.path
        d={RUNOFF_PATH}
        fill="none"
        stroke="#F87171"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 10"
        animate={{ strokeDashoffset: reduce ? 0 : [0, -32], opacity: on ? 0.12 : 0.9 }}
        transition={flowT()}
      />

      {/* glowing particles following paths */}
      {!reduce && (
        <>
          <motion.g animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.8 }}>
            {[0, 0.9, 1.8].map((b) => (
              <circle key={`c${b}`} r="3" fill="#A7F3D0" filter="url(#hv-glow)">
                <animateMotion dur="2.7s" begin={`-${b}s`} repeatCount="indefinite" path={CAPTURE_PATH} />
              </circle>
            ))}
            {[0, 0.8].map((b) => (
              <circle key={`r${b}`} r="2.5" fill="#34D399" filter="url(#hv-glow)">
                <animateMotion dur="1.6s" begin={`-${b}s`} repeatCount="indefinite" path={RECHARGE_PATH} />
              </circle>
            ))}
            {[0, 1.2].map((d) => (
              <motion.ellipse
                key={`aq${d}`}
                cx="255"
                cy="458"
                fill="none"
                stroke="rgba(52,211,153,0.6)"
                initial={{ rx: 4, ry: 1, opacity: 0.8 }}
                animate={{ rx: [4, 70], ry: [1, 7], opacity: [0.8, 0] }}
                transition={{ duration: 2.4, delay: d, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
          </motion.g>
          <motion.g animate={{ opacity: on ? 0 : 1 }} transition={{ duration: 0.8 }}>
            {[0, 1.1].map((b) => (
              <circle key={`ro${b}`} r="2.6" fill="#FCA5A5" filter="url(#hv-glow)">
                <animateMotion dur="2.2s" begin={`-${b}s`} repeatCount="indefinite" path={RUNOFF_PATH} />
              </circle>
            ))}
          </motion.g>
        </>
      )}

      {/* rain */}
      {drops.map((d, i) => (
        <motion.line
          key={i}
          x1={d.x}
          x2={d.x - 2}
          y1={0}
          y2={d.len}
          stroke="#7CC4FF"
          strokeWidth="1.1"
          strokeLinecap="round"
          initial={{ y: -30, opacity: 0 }}
          animate={reduce ? { y: d.land * 0.45, opacity: d.op * 0.6 } : { y: [-30, d.land - d.len], opacity: [0, d.op, d.op, 0] }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  y: { duration: d.dur, delay: d.delay, repeat: Infinity, ease: "linear" },
                  opacity: { duration: d.dur, delay: d.delay, repeat: Infinity, times: [0, 0.15, 0.85, 1] },
                }
          }
        />
      ))}

      {/* labels */}
      <DiagramLabel x={84} y={124} active={on} tone="good">ROOFTOP</DiagramLabel>
      <DiagramLabel x={205} y={377} active={on} tone="good" anchor="end">COLLECTION</DiagramLabel>
      <DiagramLabel x={266} y={434} active={on} tone="good">RECHARGE</DiagramLabel>

      <DiagramLabel x={330} y={250} active={!on} tone="bad">RAIN</DiagramLabel>
      <path d="M 340 258 V 300" stroke="rgba(141,164,180,0.3)" strokeDasharray="2 3" />
      <DiagramLabel x={330} y={316} active={!on} tone="bad">RUNOFF</DiagramLabel>
      <DiagramLabel x={490} y={378} active={!on} tone="bad" anchor="middle">WATERLOGGING</DiagramLabel>
    </svg>
  );
}

function RiskCardBody() {
  return (
    <>
      <Kicker className="text-[10px]">WATERLOGGING RISK</Kicker>
      <div className="mt-2 flex items-end gap-2">
        <span className="tnum text-[32px] font-semibold leading-none text-[#E8F3F6]">78</span>
        <span className="pb-0.5 text-sm text-[#8DA4B4]">/ 100</span>
        <span className="mb-0.5 ml-1 rounded bg-rose-400/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-rose-300">
          HIGH
        </span>
      </div>
      <div className="mt-3 h-1 w-40 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-amber-300 to-rose-400" />
      </div>
    </>
  );
}

function PotentialCardBody() {
  return (
    <>
      <Kicker className="text-[10px]">RAINWATER POTENTIAL</Kicker>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="tnum text-[28px] font-semibold leading-none text-[#E8F3F6]">10.4</span>
        <span className="text-sm text-[#A9BDCA]">Lakh L / Year</span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-[#5EEAD4]">
        <Droplets className="h-3.5 w-3.5" /> From rooftops alone
      </div>
    </>
  );
}

function ImpactCardBody() {
  return (
    <>
      <Kicker className="text-[10px]">EST. IMPACT</Kicker>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="tnum text-[28px] font-semibold leading-none text-[#E8F3F6]">₹32,400</span>
        <span className="text-sm text-[#A9BDCA]">/ Year</span>
      </div>
      <div className="mt-3 flex items-end gap-1" aria-hidden="true">
        {[6, 9, 8, 12, 14, 18, 22].map((h, i) => (
          <span key={i} className="w-2 rounded-sm bg-emerald-300/70" style={{ height: h, opacity: 0.35 + i * 0.1 }} />
        ))}
      </div>
    </>
  );
}

function FloatCard({ className = "", delay = 0, float = 6, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -float, 0] }}
        transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-xl border border-white/[0.09] bg-[#0B1828]/75 p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function HeroVisual() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState("without");
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || reduce) return undefined;
    const t = setInterval(() => setMode((m) => (m === "without" ? "with" : "without")), 5200);
    return () => clearInterval(t);
  }, [auto, reduce]);

  const on = mode === "with";
  const pick = (m) => {
    setAuto(false);
    setMode(m);
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0B1A2B]/90 to-[#060F1B]/90 shadow-[0_50px_140px_-50px_rgba(45,212,191,0.35)]"
      >
        <motion.div
          aria-hidden="true"
          className="pravah-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
          animate={reduce ? undefined : { backgroundPosition: ["0px 0px", "48px 48px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-[#8DA4B4]">
            <CloudRainWind className="h-3.5 w-3.5 text-[#7CC4FF]" />
            Simulated monsoon shower
          </div>
          <div
            role="tablist"
            aria-label="Scenario"
            className="relative flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5 text-xs"
          >
            {[
              ["without", "Without PRAVAH"],
              ["with", "With PRAVAH"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => pick(key)}
                className="relative rounded-md px-3 py-1.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70"
              >
                {mode === key && (
                  <motion.span
                    layoutId="hero-mode-pill"
                    className={`absolute inset-0 rounded-md ${
                      key === "with" ? "bg-teal-400/15 ring-1 ring-teal-300/30" : "bg-rose-400/10 ring-1 ring-rose-300/25"
                    }`}
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span className={`relative ${mode === key ? "text-[#E8F3F6]" : "text-[#8DA4B4]"}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <HeroDiagram on={on} />

        <div className="relative z-10 flex min-h-[48px] items-center border-t border-white/[0.06] px-4 py-3 text-[13px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={mode}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className={on ? "text-teal-200" : "text-rose-200/90"}
            >
              {on
                ? "Rooftop rain is routed into storage and recharged into the ground."
                : "Rain runs off paved surfaces and pools in the low-lying street."}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating cards: around the visual on wide screens */}
      <FloatCard className="absolute -left-14 top-24 z-20 hidden xl:block" delay={0.9} float={6}>
        <RiskCardBody />
      </FloatCard>
      <FloatCard className="absolute -right-10 top-[44%] z-20 hidden xl:block" delay={1.1} float={8}>
        <PotentialCardBody />
      </FloatCard>
      <FloatCard className="absolute -bottom-10 left-16 z-20 hidden xl:block" delay={1.3} float={5}>
        <ImpactCardBody />
      </FloatCard>

      {/* Stacked below on smaller screens */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:hidden">
        <FloatCard delay={0.9} float={0}>
          <RiskCardBody />
        </FloatCard>
        <FloatCard delay={1.0} float={0}>
          <PotentialCardBody />
        </FloatCard>
        <FloatCard delay={1.1} float={0}>
          <ImpactCardBody />
        </FloatCard>
      </div>
    </div>
  );
}

