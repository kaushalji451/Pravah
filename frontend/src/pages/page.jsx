import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Dashboard from '@/components/dashboard/Dashboard';
import DataSources from '@/components/DataSources';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

export default function Page() {
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const analysisRef = useRef(null);
  const ctrl = useRef(null);

  const load = useCallback(async (r) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setStatus('loading');
    setError(null);
    setDetails(null);
    try {
      const d = await api.details(r.id, c.signal);
      setDetails(d);
      setStatus('ready');
    } catch (e) {
      if (e?.name === 'AbortError') return;
      setError(e?.message || 'Failed to load details');
      setStatus('error');
    }
  }, []);

  const onSelect = (r) => {
    setSelected(r);
    load(r);
  };

  useEffect(() => {
    if (!selected) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    analysisRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [selected]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-hidden">
        <div aria-hidden="true" className="pravah-noise pointer-events-none fixed inset-0 z-[60] opacity-[0.035]" />
        <Navbar />
        <main>
          <Hero onSelect={onSelect} />

          <section id="analysis" ref={analysisRef} aria-label="Location analysis" className="mx-auto max-w-6xl scroll-mt-20 px-5 sm:px-8">
            {selected && status !== 'idle' ? (
              <Dashboard selected={selected} details={details} status={status} error={error} onRetry={() => load(selected)} />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
                <p className="text-lg text-ink/90">Search a sector or locality above to see its analysis.</p>
                <p className="mt-2 text-sm text-mist">You&apos;ll get survey records, rainfall, elevation, a risk assessment and a harvest estimate.</p>
              </div>
            )}
          </section>

          <DataSources />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
