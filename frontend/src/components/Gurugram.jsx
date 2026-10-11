import { motion, useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import Reveal from "./ui/Reveal";
import SectionTitle from "./ui/SectionTitle";

const GG_POINTS = [
  { name: "Golf Course Road", x: 372, y: 150, dx: 12, dy: -10, anchor: "start" },
  { name: "Sushant Lok", x: 300, y: 190, dx: -12, dy: -10, anchor: "end" },
  { name: "Sohna Road", x: 324, y: 298, dx: 12, dy: 4, anchor: "start" },
  { name: "Sector 48", x: 262, y: 322, dx: -12, dy: 4, anchor: "end" },
];

function GurugramMap() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 520 440" className="h-auto w-full" role="img" aria-label="Stylized map of Gurugram with four example locations">
      <defs>
        <clipPath id="gg-clip">
          <path d="M 70 120 C 120 60 230 40 320 55 C 400 68 470 110 480 180 C 492 260 450 340 380 380 C 300 420 190 410 130 360 C 70 310 40 200 70 120 Z" />
        </clipPath>
        <pattern id="gg-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="rgba(124,196,255,0.22)" />
        </pattern>
        <radialGradient id="gg-glow" cx="0.55" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#2DD4BF" stopOpacity="0.16" />
          <stop offset="1" stopColor="#2DD4BF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath="url(#gg-clip)">
        <rect width="520" height="440" fill="url(#gg-dots)" />
        <rect width="520" height="440" fill="url(#gg-glow)" />
        <g fill="none" stroke="rgba(232,243,246,0.14)" strokeLinecap="round">
          <path d="M 40 70 C 140 150 210 260 300 440" strokeWidth="4" />
          <path d="M 360 30 C 365 140 372 240 380 340" strokeWidth="2.5" />
          <path d="M 300 200 C 310 280 330 350 350 440" strokeWidth="2.5" />
          <path d="M 180 150 C 260 170 320 180 440 190" strokeWidth="2.5" />
          <path d="M 60 260 C 180 250 300 260 480 250" strokeWidth="1.2" />
        </g>
      </g>
      <path
        d="M 70 120 C 120 60 230 40 320 55 C 400 68 470 110 480 180 C 492 260 450 340 380 380 C 300 420 190 410 130 360 C 70 310 40 200 70 120 Z"
        fill="none"
        stroke="rgba(94,234,212,0.35)"
        strokeDasharray="5 5"
      />
      <text x="96" y="132" fontSize="10" fill="rgba(232,243,246,0.4)" transform="rotate(38 96 132)">NH 48</text>

      {GG_POINTS.map((p, i) => (
        <g key={p.name}>
          {!reduce && (
            <motion.circle
              cx={p.x}
              cy={p.y}
              fill="none"
              stroke="#5EEAD4"
              initial={{ r: 5, opacity: 0.8 }}
              animate={{ r: [5, 28], opacity: [0.8, 0] }}
              transition={{ duration: 2.6, delay: i * 0.55, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <circle cx={p.x} cy={p.y} r="9" fill="rgba(94,234,212,0.18)" />
          <circle cx={p.x} cy={p.y} r="4" fill="#5EEAD4" />
          <text x={p.x + p.dx} y={p.y + p.dy} textAnchor={p.anchor} fontSize="12" fontWeight="500" fill="#D5E3EA">
            {p.name}
          </text>
        </g>
      ))}

      <g transform="translate(470 40)" fill="rgba(232,243,246,0.5)" fontSize="10" textAnchor="middle">
        <path d="M 0 18 L 0 2 M -4 7 L 0 2 L 4 7" stroke="rgba(232,243,246,0.5)" fill="none" />
        <text y="-4">N</text>
      </g>
    </svg>
  );
}

const ROADMAP = [
  { when: "Now", what: "Housing societies across Gurugram" },
  { when: "Next", what: "More cities in the National Capital Region" },
  { when: "Later", what: "Cities across India facing monsoon flooding and water stress" },
];

export default function Gurugram() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <Reveal>
            <SectionTitle>
              Starting with Gurugram.
              <br />
              Built to scale beyond it.
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#9FB4C2]">
              PRAVAH starts with Gurugram's urban water challenges and can eventually expand to cities across India.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <ol className="mt-10 border-l border-white/[0.08]">
              {ROADMAP.map((r, i) => (
                <li key={r.when} className="relative pb-7 pl-6 last:pb-0">
                  <span
                    className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
                      i === 0 ? "bg-[#5EEAD4] shadow-[0_0_12px_rgba(94,234,212,0.8)]" : "border border-white/20 bg-[#050B14]"
                    }`}
                  />
                  <p className={`text-sm font-semibold ${i === 0 ? "text-teal-200" : "text-[#8DA4B4]"}`}>{r.when}</p>
                  <p className="mt-0.5 text-[15px] text-[#C9D8E1]">{r.what}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={28}>
          <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0A1726] to-[#060F1B] p-4 sm:p-6">
            <GurugramMap />
            <p className="mt-2 flex items-center gap-1.5 px-1 text-[12px] text-[#7F97A8]">
              <Info className="h-3.5 w-3.5 text-[#7CC4FF]" />
              Locations shown for orientation only. They are not risk ratings.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

