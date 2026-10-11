import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BarChart3, Calculator, Layers, ListChecks, MapPin } from "lucide-react";
import Reveal from "./ui/Reveal";
import SectionTitle from "./ui/SectionTitle";

const STEPS = [
  { n: "01", title: "LOCATE", text: "Find your society", icon: MapPin },
  { n: "02", title: "ASSESS", text: "Rainfall + terrain + historical waterlogging", icon: Layers },
  { n: "03", title: "CALCULATE", text: "Rainwater harvesting potential", icon: Calculator },
  { n: "04", title: "RECOMMEND", text: "Install / Maintain / Upgrade", icon: ListChecks },
  { n: "05", title: "MEASURE", text: "Water + financial impact", icon: BarChart3 },
];

function Step({ step, index, progress }) {
  const at = index / (STEPS.length - 1);
  const on = useTransform(progress, [at - 0.1, at], [0, 1]);
  const borderColor = useTransform(on, [0, 1], ["rgba(148,197,214,0.16)", "rgba(94,234,212,0.75)"]);
  const boxShadow = useTransform(on, [0, 1], ["0 0 0px 0px rgba(45,212,191,0)", "0 0 32px 2px rgba(45,212,191,0.35)"]);
  const textOpacity = useTransform(on, [0, 1], [0.45, 1]);
  const Icon = step.icon;

  return (
    <li className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center">
      <motion.div
        className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-xl border bg-[#07111E]"
        style={{ borderColor, boxShadow }}
      >
        <Icon className="h-5 w-5 text-[#5EEAD4]" />
      </motion.div>
      <motion.div style={{ opacity: textOpacity }} className="pt-1 lg:pt-7">
        <p className="tnum text-xs text-[#5EEAD4]">{step.n}</p>
        <h3 className="mt-1.5 text-sm font-semibold tracking-[0.18em] text-[#E8F3F6]">{step.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-[#93A9B8] lg:mx-auto lg:max-w-[12.5rem]">{step.text}</p>
      </motion.div>
    </li>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const clipX = useTransform(scrollYProgress, (v) => `inset(0 ${100 - Math.min(1, Math.max(0, v)) * 100}% 0 0)`);
  const clipY = useTransform(scrollYProgress, (v) => `inset(0 0 ${100 - Math.min(1, Math.max(0, v)) * 100}% 0)`);

  return (
    <section id="how" className="relative scroll-mt-16 border-t border-white/[0.06] py-28 sm:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-teal-400/[0.04] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <Reveal>
            <SectionTitle>
              From rainfall data
              <br />
              to practical action.
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-[17px] leading-relaxed text-[#9FB4C2] lg:ml-auto">
              Five steps turn public rainfall, terrain and incident data into a decision your society's committee can act
              on.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="relative mt-20">
          {/* horizontal water line (desktop) */}
          <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-[23px] hidden h-[2px] lg:block">
            <div className="absolute inset-0 rounded-full bg-white/[0.07]" />
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-full bg-gradient-to-r from-[#7CC4FF] via-[#2DD4BF] to-[#34D399]"
              style={{ clipPath: clipX }}
            >
              <div className="pravah-flow-x absolute inset-0 opacity-60" />
            </motion.div>
          </div>
          {/* vertical water line (mobile) */}
          <div aria-hidden="true" className="absolute bottom-10 left-[23px] top-6 w-[2px] lg:hidden">
            <div className="absolute inset-0 rounded-full bg-white/[0.07]" />
            <motion.div
              className="absolute inset-0 overflow-hidden rounded-full bg-gradient-to-b from-[#7CC4FF] via-[#2DD4BF] to-[#34D399]"
              style={{ clipPath: clipY }}
            >
              <div className="pravah-flow-y absolute inset-0 opacity-60" />
            </motion.div>
          </div>

          <ol className="relative grid gap-12 lg:grid-cols-5 lg:gap-6">
            {STEPS.map((s, i) => (
              <Step key={s.n} step={s} index={i} progress={scrollYProgress} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

