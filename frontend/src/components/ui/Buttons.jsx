import { ArrowDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B14]";

export function PrimaryButton({
  href = "/analyse-society",
  to,
  children = "Analyze Your Society",
  size = "md",
  className = "",
  onClick,
}) {
  const sizes = {
    sm: "h-9 px-4 text-[13px]",
    md: "h-12 px-6 text-[15px]",
    lg: "h-14 px-8 text-base",
  };
  const target = to || href;
  const isInternal = Boolean(target && !target.startsWith("http") && !target.startsWith("#"));
  const classes = `group inline-flex items-center justify-center gap-2 rounded-lg bg-[#5EEAD4] font-semibold text-[#03201B] shadow-[0_0_0_1px_rgba(94,234,212,0.45),0_14px_40px_-14px_rgba(45,212,191,0.7)] transition-colors hover:bg-[#86F2E1] ${focusRing} ${sizes[size]} ${className}`;

  if (isInternal) {
    return (
      <Link to={target} onClick={onClick} className={classes}>
        {children}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    );
  }

  return (
    <a href={target} onClick={onClick} className={classes}>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </a>
  );
}

export function GhostButton({
  href,
  to,
  children,
  icon: Icon = ArrowDown,
  className = "",
  onClick,
}) {
  const target = to || href;
  const isInternal = Boolean(target && !target.startsWith("http") && !target.startsWith("#"));
  const classes = `group inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.02] px-6 text-[15px] font-medium text-[#D5E3EA] transition-colors hover:border-white/20 hover:bg-white/[0.05] ${focusRing} ${className}`;

  if (isInternal) {
    return (
      <Link to={target} onClick={onClick} className={classes}>
        {children}
        <Icon className="h-4 w-4 text-[#8DA4B4] transition-transform duration-300 group-hover:translate-y-0.5" />
      </Link>
    );
  }

  return (
    <a href={target} onClick={onClick} className={classes}>
      {children}
      <Icon className="h-4 w-4 text-[#8DA4B4] transition-transform duration-300 group-hover:translate-y-0.5" />
    </a>
  );
}
