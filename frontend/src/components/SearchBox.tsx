import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useDebounced } from '@/lib/useDebounced';
import type { SearchResult } from '@/lib/types';

const EXAMPLES = ['Sushant Lok', 'Sector 48', 'Sector 57', 'DLF Phase 1', 'Golf Course Road'];

type State = 'idle' | 'loading' | 'done' | 'error';

export default function SearchBox({ onSelect }: { onSelect: (r: SearchResult) => void }) {
  const [q, setQ] = useState('');
  const debounced = useDebounced(q, 350);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const ctrl = useRef<AbortController | null>(null);
  const lastChosen = useRef<string | null>(null);
  const listId = useId();

  const run = useCallback(async (text: string) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setState('loading');
    setMessage(null);
    try {
      const r = await api.search(text, c.signal);
      setResults(r.results);
      setActive(r.results.length ? 0 : -1);
      setState('done');
      setOpen(true);
      if (!r.results.length) {
        setMessage(
          r.warnings.length
            ? 'Search services are not responding. Try again in a minute.'
            : `No Gurugram locality matches “${text}”. Try a sector number, like “Sector 57”.`,
        );
      }
      return r.results;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return null;
      setState('error');
      setMessage((e as Error).message);
      setOpen(true);
      return null;
    }
  }, []);

  useEffect(() => {
    const text = debounced.trim();
    if (lastChosen.current !== null && text === lastChosen.current) return;
    lastChosen.current = null;
    if (text.length < 2) {
      setResults([]);
      setOpen(false);
      setState('idle');
      return;
    }
    run(text);
  }, [debounced, run]);

  const choose = (r: SearchResult) => {
    lastChosen.current = r.name;
    setQ(r.name);
    setOpen(false);
    onSelect(r);
  };

  const tryExample = async (ex: string) => {
    lastChosen.current = ex;
    setQ(ex);
    const res = await run(ex);
    if (res?.length) choose(res[0]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault();
      setActive((a) => (a <= 0 ? results.length - 1 : a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && active >= 0 && results[active]) choose(results[active]);
      else if (q.trim().length >= 2) run(q.trim());
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && (results.length > 0 || message);

  return (
    <div className="w-full max-w-2xl">
      <div className="relative">
        <label htmlFor="pravah-search" className="sr-only">
          Search a Gurugram sector or locality
        </label>
        <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-basin/80 px-4 shadow-[0_20px_60px_-20px_rgba(45,212,191,0.25)] backdrop-blur transition focus-within:border-teal/60">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 text-mist">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="pravah-search"
            role="combobox"
            aria-expanded={Boolean(showList)}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => results.length && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder="Search a Gurugram sector or locality..."
            className="h-14 w-full bg-transparent text-base text-ink placeholder:text-mist/70 focus:outline-none sm:text-lg"
          />
          {state === 'loading' ? (
            <span aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-teal/30 border-t-teal" />
          ) : null}
        </div>

        <AnimatePresence>
          {showList ? (
            <motion.ul
              id={listId}
              role="listbox"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-white/10 bg-basin p-1.5 shadow-2xl"
            >
              {results.map((r, i) => (
                <li
                  key={r.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(r)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex cursor-pointer items-start justify-between gap-4 rounded-lg px-3 py-2.5 ${i === active ? 'bg-white/[0.06]' : ''}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{r.name}</span>
                    {r.detail ? <span className="block truncate text-xs text-mist">{r.detail}</span> : null}
                  </span>
                  <span className={`mt-0.5 shrink-0 text-[11px] ${r.source.type === 'official' ? 'text-teal-soft' : 'text-sky/80'}`}>
                    {r.source.id === 'gmda' ? 'GMDA survey' : 'OpenStreetMap'}
                  </span>
                </li>
              ))}
              {message ? <li className="px-3 py-2.5 text-sm text-mist">{message}</li> : null}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-mist">Try</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => tryExample(ex)}
            className="rounded-full border border-white/10 px-3 py-1 text-ink/85 transition hover:border-teal/50 hover:text-ink"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
