export default function SectionTitle({ children, className = "" }) {
  return (
    <h2
      className={`text-[clamp(2.25rem,4.8vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.032em] text-[#E8F3F6] ${className}`}
    >
      {children}
    </h2>
  );
}

