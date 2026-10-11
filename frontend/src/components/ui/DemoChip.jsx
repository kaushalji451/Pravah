import { Info } from "lucide-react";

export default function DemoChip({ children = "Illustrative scenario", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[12px] text-[#9FB4C2] ${className}`}
    >
      <Info className="h-3.5 w-3.5 text-[#7CC4FF]" />
      {children}
    </span>
  );
}

