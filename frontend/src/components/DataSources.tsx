import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SourceRef } from '@/lib/types';
import { PROVENANCE_MEANING, PROVENANCE_ORDER, SourceTag } from './SourceTag';

// Shown if the backend can't be reached; descriptions only, no data values.
const FALLBACK: SourceRef[] = [
  { id: 'gmda', name: 'GMDA Flood Survey', type: 'official', publisher: 'Gurugram Metropolitan Development Authority (OneMap Gurugram)', provides: 'Surveyed waterlogging and rainwater-harvesting records' },
  { id: 'open-meteo', name: 'Open-Meteo', type: 'public', publisher: 'Open-Meteo (ERA5 reanalysis and weather models)', provides: 'Recent daily rainfall and 10-year rainfall history' },
  { id: 'open-elevation', name: 'Open-Elevation', type: 'public', publisher: 'Open-Elevation (SRTM-derived terrain model)', provides: 'Ground elevation at the location and around it' },
  { id: 'nominatim', name: 'OpenStreetMap Nominatim', type: 'public', publisher: '© OpenStreetMap contributors (ODbL)', provides: 'Coordinates for localities not named in the GMDA survey' },
  { id: 'pravah', name: 'Pravah calculation', type: 'calculated', publisher: 'Pravah', provides: 'Indicative risk score, harvest potential and value estimates' },
];

export default function DataSources() {
  const [sources, setSources] = useState<SourceRef[]>(FALLBACK);

  useEffect(() => {
    api
      .sources()
      .then((r) => setSources(r.sources))
      .catch(() => undefined);
  }, []);

  return (
    <section id="sources" aria-labelledby="sources-heading" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
      <h2 id="sources-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Where does Pravah get its data?
      </h2>
      <p className="mt-3 max-w-2xl text-mist">
        Every value on the dashboard carries a label saying whether it is official, from a public dataset, or worked out by Pravah. Missing
        data is shown as missing, never filled in.
      </p>

      <ul className="mt-10 divide-y divide-white/5 border-y border-white/5">
        {sources.map((s) => (
          <li key={s.id} className="grid gap-3 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] md:items-start md:gap-8">
            <div>
              <p className="text-lg font-medium">{s.name}</p>
              {s.publisher ? <p className="mt-0.5 text-sm text-mist">{s.publisher}</p> : null}
            </div>
            <div className="text-sm">
              {s.provides ? <p className="text-ink/90">{s.provides}</p> : null}
              {s.caveat ? <p className="mt-1 text-mist">{s.caveat}</p> : null}
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="mt-2 inline-block break-all text-xs text-sky underline decoration-sky/30 underline-offset-2">
                  {s.url}
                </a>
              ) : null}
            </div>
            <div>
              <SourceTag type={s.type} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12">
        <h3 className="text-lg font-medium">Reading the labels</h3>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {PROVENANCE_ORDER.map((t) => (
            <div key={t} className="flex flex-col gap-1.5">
              <dt>
                <SourceTag type={t} />
              </dt>
              <dd className="text-sm text-mist">{PROVENANCE_MEANING[t]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 max-w-2xl text-sm text-mist">
          Rainfall comes from Open-Meteo rather than IMD because IMD&apos;s APIs are granted on request with IP whitelisting. The rainfall
          service is isolated in the backend so an IMD or India-WRIS feed can replace it without touching the interface.
        </p>
      </div>
    </section>
  );
}
