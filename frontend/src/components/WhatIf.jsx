import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, IndianRupee, TrendingDown } from "lucide-react";
import Reveal from "./ui/Reveal";
import SectionTitle from "./ui/SectionTitle";
import Kicker from "./ui/Kicker";
import AnimatedNumber from "./ui/AnimatedNumber";
import DemoChip from "./ui/DemoChip";
import { focusRing } from "./ui/Buttons";
import { EASE, scenario } from "../lib/scenario";

export default function WhatIf() {
  const [cov, setCov] = useState(60);
  const s = scenario(cov);

  return (
    <section className="relative border-t border-white/[0.06] py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <Reveal>
            <SectionTitle>
              What if your society
              <br className="hidden sm:block" /> captured the rain?
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#9FB4C2]">
              Drag the slider to change how much of the rooftop area is connected to harvesting, and watch where the
              water goes.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-8 space-y-2 text-[13px] text-[#7F97A8]">
              <p>Demo society: Sushant Lok Phase 1, Gurugram.</p>
              <p>Assumes ~2,000 m² of rooftop, ~650 mm of rain a year and ₹31 per 1,000 L.</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={28}>
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0B1828] to-[#07111D] p-6 shadow-[0_50px_120px_-60px_rgba(45,212,191,0.4)] sm:p-8">
            {/* slider */}
            <div className="flex items-center justify-between">
              <label htmlFor="rwh-coverage" className="text-[11px] font-semibold tracking-[0.16em] text-[#8DA4B4]">
                RWH COVERAGE
              </label>
              <div className="flex gap-1">
                {[0, 30, 60, 100].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCov(v)}
                    className={`tnum rounded-md px-2 py-1 text-[12px] transition-colors ${focusRing} ${
                      cov === v ? "bg-teal-300/15 text-teal-100" : "text-[#7F97A8] hover:text-[#C9D8E1]"
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-12">
              <div
                className="tnum pointer-events-none absolute -top-9 -translate-x-1/2 rounded-md bg-[#5EEAD4] px-2 py-0.5 text-xs font-semibold text-[#04211D]"
                style={{ left: `calc(${cov}% + ${8 - cov * 0.16}px)` }}
              >
                {cov}%
              </div>
              <input
                id="rwh-coverage"
                type="range"
                min={0}
                max={100}
                step={5}
                value={cov}
                onChange={(e) => setCov(Number(e.target.value))}
                className="pravah-range"
                style={{ "--val": `${cov}%` }}
                aria-valuetext={`${cov} percent of rooftop area connected`}
              />
              <div className="tnum mt-3 flex justify-between text-xs text-[#6F8797]">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* current vs with */}
            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/[0.06]">
              <div className="bg-[#08131F] p-5">
                <Kicker className="text-[10px]">CURRENT</Kicker>
                <p className="tnum mt-3 text-[clamp(1.6rem,3.4vw,2.4rem)] font-semibold leading-none text-[#6F8797]">0 L</p>
                <p className="mt-1.5 text-[13px] text-[#6F8797]">captured</p>
                <p className="tnum mt-5 text-xl font-semibold text-[#6F8797]">₹0</p>
                <p className="mt-1 text-[13px] text-[#6F8797]">annual value</p>
              </div>
              <div className="relative bg-[#08131F] p-5">
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-teal-400/[0.08] to-transparent" />
                <div className="relative">
                  <Kicker className="text-[10px] text-teal-200">WITH PRAVAH</Kicker>
                  <p className="mt-3 text-[clamp(1.6rem,3.4vw,2.4rem)] font-semibold leading-none text-[#E8F3F6]">
                    <AnimatedNumber value={s.captured} duration={0.7} /> L
                  </p>
                  <p className="mt-1.5 text-[13px] text-[#9FB4C2]">potentially captured</p>
                  <p className="mt-5 text-xl font-semibold text-[#5EEAD4]">
                    ₹<AnimatedNumber value={s.value} duration={0.7} />
                  </p>
                  <p className="mt-1 text-[13px] text-[#9FB4C2]">estimated annual value</p>
                </div>
              </div>
            </div>

            {/* where the rain goes */}
            <div className="mt-8">
              <div className="flex justify-between text-[12px] text-[#8DA4B4]">
                <span>Rooftop rain captured</span>
                <span>Still running off</span>
              </div>
              <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-slate-400/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#7CC4FF] to-[#2DD4BF]"
                  animate={{ width: `${cov}%` }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </div>
            </div>

            {/* metrics */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Water Captured", icon: Droplets, node: <><AnimatedNumber value={s.captured} duration={0.7} /> L</> },
                { label: "Runoff Reduced", icon: TrendingDown, node: <>↓ <AnimatedNumber value={s.runoffCut} duration={0.7} />%</> },
                { label: "Estimated Value", icon: IndianRupee, node: <>₹<AnimatedNumber value={s.value} duration={0.7} /></> },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-[12px] text-[#8DA4B4]">
                      <Icon className="h-3.5 w-3.5 text-[#5EEAD4]" />
                      {m.label}
                    </div>
                    <p className="mt-2 text-lg font-semibold text-[#E8F3F6]">{m.node}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <DemoChip>Illustrative scenario, calculated in your browser</DemoChip>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

