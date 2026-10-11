import type { LocationDetails } from '@/lib/types';
import { fmtDate } from '@/lib/format';
import { SourceTag } from '../SourceTag';

const ROLE_LABEL: Record<string, string> = {
  locality: 'Locality',
  waterlogging: 'Waterlogging',
  waterloggingDepth: 'Water depth',
  rwhStatus: 'RWH status',
  rwhCondition: 'RWH condition',
  surveyDate: 'Survey date',
};

const show = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v));

export default function SurveyRecords({ gmda, demo }: { gmda: LocationDetails['gmda']; demo: boolean }) {
  if (!gmda.available) {
    return (
      <section className="rounded-2xl border border-dashed border-white/10 p-6 text-sm">
        <h2 className="text-lg font-semibold">Survey records</h2>
        <p className="mt-2 text-mist">The GMDA survey service did not respond: {gmda.error}</p>
      </section>
    );
  }

  const rows = gmda.records.slice(0, 40);
  return (
    <section aria-labelledby="records-heading" className="rounded-2xl border border-white/10 bg-basin/60">
      <div className="flex flex-wrap items-start justify-between gap-3 p-6">
        <div>
          <h2 id="records-heading" className="text-xl font-semibold tracking-tight">
            Survey records near this location
          </h2>
          <p className="mt-1 text-sm text-mist">
            {gmda.records.length} record{gmda.records.length === 1 ? '' : 's'}, nearest first. Values are shown exactly as the survey
            records them.
          </p>
        </div>
        <SourceTag type={demo ? 'demo' : 'official'} />
      </div>

      {gmda.roles ? (
        <details className="mx-6 mb-4 rounded-lg border border-white/5 bg-abyss/40 p-3 text-xs text-mist">
          <summary className="cursor-pointer text-ink/80">Which survey fields Pravah reads</summary>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {Object.entries(gmda.roles).map(([role, r]) => (
              <li key={role}>
                <span className="text-ink/80">{ROLE_LABEL[role] ?? role}:</span>{' '}
                {r.field ? `${r.label} (${r.field})` : 'not provided by this layer'}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-mist">
          No survey records within the search area. This does not mean the area never waterlogs.
        </p>
      ) : (
        <div className="overflow-x-auto px-2 pb-4">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-mist">
              <tr className="border-b border-white/5">
                <th className="px-4 py-2 font-normal">Distance</th>
                <th className="px-4 py-2 font-normal">Locality</th>
                <th className="px-4 py-2 font-normal">Waterlogging</th>
                <th className="px-4 py-2 font-normal">Rainwater harvesting</th>
                <th className="px-4 py-2 font-normal">Surveyed</th>
                <th className="px-4 py-2 font-normal">
                  <span className="sr-only">All fields</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.objectId ?? i}`} className="border-b border-white/[0.04] align-top">
                  <td className="tnum px-4 py-2.5 text-mist">{r.distanceM} m</td>
                  <td className="px-4 py-2.5">{show(r.locality)}</td>
                  <td className="px-4 py-2.5">
                    <span className={r.waterlogging.interpretation === 'reported' ? 'text-amber' : ''}>{show(r.waterlogging.value)}</span>
                    {r.waterlogging.depth !== null ? <span className="text-mist"> ({show(r.waterlogging.depth)})</span> : null}
                  </td>
                  <td className="px-4 py-2.5">{[r.rwh.status, r.rwh.condition].filter((v) => v !== null).map(show).join(' / ') || '—'}</td>
                  <td className="px-4 py-2.5 text-mist">{r.surveyDate ? fmtDate(r.surveyDate) : '—'}</td>
                  <td className="px-4 py-2.5">
                    <details>
                      <summary className="cursor-pointer text-xs text-sky">All fields</summary>
                      <dl className="mt-2 space-y-1 text-xs">
                        {r.attributes.map((a) => (
                          <div key={a.field} className="flex gap-2">
                            <dt className="text-mist">{a.label}:</dt>
                            <dd className="break-words">{String(a.value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {gmda.records.length > rows.length ? (
            <p className="px-4 pt-3 text-xs text-mist">Showing the nearest {rows.length}. All records are plotted on the map.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
