import { motion } from "framer-motion";
import { CloudRain, Droplets, IndianRupee, Waves } from "lucide-react";
import AnimatedNumber from "./ui/AnimatedNumber";

const VALUES = [
  { n: 1, title: "Rainfall Intelligence", text: "Seasonal totals and short, intense bursts for your location.", icon: CloudRain },
  { n: 2, title: "Waterlogging Risk", text: "Terrain, drainage and past incidents, scored from 0 to 100.", icon: Waves },
  { n: 3, title: "RWH Potential", text: "How much water your rooftops could capture every year.", icon: Droplets },
  { n: 4, title: "Impact Estimation", text: "Water saved, runoff reduced and its value in rupees.", icon: IndianRupee },
];

export default function ValueStrip() {
  return (
    <section aria-label="What PRAVAH measures" className="relative border-y border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: i * 0.08 }}
                className="bg-[#050B14] px-1 py-9 sm:px-6"
              >
                <div className="flex items-center justify-between">
                  <AnimatedNumber
                    value={v.n}
                    duration={0.8}
                    format={(x) => String(Math.max(1, Math.round(x))).padStart(2, "0")}
                    className="text-sm text-[#5EEAD4]"
                  />
                  <Icon className="h-4 w-4 text-[#6F8797]" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-[#E8F3F6]">{v.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#8DA4B4]">{v.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

