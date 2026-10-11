export default function Kicker({ children, className = "" }) {
  return <p className={`text-[11px] font-semibold tracking-[0.16em] text-[#8DA4B4] ${className}`}>{children}</p>;
}

