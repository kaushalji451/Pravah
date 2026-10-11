import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { CalcInputs, LocationDetails, SearchResult } from '@/lib/types';
import { computeScenario } from '@/lib/whatif';
import { SourceLine } from '../SourceTag';
import DemoBanner from '../DemoBanner';
import MapLegend from './MapLegend';
import RiskPanel from './RiskPanel';
import { ElevationTile, RainfallTile, RwhTile, WaterloggingTile } from './Tiles';
import RwhCalculator from './RwhCalculator';
import SurveyRecords from './SurveyRecords';
import RecommendationCard from './RecommendationCard';
import WhatIfSimulator from './WhatIfSimulator';
import ImpactSummary from './ImpactSummary';

const IMPACT_FALLBACK = { tankerLitres: 10000, heavyRainDayMm: 64.5 };

const MapView = lazy(() => import('./MapView'));

type Props = {
  selected: SearchResult;
  details: LocationDetails | null;
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  onRetry: () => void;
};

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl border border-white/5 bg-basin/60 ${className}`} />;
}

export default function Dashboard({ selected, details, status, error, onRetry }: Props) {
  const lat = details?.location.lat ?? selected.lat;
  const lng = details?.location.lng ?? selected.lng;
  const demo = details?.dataMode === 'demo';
  const radiusM = details?.waterlogging.radiusM ?? 1000;

  // Shared between the calculator, the What-If simulator and the impact cards.
  const [area, setArea] = useState('');
  const [calc, setCalc] = useState<CalcInputs>({ areaSqft: null, rainMm: null, coef: 0.8, pricePerKl: null });
  const [currentPct, setCurrentPct] = useState(0);
  const [targetPct, setTargetPct] = useState(100);
  const onInputsChange = useCallback((i: CalcInputs) => setCalc(i), []);
  const impact = details?.assumptions?.impact ?? IMPACT_FALLBACK;

  // New location → start the scenario fresh (roof area is per society).
  useEffect(() => {
    setArea('');
    setCurrentPct(0);
    setTargetPct(100);
  }, [details?.id]);

  const scenario = useMemo(() => {
    if (!calc.areaSqft || !calc.rainMm) return null;
    return computeScenario({
      areaSqft: calc.areaSqft,
      rainMm: calc.rainMm,
      coef: calc.coef,
      pricePerKl: calc.pricePerKl ?? details?.assumptions?.rwh.waterPricePerKl ?? 50,
      currentPct,
      targetPct,
      tankerLitres: impact.tankerLitres,
      heavyRainDayMm: impact.heavyRainDayMm,
    });
  }, [calc, currentPct, targetPct, impact, details?.assumptions]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{selected.name}</h2>
          <p className="tnum mt-1 text-sm text-mist">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        </div>
        <SourceLine source={selected.source} note="location coordinates" />
      </div>

      {demo ? <DemoBanner /> : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="relative h-[380px] overflow-hidden rounded-2xl border border-white/10 lg:col-span-7 lg:h-auto lg:min-h-[520px]">
          <Suspense fallback={<div className="h-full w-full animate-pulse bg-basin" />}>
            <MapView lat={lat} lng={lng} name={selected.name} records={details?.gmda.records ?? []} radiusM={radiusM} />
          </Suspense>
          <div className="pointer-events-none absolute bottom-3 left-3 z-[500]">
            <MapLegend radiusM={radiusM} demo={demo} />
          </div>
          {status === 'loading' ? (
            <div className="absolute right-3 top-3 z-[500] flex items-center gap-2 rounded-full border border-white/10 bg-abyss/85 px-3 py-1.5 text-xs text-ink/90 backdrop-blur">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-teal/30 border-t-teal" />
              Fetching survey, rainfall and elevation data
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-5">
          {status === 'ready' && details ? (
            <RiskPanel risk={details.risk} />
          ) : status === 'error' ? (
            <div className="flex h-full flex-col justify-center rounded-2xl border border-coral/30 bg-basin p-6">
              <p className="text-lg text-ink">Couldn&apos;t load data for this location.</p>
              <p className="mt-2 text-sm text-mist">{error}</p>
              <button type="button" onClick={onRetry} className="mt-5 w-fit rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-abyss hover:bg-teal-soft">
                Try again
              </button>
            </div>
          ) : (
            <Skeleton className="h-full min-h-[520px]" />
          )}
        </div>
      </div>

      {status === 'ready' && details ? (
        <>
          {details.recommendation ? <RecommendationCard rec={details.recommendation} /> : null}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <RainfallTile d={details.rainfall} />
            <WaterloggingTile d={details.waterlogging} />
            <RwhTile d={details.rainwaterHarvesting} />
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <ElevationTile d={details.elevation} />
            <RwhCalculator details={details} area={area} onAreaChange={setArea} onInputsChange={onInputsChange} />
          </div>
          <WhatIfSimulator
            inputs={calc}
            impact={impact}
            currentPct={currentPct}
            targetPct={targetPct}
            onCurrent={setCurrentPct}
            onTarget={setTargetPct}
            scenario={scenario}
            onUseExample={() => setArea('20000')}
          />
          {scenario ? <ImpactSummary scenario={scenario} targetPct={targetPct} /> : null}
          <SurveyRecords gmda={details.gmda} demo={demo} />
        </>
      ) : status === 'loading' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-56 md:col-span-2" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : null}
    </motion.div>
  );
}
