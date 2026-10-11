import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import HeroVisual from "./HeroVisual";
import SearchBox from "./SearchBox";
import { PrimaryButton, GhostButton } from "./ui/Buttons";
import { EASE, fadeUp } from "../lib/scenario";

export default function Hero({ onSelect }) {
  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-32 sm:pt-40 lg:pb-32">
      {/* backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pravah-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-teal-400/[0.08] blur-[120px]" />
        <div className="absolute right-[-10%] top-1/3 h-[420px] w-[520px] rounded-full bg-sky-400/[0.07] blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 rounded-full border border-teal-300/20 bg-teal-300/[0.06] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-teal-200"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-teal-300/70" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-teal-300" />
            </span>
            BUILT FOR WATER-RESILIENT CITIES
          </motion.div>

          <h1 className="mt-8 text-[clamp(3.1rem,7.4vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-[#EEF7F9]">
            {["Turn Rain", "Into Resilience."].map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className="block"
                  variants={{
                    hidden: { y: "110%" },
                    show: { y: "0%", transition: { duration: 1, ease: EASE } },
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p variants={fadeUp} className="mt-7 max-w-[33rem] text-[17px] leading-relaxed text-[#9FB4C2] sm:text-lg">
            PRAVAH helps urban communities understand waterlogging risk, discover rainwater potential, and make smarter
            water-management decisions.
          </motion.p>

          {onSelect ? (
            <motion.div variants={fadeUp} className="mt-8 space-y-4">
              <SearchBox onSelect={onSelect} />
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <PrimaryButton to="/analyse-society" size="sm">
                  Analyze Society Page
                </PrimaryButton>
                <GhostButton href="#how" className="h-9 px-4 text-[13px]">
                  See How It Works
                </GhostButton>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton to="/analyse-society" />
              <GhostButton href="#how">See How It Works</GhostButton>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-[13px] text-[#7F97A8]">
              <MapPin className="h-4 w-4 text-[#5EEAD4]" />
              Now analyzing housing societies in Gurugram
            </div>
            {onSelect && (
              <a
                href="#how"
                className="text-xs text-[#8DA4B4] underline decoration-white/20 underline-offset-4 hover:text-teal-200"
              >
                See how it works →
              </a>
            )}
          </motion.div>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  );
}
