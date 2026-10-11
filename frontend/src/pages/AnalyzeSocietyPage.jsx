import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import {
  Building2,
  Droplets,
  CloudRain,
  Mountain,
  Calculator,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import Navbar from "../components/Navbar";
import SearchBox from "../components/SearchBox";
import Dashboard from "../components/dashboard/Dashboard";
import DataSources from "../components/DataSources";
import CityOverview from "../components/city/CityOverview";
import Footer from "../components/Footer";
import { api } from "../lib/api";
import { focusRing } from "../components/ui/Buttons";

const POPULAR_LOCALITIES = [
  "Sushant Lok Phase 1",
  "Sector 57",
  "Sector 48",
  "DLF Phase 1",
  "Golf Course Road",
  "Sector 29",
];

export default function AnalyzeSocietyPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selected, setSelected] = useState(() => location.state?.selected || null);
  const [details, setDetails] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [isSearchingPopular, setIsSearchingPopular] = useState(null);

  const ctrl = useRef(null);

  const load = useCallback(async (r) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setStatus("loading");
    setError(null);
    setDetails(null);
    try {
      const d = await api.details(r.id, c.signal);
      setDetails(d);
      setStatus("ready");
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load society analysis");
      setStatus("error");
    }
  }, []);

  const loadById = useCallback(async (id) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setStatus("loading");
    setError(null);
    setDetails(null);
    try {
      const d = await api.details(id, c.signal);
      setDetails(d);
      setSelected({
        id: d.id,
        name: d.location?.name || "Selected Society",
        lat: d.location?.lat ?? 28.4595,
        lng: d.location?.lng ?? 77.0266,
        source: d.location?.source || { id: "unknown", name: "Location", type: "public" },
      });
      setStatus("ready");
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load society details for this location id");
      setStatus("error");
    }
  }, []);

  const onSelect = useCallback((r) => {
    setSelected(r);
    setSearchParams({ id: r.id });
    load(r);
  }, [load, setSearchParams]);

  // Load initial data on mount asynchronously
  useEffect(() => {
    let isMounted = true;
    const paramId = searchParams.get("id");
    const paramQ = searchParams.get("q");

    if (selected) {
      Promise.resolve().then(() => {
        if (isMounted) {
          load(selected);
          if (!paramId) {
            setSearchParams({ id: selected.id }, { replace: true });
          }
        }
      });
    } else if (paramId) {
      Promise.resolve().then(() => {
        if (isMounted) {
          loadById(paramId);
        }
      });
    } else if (paramQ) {
      api
        .search(paramQ)
        .then((res) => {
          if (isMounted && res?.results?.length) {
            onSelect(res.results[0]);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePopularClick = async (name) => {
    setIsSearchingPopular(name);
    try {
      const res = await api.search(name);
      if (res?.results?.length) {
        onSelect(res.results[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingPopular(null);
    }
  };

  const handleClearSelection = () => {
    ctrl.current?.abort();
    setSelected(null);
    setDetails(null);
    setStatus("idle");
    setError(null);
    setSearchParams({});
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="pravah relative min-h-screen overflow-x-hidden bg-[#050B14] text-[#E8F3F6] antialiased">
        <div aria-hidden="true" className="pravah-noise pointer-events-none fixed inset-0 z-[60] opacity-[0.035]" />
        
        {/* Ambient lighting effects */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pravah-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_75%_50%_at_50%_0%,black,transparent)]" />
          <div className="absolute -top-36 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-teal-400/[0.08] blur-[140px]" />
          <div className="absolute right-[-8%] top-96 h-[400px] w-[500px] rounded-full bg-sky-400/[0.06] blur-[130px]" />
        </div>

        <Navbar />

        <main className="relative z-10 pt-24 sm:pt-28 pb-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            {/* Top Navigation & Breadcrumbs */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2 text-sm text-[#8FA7B3]">
                <Link to="/" className="flex items-center gap-1.5 transition-colors hover:text-[#E8F3F6]">
                  <ArrowLeft className="h-4 w-4" />
                  Home
                </Link>
                <span>/</span>
                <span className="font-medium text-teal-soft">Analyse Society</span>
                {selected ? (
                  <>
                    <span>/</span>
                    <span className="max-w-[200px] truncate text-ink sm:max-w-xs">{selected.name}</span>
                  </>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/20 bg-teal-300/[0.06] px-3 py-1 text-[11px] font-semibold tracking-wider text-teal-200">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-teal-300/70" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-teal-300" />
                  </span>
                  GURUGRAM WATER AUDIT
                </span>
                {selected ? (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[#A9BDCA] transition-colors hover:border-white/20 hover:text-ink"
                  >
                    <RotateCcw className="h-3 w-3" />
                    New Search
                  </button>
                ) : null}
              </div>
            </div>

            {/* If NO society is selected yet: Dedicated Search & Discovery Hub */}
            {!selected && status === "idle" && (
              <div className="py-8 sm:py-12">
                <div className="mx-auto max-w-3xl text-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/[0.06] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-teal-200">
                    LIVE WATER INTELLIGENCE PLATFORM
                  </span>
                  <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#EEF7F9] sm:text-5xl sm:leading-tight">
                    Analyse Society Water & Flood Risk
                  </h1>
                  <p className="mx-auto mt-4 max-w-2xl text-base text-[#9FB4C2] sm:text-lg">
                    Inspect verified GMDA ground surveys, 10-year Open-Meteo rainfall history, SRTM terrain elevation profiles, and calculate custom rainwater-harvesting potentials.
                  </p>

                  <div className="mt-8 flex justify-center">
                    <SearchBox onSelect={onSelect} />
                  </div>

                  {/* Popular Society Quick Buttons */}
                  <div className="mt-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#7F97A8]">
                      Popular Gurugram Societies & Sectors
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {POPULAR_LOCALITIES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handlePopularClick(name)}
                          disabled={Boolean(isSearchingPopular)}
                          className={`rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-xs text-[#C9D8E1] transition-all hover:border-teal/50 hover:bg-white/[0.06] hover:text-ink ${focusRing} ${
                            isSearchingPopular === name ? "animate-pulse border-teal text-teal" : ""
                          }`}
                        >
                          {isSearchingPopular === name ? `Loading ${name}...` : name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* What Pravah Analyzes - 4 Feature Cards */}
                <div className="mt-16 sm:mt-20">
                  <div className="mb-6 text-center">
                    <h2 className="text-xl font-medium text-ink">What PRAVAH inspects for each society</h2>
                    <p className="mt-1 text-sm text-mist">
                      Multi-layer spatial analytics directly tailored for urban RWAs and residents
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                        <Droplets className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-ink">GMDA Flood Surveys</h3>
                      <p className="mt-2 text-xs leading-relaxed text-mist">
                        Official Gurugram Metropolitan Development Authority surveyed waterlogging spots, flood depth, and RWH structures.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                        <CloudRain className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-ink">10-Year Rain Trends</h3>
                      <p className="mt-2 text-xs leading-relaxed text-mist">
                        Open-Meteo ERA5 atmospheric reanalysis capturing annual monsoons, 7-day storm bursts, and rainfall intensity.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300">
                        <Mountain className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-ink">SRTM Elevation Profile</h3>
                      <p className="mt-2 text-xs leading-relaxed text-mist">
                        Ground elevation and surrounding radial terrain slope to identify natural sinkholes and stormwater runoff flows.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                        <Calculator className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-ink">RWH Rupee Calculator</h3>
                      <p className="mt-2 text-xs leading-relaxed text-mist">
                        Interactive financial model for rooftop catchment area, annual litres harvestable, and municipal tariff savings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* When a society IS selected: Full Analysis View */}
            {selected && (
              <div className="space-y-8">
                {/* Search Bar & Switcher Header */}
                <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0A1522]/70 p-4 sm:flex-row sm:items-center sm:justify-between backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-300/10 text-teal-300">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-mist">Currently Analyzing</p>
                      <h2 className="text-lg font-semibold text-ink">{selected.name}</h2>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto sm:min-w-[380px]">
                    <SearchBox onSelect={onSelect} />
                  </div>
                </div>

                {/* Dashboard Component */}
                <Dashboard
                  selected={selected}
                  details={details}
                  status={status}
                  error={error}
                  onRetry={() => load(selected)}
                />
              </div>
            )}

            {/* Gurugram-wide hotspot map (scale view) */}
            <div className="mt-16 border-t border-white/[0.06] pt-12">
              <CityOverview onAnalyse={onSelect} selected={selected ? { lat: selected.lat, lng: selected.lng } : null} />
            </div>

            {/* Data Sources and Methodology */}
            <div className="mt-16 border-t border-white/[0.06] pt-12">
              <DataSources />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
