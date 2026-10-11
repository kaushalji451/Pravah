import { CloudRain, Droplets, Waves } from "lucide-react";
import Reveal from "./ui/Reveal";
import SectionTitle from "./ui/SectionTitle";

function MiniRainfall() {
  const bars = [9, 12, 8, 15, 11, 42, 36, 14, 10, 7, 12, 9, 6, 10];
  return (
    <svg viewBox="0 0 140 52" className="h-14 w-full" aria-hidden="true">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 10 + 1}
          y={52 - h}
          width="6"
          height={h}
          rx="1.5"
          fill={h > 30 ? "#7CC4FF" : "rgba(124,196,255,0.22)"}
        />
      ))}
    </svg>
  );
}

function MiniWaterlogging() {
  return (
    <svg viewBox="0 0 140 52" className="h-14 w-full" aria-hidden="true">
      <path
        d="M 0 22 H 44 C 56 22 58 44 72 44 H 86 C 100 44 102 22 114 22 H 140"
        fill="none"
        stroke="rgba(148,197,214,0.45)"
        strokeWidth="1.2"
      />
      <path d="M 52 30 C 56 42 62 44 72 44 H 86 C 96 44 102 42 106 30 Z" fill="rgba(124,196,255,0.3)" stroke="rgba(248,113,113,0.6)" />
      <path d="M 8 14 H 40" stroke="#F87171" strokeWidth="1.5" strokeDasharray="3 4" />
      <path d="M 36 10 L 42 14 L 36 18" fill="none" stroke="#F87171" strokeWidth="1.5" />
    </svg>
  );
}

function MiniUnused() {
  return (
    <div className="flex h-14 flex-col justify-center gap-2.5" aria-hidden="true">
      <div className="flex items-center gap-3 text-[11px] text-[#8DA4B4]">
        <span className="w-16">Captured</span>
        <span className="h-1.5 w-[14%] rounded-full bg-[#5EEAD4]" />
      </div>
      <div className="flex items-center gap-3 text-[11px] text-[#8DA4B4]">
        <span className="w-16">Runoff</span>
        <span className="h-1.5 w-[62%] rounded-full bg-slate-400/40" />
      </div>
    </div>
  );
}

const PROBLEMS = [
  {
    n: "01",
    title: "Heavy Rainfall",
    text: "Short-duration rainfall can overwhelm urban drainage systems.",
    icon: CloudRain,
    visual: <MiniRainfall />,
  },
  {
    n: "02",
    title: "Waterlogging",
    text: "Low-lying and poorly drained areas can become vulnerable during intense rain.",
    icon: Waves,
    visual: <MiniWaterlogging />,
  },
  {
    n: "03",
    title: "Unused Potential",
    text: "Rainwater that could be captured or recharged often becomes runoff.",
    icon: Droplets,
    visual: <MiniUnused />,
  },
];

export default function Problem() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <SectionTitle>Rain shouldn't become a risk.</SectionTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-lg text-[17px] leading-relaxed text-[#9FB4C2] lg:ml-auto">
              Urban communities receive large amounts of rain, but without the right infrastructure, much of it becomes
              surface runoff, waterlogging, and wasted water.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.n} delay={i * 0.1} y={28}>
                <article className="group relative h-full overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.005] p-6 transition-colors duration-500 hover:border-teal-300/25 sm:p-7">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="flex items-center justify-between">
                    <span className="tnum text-sm text-[#5EEAD4]">{p.n}</span>
                    <Icon className="h-5 w-5 text-[#6F8797]" />
                  </div>
                  <div className="mt-8">{p.visual}</div>
                  <h3 className="mt-7 text-xl font-semibold tracking-tight text-[#E8F3F6]">{p.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#93A9B8]">{p.text}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

