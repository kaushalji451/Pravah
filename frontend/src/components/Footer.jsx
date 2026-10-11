import { Link } from "react-router-dom";
import LogoMark from "./ui/LogoMark";
import { focusRing } from "./ui/Buttons";
import { NAV_LINKS } from "../lib/scenario";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <LogoMark size={26} />
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#E8F3F6]">PRAVAH</p>
            <p className="text-[12px] text-[#7F97A8]">Urban Water Intelligence</p>
          </div>
        </Link>
        <div className="flex flex-wrap gap-6 text-sm text-[#8DA4B4]">
          {NAV_LINKS.map((l) => {
            const isInternal = l.href.startsWith("/");
            return isInternal ? (
              <Link key={l.href} to={l.href} className={`rounded hover:text-[#E8F3F6] ${focusRing}`}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className={`rounded hover:text-[#E8F3F6] ${focusRing}`}>
                {l.label}
              </a>
            );
          })}
        </div>
        <p className="max-w-xs text-[12px] leading-relaxed text-[#6F8797]">
          An environmental hackathon project. Figures on this page are illustrative demo data.
        </p>
      </div>
    </footer>
  );
}
