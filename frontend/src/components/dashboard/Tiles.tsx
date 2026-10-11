import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { LocationDetails } from '@/lib/types';
import { fmt, fmtDate, fmtShortDate } from '@/lib/format';
import { SourceLine } from '../SourceTag';

function Tile({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col rounded-2xl border border-white/[0.08] bg-basin/60 p-5 ${className}`}>
      <h3 className="text-sm text-mist">{title}</h3>
      {children}
    </section>
  );
}

function Unavailable({ what, error }: { what: string; error?: string }) {
  return (
    <div className="mt-3 rounded-lg border border-dashed border-white/10 p-3 text-sm">
      <p className="text-ink">{what} unavailable</p>
      {error ? <p className="mt-1 break-words text-xs text-mist">{error}</p> : null}
      <p className="mt-1 text-xs text-mist">Risk calculation continues with available data.</p>
    </div>
  );
}

export function RainfallTile({ d }: { d: LocationDetails['rainfall'] }) {
  const chart = d.series.map((s) => ({ date: s.date, mm: s.mm ?? 0, missing: s.mm === null }));
  return (
    <Tile title="Rainfall" className="md:col-span-2">
      {d.available ? (
        <>
          <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2">
            <p className="tnum">
              <span className="text-4xl font-semibold tracking-tight">{fmt(d.dailyMm, 1)}</span>
              <span className="ml-1 text-mist">mm</span>
              <span className="block text-xs text-mist">on {fmtDate(d.dailyDate)}</span>
            </p>
            <p className="tnum text-sm">
              <span className="text-ink">{fmt(d.sevenDayTotalMm, 1)} mm</span>
              <span className="block text-xs text-mist">last 7 days</span>
            </p>
            <p className="tnum text-sm">
              <span className="text-ink">{fmt(d.thirtyDayTotalMm, 1)} mm</span>
              <span className="block text-xs text-mist">last 30 days</span>
            </p>
            <p className="tnum text-sm">
              <span className="text-ink">{d.annual.available ? `${fmt(d.annual.meanAnnualMm)} mm` : 'n/a'}</span>
              <span className="block text-xs text-mist">yearly average{d.annual.period ? `, ${d.annual.period}` : ''}</span>
            </p>
          </div>
          <div className="mt-4 h-28" aria-label="Daily rainfall over the last 30 days" role="img">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="date" tickFormatter={fmtShortDate} tick={{ fill: '#8FA7B3', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
                <Tooltip
                  cursor={{ fill: 'rgba(124,196,255,0.08)' }}
                  contentStyle={{ background: '#0A1522', border: '1px solid rgba(148,197,214,0.2)', borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(l) => fmtDate(String(l))}
                  formatter={(v: number) => [`${v} mm`, 'Rainfall']}
                />
                <Bar dataKey="mm" fill="#7CC4FF" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <Unavailable what="Rainfall" error={d.error} />
      )}
      <div className="mt-auto pt-4">
        <SourceLine source={d.source} note="gridded estimate, not a rain gauge" />
      </div>
    </Tile>
  );
}

export function ElevationTile({ d }: { d: LocationDetails['elevation'] }) {
  const rel = d.relativeM;
  return (
    <Tile title="Elevation">
      {d.available ? (
        <>
          <p className="tnum mt-2">
            <span className="text-4xl font-semibold tracking-tight">{fmt(d.meters)}</span>
            <span className="ml-1 text-mist">m</span>
          </p>
          {rel !== null ? (
            <p className="mt-2 text-sm text-ink/90">
              {Math.abs(rel) < 0.5
                ? `About level with the area within ${d.ringRadiusM} m`
                : `${fmt(Math.abs(rel), 1)} m ${rel < 0 ? 'lower' : 'higher'} than the area within ${d.ringRadiusM} m`}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-mist">Elevation alone does not predict flooding. Pravah uses it as one supporting factor.</p>
        </>
      ) : (
        <Unavailable what="Elevation" error={d.error} />
      )}
      <div className="mt-auto pt-4">
        <SourceLine source={d.source} />
      </div>
    </Tile>
  );
}

export function WaterloggingTile({ d }: { d: LocationDetails['waterlogging'] }) {
  const radiusKm = d.radiusM / 1000;
  return (
    <Tile title="Waterlogging survey">
      {d.available ? (
        <>
          <p className="tnum mt-2">
            <span className="text-4xl font-semibold tracking-tight">{fmt(d.surveyCount)}</span>
            <span className="ml-2 text-mist">surveyed location{d.surveyCount === 1 ? '' : 's'} within {radiusKm} km</span>
          </p>
          <p className="mt-2 text-sm text-ink/90">
            <span className="text-amber">{fmt(d.reportedCount)}</span> report waterlogging, {fmt(d.notReportedCount)} do not
            {d.unknownCount ? `, ${d.unknownCount} unrecorded` : ''}.
          </p>
          {d.fieldLabel ? <p className="mt-1 text-xs text-mist">Read from the GMDA field “{d.fieldLabel}”.</p> : null}
          {d.truncated ? <p className="mt-1 text-xs text-amber">GMDA capped this query; more records may exist.</p> : null}
        </>
      ) : (
        <Unavailable what="Waterlogging survey" error={d.error} />
      )}
      <div className="mt-auto pt-4">
        <SourceLine source={d.source} />
      </div>
    </Tile>
  );
}

export function RwhTile({ d }: { d: LocationDetails['rainwaterHarvesting'] }) {
  const c = d.counts;
  return (
    <Tile title="Rainwater harvesting">
      {d.available ? (
        <>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-teal-soft">{d.statusLabel ?? 'Not available'}</p>
          {c ? (
            <p className="tnum mt-2 text-sm text-ink/90">
              {c.functional} functional, {c.nonFunctional} non-functional, {c.absent} without a structure
              {c.notRecorded ? `, ${c.notRecorded} not recorded` : ''}.
            </p>
          ) : null}
          {d.fields.length ? (
            <p className="mt-1 text-xs text-mist">Read from the GMDA field{d.fields.length > 1 ? 's' : ''} {d.fields.map((f) => `“${f.label}”`).join(' and ')}.</p>
          ) : null}
        </>
      ) : (
        <Unavailable what="Rainwater-harvesting survey data" error={d.error} />
      )}
      <div className="mt-auto pt-4">
        <SourceLine source={d.source} />
      </div>
    </Tile>
  );
}
