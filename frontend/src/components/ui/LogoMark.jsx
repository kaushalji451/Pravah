import { useId } from "react";

export default function LogoMark({ size = 28 }) {
  const raw = useId();
  const id = `lg-${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-lg border border-teal-300/20 bg-teal-400/10"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.64} height={size * 0.64} fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="5" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7CC4FF" />
            <stop offset="1" stopColor="#34D399" />
          </linearGradient>
        </defs>
        <path
          d="M12 2.5C12 2.5 5 10.2 5 14.8A7 7 0 0 0 19 14.8C19 10.2 12 2.5 12 2.5Z"
          stroke={`url(#${id})`}
          strokeWidth="1.7"
        />
        <path d="M8 15.3c1.3-1 2.7-1 4 0s2.7 1 4 0" stroke="#5EEAD4" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

