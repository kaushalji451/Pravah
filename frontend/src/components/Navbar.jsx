import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import LogoMark from "./ui/LogoMark";
import { PrimaryButton, focusRing } from "./ui/Buttons";
import { EASE, NAV_LINKS } from "../lib/scenario";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAnalysisPage =
    location.pathname.startsWith("/analyse") ||
    location.pathname.startsWith("/analyze") ||
    location.pathname.startsWith("/analysis") ||
    location.pathname.startsWith("/dashboard");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  const renderNavLink = (l, isMobile = false) => {
    const isTargetInternal = l.href.startsWith("/");
    const isTargetHash = l.href.startsWith("#");
    const isActive = location.pathname === l.href;

    const baseClass = isMobile
      ? `border-b border-white/[0.05] py-3.5 text-[15px] transition-colors ${
          isActive ? "font-medium text-teal-soft" : "text-[#C9D8E1]"
        }`
      : `relative rounded text-sm transition-colors hover:text-[#E8F3F6] ${focusRing} ${
          isActive ? "font-medium text-teal-soft" : "text-[#A9BDCA]"
        }`;

    const onClick = isMobile ? () => setOpen(false) : undefined;

    if (isTargetInternal) {
      return (
        <Link key={l.href} to={l.href} onClick={onClick} className={baseClass}>
          {l.label}
        </Link>
      );
    }

    if (isTargetHash) {
      const href = isHome ? l.href : `/${l.href}`;
      return (
        <a key={l.href} href={href} onClick={onClick} className={baseClass}>
          {l.label}
        </a>
      );
    }

    return (
      <a key={l.href} href={l.href} onClick={onClick} className={baseClass}>
        {l.label}
      </a>
    );
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid ? "border-white/[0.06] bg-[#050B14]/80 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Main">
        <Link to="/" className={`flex items-center gap-2.5 rounded-md ${focusRing}`}>
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-[0.2em] text-[#E8F3F6]">PRAVAH</span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((l) => renderNavLink(l, false))}
        </div>

        <div className="flex items-center gap-2">
          {isAnalysisPage ? (
            <PrimaryButton to="/" size="sm" className="hidden sm:inline-flex">
              Back to Home
            </PrimaryButton>
          ) : (
            <PrimaryButton to="/analyse-society" size="sm" className="hidden sm:inline-flex">
              Analyse Society
            </PrimaryButton>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className={`grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] text-[#C9D8E1] md:hidden ${focusRing}`}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-white/[0.06] md:hidden"
          >
            <div className="flex flex-col px-5 pb-5 pt-2">
              {NAV_LINKS.map((l) => renderNavLink(l, true))}
              {isAnalysisPage ? (
                <PrimaryButton to="/" className="mt-5" onClick={() => setOpen(false)}>
                  Back to Home
                </PrimaryButton>
              ) : (
                <PrimaryButton to="/analyse-society" className="mt-5" onClick={() => setOpen(false)}>
                  Analyse Society
                </PrimaryButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
