import { useMemo } from "react";
import { motion } from "framer-motion";
import Reveal from "./ui/Reveal";
import { PrimaryButton } from "./ui/Buttons";

export default function FinalCta() {
  const drops = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i * 0.37) % 4}s`,
        duration: `${3.2 + ((i * 0.53) % 2.4)}s`,
        height: 40 + ((i * 17) % 50),
        opacity: 0.15 + ((i * 7) % 10) / 40,
      })),
    []
  );

  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] py-36 sm:py-48">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-[-30%] left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-teal-400/[0.12] blur-[140px]" />
        {drops.map((d, i) => (
          <span
            key={i}
            className="pravah-drop absolute top-0 w-px bg-gradient-to-b from-transparent to-[#7CC4FF]"
            style={{ left: d.left, height: d.height, opacity: d.opacity, animationDelay: d.delay, animationDuration: d.duration }}
          />
        ))}
        <div className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2">
          {[0, 1.3, 2.6].map((delay) => (
            <motion.span
              key={delay}
              className="absolute left-1/2 top-1/2 block h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-300/30"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 1.8], opacity: [0.5, 0] }}
              transition={{ duration: 3.9, delay, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="text-[clamp(3rem,8.4vw,7.4rem)] font-semibold leading-[0.94] tracking-[-0.048em] text-[#EEF7F9]">
            Know your water.
            <br />
            Shape your future.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-[#9FB4C2]">
            Start with one society.
            <br />
            Make every drop count.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <PrimaryButton size="lg" className="mt-11" />
        </Reveal>
      </div>
    </section>
  );
}

