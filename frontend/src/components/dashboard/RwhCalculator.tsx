import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useDebounced } from '@/lib/useDebounced';
import { fmt, fmtInr } from '@/lib/format';
import type { CalcInputs, LocationDetails, RwhResponse } from '@/lib/types';
import { SourceTag } from '../SourceTag';

const C_MIN = 0.5;
const C_MAX = 0.95;

function Field({ label, tag, children, hint }: { label: string; tag: React.ReactNode; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-ink">{label}</span>
        {tag}
      </div>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-mist">{hint}</p> : null}
    </div>
  );
}

const inputCls =
  'tnum h-11 w-full rounded-lg border border-white/10 bg-abyss/60 px-3 text-ink placeholder:text-mist/60 focus:border-teal/60 focus:outline-none';

type Props = {
  details: LocationDetails;
  /** Optional controlled rooftop area, so the What-If simulator can share it. */
  area?: string;
  onAreaChange?: (v: string) => void;
  /** Reports the inputs in use (after debounce) so other cards can reuse them. */
  onInputsChange?: (i: CalcInputs) => void;
};

export default function RwhCalculator({ details, area: areaProp, onAreaChange, onInputsChange }: Props) {
  const defaultRain = details.rainfall.annual.meanAnnualMm;
  const [areaLocal, setAreaLocal] = useState('');
  const area = areaProp ?? areaLocal;
  const setArea = onAreaChange ?? setAreaLocal;
  const [rain, setRain] = useState(defaultRain ? String(defaultRain) : '');
  const [rainEdited, setRainEdited] = useState(false);
  const [coef, setCoef] = useState(0.8);
  const [coefEdited, setCoefEdited] = useState(false);
  const [price, setPrice] = useState('50');
  const [priceEdited, setPriceEdited] = useState(false);
  const [res, setRes] = useState<RwhResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Reset when the location changes.
  useEffect(() => {
    setRain(defaultRain ? String(defaultRain) : '');
    setRainEdited(false);
  }, [details.id, defaultRain]);

  const params = useDebounced({ area, rain, rainEdited, coef, coefEdited, price, priceEdited }, 300);

  useEffect(() => {
    const ctrl = new AbortController();
    const n = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(/,/g, '')));
    setPending(true);
    api
      .rwh(
        details.id,
        {
          areaSqft: n(params.area),
          annualRainfallMm: params.rainEdited ? n(params.rain) : undefined,
          runoffCoefficient: params.coefEdited ? params.coef : undefined,
          pricePerKl: params.priceEdited ? n(params.price) : undefined,
        },
        ctrl.signal,
      )
      .then((r) => {
        setRes(r);
        setError(null);
        if (!params.priceEdited) setPrice(String(r.defaults.waterPricePerKl));
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => setPending(false));
    return () => ctrl.abort();
  }, [details.id, params]);

  // Share the inputs actually used with the What-If simulator.
  useEffect(() => {
    if (!onInputsChange) return;
    const n = (s: string) => {
      const v = Number(String(s).replace(/,/g, ''));
      return String(s).trim() !== '' && Number.isFinite(v) && v > 0 ? v : null;
    };
    onInputsChange({
      areaSqft: n(params.area),
      rainMm: n(params.rain),
      coef: params.coef,
      pricePerKl: n(params.price),
    });
  }, [params, onInputsChange]);

  const pct = ((coef - C_MIN) / (C_MAX - C_MIN)) * 100;
  const r = res?.result;

  return (
    <section id="rwh-calculator" aria-labelledby="rwh-heading" className="scroll-mt-28 rounded-2xl border border-white/10 bg-basin">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 p-6">
        <div>
          <h2 id="rwh-heading" className="text-xl font-semibold tracking-tight">
            Water-saving calculator
          </h2>
          <p className="mt-1 max-w-xl text-sm text-mist">
            How much rain could your roof catch in a year? Roof area isn&apos;t in any public dataset, so enter your own estimate.
          </p>
        </div>
        <SourceTag type="calculated" />
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6 p-6">
          <Field label="Rooftop area (sq ft)" tag={<SourceTag type="user" />} hint="Total catchment roof area across buildings, e.g. 20,000 sq ft.">
            <input
              inputMode="decimal"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. 20000"
              className={inputCls}
              aria-describedby="area-hint"
            />
          </Field>

          <Field
            label="Annual rainfall (mm)"
            tag={rainEdited ? <SourceTag type="user" /> : <SourceTag type="public" label={`Open-Meteo average${details.rainfall.annual.period ? `, ${details.rainfall.annual.period}` : ''}`} />}
            hint={!defaultRain ? 'Rainfall history is unavailable for this point. Enter a value to calculate.' : undefined}
          >
            <div className="flex gap-2">
              <input
                inputMode="decimal"
                value={rain}
                onChange={(e) => {
                  setRain(e.target.value);
                  setRainEdited(true);
                }}
                className={inputCls}
              />
              {rainEdited && defaultRain ? (
                <button
                  type="button"
                  onClick={() => {
                    setRain(String(defaultRain));
                    setRainEdited(false);
                  }}
                  className="shrink-0 rounded-lg border border-white/10 px-3 text-sm text-mist hover:text-ink"
                >
                  Reset
                </button>
              ) : null}
            </div>
          </Field>

          <Field
            label={`Runoff coefficient: ${coef.toFixed(2)}`}
            tag={coefEdited ? <SourceTag type="user" /> : <SourceTag type="assumption" />}
            hint="Share of roof rain that reaches storage. Hard roofs are typically 0.75 to 0.95."
          >
            <input
              type="range"
              min={C_MIN}
              max={C_MAX}
              step={0.05}
              value={coef}
              onChange={(e) => {
                setCoef(Number(e.target.value));
                setCoefEdited(true);
              }}
              className="pravah-range"
              style={{ ['--val' as string]: `${pct}%` }}
              aria-label="Runoff coefficient"
            />
          </Field>

          <Field
            label="Water value (₹ per 1,000 litres)"
            tag={priceEdited ? <SourceTag type="user" /> : <SourceTag type="assumption" label="Placeholder assumption" />}
            hint="Use what your society actually pays for tanker or utility water."
          >
            <input
              inputMode="decimal"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setPriceEdited(true);
              }}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="relative flex flex-col justify-between gap-6 border-t border-white/5 bg-gradient-to-br from-teal/[0.07] to-sky/[0.03] p-6 lg:border-l lg:border-t-0">
          <div aria-live="polite" className={pending ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
            {error ? (
              <p className="text-sm text-coral">{error}</p>
            ) : r ? (
              <AnimatePresence mode="wait">
                <motion.div key={`${r.litresPerYear}`} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                  <p className="text-sm text-mist">{r.label}</p>
                  <p className="tnum mt-1 text-4xl font-semibold tracking-tight text-teal-soft sm:text-5xl">
                    {fmt(r.litresPerYear)} <span className="text-xl font-medium text-ink/70">litres</span>
                  </p>
                  <p className="tnum mt-1 text-sm text-mist">{fmt(r.kilolitresPerYear, 1)} kilolitres a year</p>

                  <p className="mt-6 text-sm text-mist">{r.valueLabel}</p>
                  <p className="tnum mt-1 text-3xl font-semibold tracking-tight">
                    {fmtInr(r.valueInrPerYear)} <span className="text-base font-medium text-ink/70">/ year</span>
                  </p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <p className="text-lg text-ink/80">{res?.message ?? 'Enter your rooftop area to see an estimate.'}</p>
            )}
          </div>

          {res?.steps ? (
            <div className="rounded-lg border border-white/5 bg-abyss/40 p-4">
              <p className="text-xs font-medium text-ink/80">How this was calculated</p>
              <ol className="tnum mt-2 space-y-1 text-xs text-mist">
                {res.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-mist">
                An estimate of what could be captured, not a guaranteed saving. Real yield depends on storage size, first-flush losses and
                maintenance.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
