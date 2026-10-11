import { lazy, Suspense, useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { fmt } from '@/lib/format';
import type { CityOverview as Overview, OverviewCell, SearchResult } from '@/lib/types';
import { SourceTag } from '../SourceTag';
import { LEVEL_STYLE } from './CityMap';

const CityMap = lazy(() => import('./CityMap'));

type Props = {
  onAnalyse: (r: SearchResult) => void;
  selected?: { lat: number; lng: number } | null;
};

export default function CityOverview({ onAnalyse, selected }: Props) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    api
      .overview(ctrl.signal)
      .then(setData)
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(e?.message || 'Could not load the Gurugram overview.');
      });
    return () => ctrl.abort();
  }, []);

  const analyse = (c: OverviewCell) => {
    const source = data?.sources[0] ?? { id: 'gmda', name: 'GMDA Flood Survey', type: 'official' as const };
    onAnalyse({ id: c.id, name: c.name, lat: c.lat, lng: c.lng, source });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const demo = data?.dataMode === 'demo';

  return (
    <section aria-labelledby="city-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="city-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Gurugram-wide waterlogging hotspots
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#8FA7B3]">
            Every GMDA survey point in the city, grouped into roughly 1 km cells. Click a cell, or a hotspot in the list, to analyse that area.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SourceTag type={demo ? 'demo' : 'official'} label={demo ? undefined : 'GMDA survey points'} />
          <SourceTag type="calculated" label="Pravah grouping" />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm">
          <p className="text-[#E8F3F6]">City overview unavailable</p>
          <p className="mt-1 text-xs text-[#8FA7B3]">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ['Survey points', data?.totals.points],
              ['Waterlogging points', data?.totals.reported],
              ['High-hotspot cells', data?.totals.cellsHigh],
              ['RWH needing repair', data?.totals.rwhNeedsWork],
            ].map(([label, v]) => (
              <div key={String(label)} className="rounded-xl border border-white/[0.07] bg-[#0A1522]/60 px-4 py-3">
                <p className="tnum text-2xl font-semibold">{data ? fmt(v as number) : '…'}</p>
                <p className="text-xs text-[#8FA7B3]">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-white/10 lg:col-span-8 lg:h-[520px]">
              {data ? (
                <Suspense fallback={<div className="h-full w-full animate-pulse bg-[#0A1522]" />}>
                  <CityMap cells={data.cells} onAnalyse={analyse} selected={selected} />
                </Suspense>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#0A1522] text-sm text-[#8FA7B3]">
                  <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-[#2DD4BF]/30 border-t-[#2DD4BF]" />
                  Loading every GMDA survey point
                </div>
              )}
              <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg border border-white/10 bg-[#050B14]/95 px-3 py-2.5 text-xs text-[#E8F3F6]/90">
                <ul className="space-y-1.5">
                  {(Object.keys(LEVEL_STYLE) as OverviewCell['level'][]).map((k) => (
                    <li key={k} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_STYLE[k].color }} />
                      {LEVEL_STYLE[k].label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0A1522] p-5 lg:col-span-4">
              <h3 className="text-sm font-medium text-[#E8F3F6]">Top hotspots</h3>
              <p className="mt-0.5 text-xs text-[#8FA7B3]">Cells with the most GMDA waterlogging points.</p>
              <ol className="mt-4 space-y-2">
                {(data?.hotspots ?? []).map((c, i) => (
                  <li key={c.key}>
                    <button
                      type="button"
                      onClick={() => analyse(c)}
                      className="group flex w-full items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2.5 text-left transition-colors hover:border-[#2DD4BF]/40 hover:bg-white/[0.03]"
                    >
                      <span className="tnum w-4 text-xs text-[#8FA7B3]">{i + 1}</span>
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: LEVEL_STYLE[c.level].color }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-[#E8F3F6]">{c.name}</span>
                        <span className="tnum block text-xs text-[#8FA7B3]">
                          {c.reported} waterlogging · {c.points} points
                        </span>
                      </span>
                      <MapPin className="h-4 w-4 text-[#8FA7B3] group-hover:text-[#5EEAD4]" aria-hidden="true" />
                    </button>
                  </li>
                ))}
                {data && data.hotspots.length === 0 ? <li className="text-sm text-[#8FA7B3]">No waterlogging points found in the layer.</li> : null}
              </ol>
            </div>
          </div>

          {data ? (
            <p className="text-xs leading-relaxed text-[#8FA7B3]">
              {data.method} {data.caveat}
              {data.truncated ? ' The GMDA layer returned more points than Pravah fetched, so some may be missing.' : ''}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
