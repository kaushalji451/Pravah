/*
  PRAVAH — Urban Water Intelligence
  Landing Page
*/

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ValueStrip from "../components/ValueStrip";
import Problem from "../components/Problem";
import HowItWorks from "../components/HowItWorks";
import ProductPreview from "../components/ProductPreview";
import WhatIf from "../components/WhatIf";
import Impact from "../components/Impact";
import Gurugram from "../components/Gurugram";
import FinalCta from "../components/FinalCta";
import Footer from "../components/Footer";
import DataSources from "../components/DataSources";

export default function LandingPage() {
  const navigate = useNavigate();

  const onSelect = (r) => {
    navigate("/analyse-society", { state: { selected: r } });
  };

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="pravah relative min-h-screen overflow-x-hidden bg-[#050B14] text-[#E8F3F6] antialiased">
        <div aria-hidden="true" className="pravah-noise pointer-events-none fixed inset-0 z-[60] opacity-[0.035]" />
        <Navbar />
        <main>
          <Hero onSelect={onSelect} />
          <ValueStrip />
          <Problem />
          <HowItWorks />
          <ProductPreview />
          <WhatIf />
          <Impact />
          <Gurugram />
          <DataSources />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}