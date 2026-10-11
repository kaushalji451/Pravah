import { CloudRain, IndianRupee, Sprout, Waves } from 'lucide-react';
import { fmt, fmtInr } from '@/lib/format';
import { lakh, type Scenario } from '@/lib/whatif';
import { SourceTag } from '../SourceTag';

function Item({
  icon,
  tint,
  title,
  value,
  unit,
  note,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  value: string;
  unit?: string;
  note: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#0A1522]/60 p-5">
      <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${tint}1f`, color: tint }}>
        {icon}
      </span>
      <p className="mt-4 text-sm text-[#8FA7B3]">{title}</p>
      <p className="tnum mt-1 text-3xl font-semibold tracking-tight">
        {value}
        {unit ? <span className="ml-1 text-base font-medium text-[#E8F3F6]/70">{unit}</span> : null}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[#8FA7B3]">{note}</p>
    </div>
  );
}

export default function ImpactSummary({ scenario, targetPct }: { scenario: Scenario; targetPct: number }) {
  return (
    <section aria-labelledby="impact-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="impact-heading" className="text-xl font-semibold tracking-tight">
            Environmental impact at {targetPct}% connected
          </h2>
          <p className="mt-1 text-sm text-[#8FA7B3]">Yearly figures from the What-If scenario above.</p>
        </div>
        <SourceTag type="calculated" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Item
          icon={<CloudRain className="h-5 w-5" />}
          tint="#7CC4FF"
          title="Water captured"
          value={lakh(scenario.after.captured)}
          unit="L / yr"
          note={`${fmt(scenario.after.captured / 1000, 1)} kL of roof rain kept for use or recharge.`}
        />
        <Item
          icon={<Waves className="h-5 w-5" />}
          tint="#2DD4BF"
          title="Roof runoff kept out of drains"
          value={`${targetPct}%`}
          note={`${lakh(scenario.after.captured)} L a year that would otherwise flow to storm drains and streets.`}
        />
        <Item
          icon={<Sprout className="h-5 w-5" />}
          tint="#86EFAC"
          title="Groundwater recharge potential"
          value={lakh(scenario.after.captured)}
          unit="L / yr"
          note="Upper bound if captured water goes to recharge pits. Actual recharge depends on soil and pit design."
        />
        <Item
          icon={<IndianRupee className="h-5 w-5" />}
          tint="#F5B454"
          title="Estimated value"
          value={fmtInr(scenario.after.valueInr)}
          unit="/ yr"
          note={`About ${fmt(scenario.tankersAfter)} tanker loads, at the water value set in the calculator.`}
        />
      </div>
    </section>
  );
}
