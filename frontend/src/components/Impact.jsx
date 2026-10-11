import { Droplets, IndianRupee, TrendingDown } from "lucide-react";
import Reveal from "./ui/Reveal";
import Kicker from "./ui/Kicker";
import AnimatedNumber from "./ui/AnimatedNumber";
import DemoChip from "./ui/DemoChip";

const IMPACT = [
  {
    key: "WATER",
    icon: Droplets,
    value: 624,
    format: (v) => `${Math.round(v)}K L`,
    text: "Potential annual capture",
    bar: "from-[#7CC4FF] to-[#2DD4BF]",
  },
  {
    key: "RUNOFF",
    icon: TrendingDown,
    value: 28,
    format: (v) => `↓ ${Math.round(v)}%`,
    text: "Potential surface runoff",
    bar: "from-[#2DD4BF] to-[#34D399]",
  },
  {
    key: "VALUE",
    icon: IndianRupee,
    value: 19.4,
    format: (v) => `₹${v.toFixed(1)}K`,
    text: "Estimated annual value",
    bar: "from-[#34D399] to-[#A7F3D0]",
  },
];

export default function Impact() {
  return (
    <section id="impact" className="relative scroll-mt-16 overflow-hidden border-t border-white/[0.06] py-28 sm:py-40">
      <div aria-hidden="true" className="pravah-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <h2 className="max-w-5xl text-[clamp(2.8rem,7.2vw,6.2rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-[#EEF7F9]">
            Every litre has a destination.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <DemoChip />
            <span className="text-[13px] text-[#7F97A8]">Demo society at 60% rooftop harvesting coverage</span>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {IMPACT.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.key} delay={i * 0.1} y={28}>
                <div className="relative h-full overflow-hidden rounded-xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-transparent p-7">
                  <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${c.bar}`} />
                  <div className="flex items-center justify-between">
                    <Kicker>{c.key}</Kicker>
                    <Icon className="h-4 w-4 text-[#5EEAD4]" />
                  </div>
                  <p className="mt-10 text-[clamp(2.6rem,5vw,4rem)] font-semibold leading-none tracking-[-0.03em] text-[#EEF7F9]">
                    <AnimatedNumber value={c.value} format={c.format} duration={1.6} />
                  </p>
                  <p className="mt-3 text-[15px] text-[#93A9B8]">{c.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

