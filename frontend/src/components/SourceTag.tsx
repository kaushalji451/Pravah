import type React from 'react';
import type { ProvenanceType, SourceRef } from '@/lib/types';

const STYLES: Record<ProvenanceType, { label: string; cls: string; glyph: React.ReactNode }> = {
  official: {
    label: 'Official',
    cls: 'border-teal/50 bg-teal/15 text-teal-soft',
    glyph: <span className="h-1.5 w-1.5 rounded-full bg-teal" />,
  },
  public: {
    label: 'Public dataset',
    cls: 'border-sky/45 text-sky',
    glyph: <span className="h-1.5 w-1.5 rounded-full border border-sky" />,
  },
  calculated: {
    label: 'Pravah calculation',
    cls: 'border-dashed border-ink/35 text-ink/85',
    glyph: <span className="text-[9px] leading-none">ƒ</span>,
  },
  assumption: {
    label: 'Assumption',
    cls: 'border-dashed border-amber/50 text-amber',
    glyph: <span className="text-[10px] leading-none">≈</span>,
  },
  user: {
    label: 'User-provided estimate',
    cls: 'border-mist/40 text-mist',
    glyph: <span className="h-1.5 w-1.5 rotate-45 bg-mist" />,
  },
  demo: {
    label: 'DEMO DATA — NOT OFFICIAL',
    cls: 'pravah-hatch border-coral/60 text-coral font-semibold',
    glyph: <span className="h-1.5 w-1.5 bg-coral" />,
  },
};

/** The provenance chip that sits next to every value Pravah shows. */
export function SourceTag({ type, label }: { type: ProvenanceType; label?: string }) {
  const s = STYLES[type];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5 ${s.cls}`}>
      <span aria-hidden="true" className="flex h-2 w-2 items-center justify-center">
        {s.glyph}
      </span>
      {label ?? s.label}
    </span>
  );
}

/** "Source: X" line with the provenance chip. */
export function SourceLine({ source, note }: { source: SourceRef; note?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-mist">
      <SourceTag type={source.type} />
      <span>
        Source:{' '}
        {source.url ? (
          <a href={source.url} target="_blank" rel="noreferrer" className="text-ink/80 underline decoration-ink/20 underline-offset-2 hover:decoration-teal">
            {source.name}
          </a>
        ) : (
          <span className="text-ink/80">{source.name}</span>
        )}
        {note ? <span className="text-mist"> ({note})</span> : null}
      </span>
    </div>
  );
}

export const PROVENANCE_ORDER: ProvenanceType[] = ['official', 'public', 'calculated', 'assumption', 'user', 'demo'];
export const PROVENANCE_MEANING: Record<ProvenanceType, string> = {
  official: 'Published by a government body. In Pravah, that is GMDA.',
  public: 'An open dataset or service. Useful, but not a government statistic.',
  calculated: 'Computed by Pravah from the data above, using the method shown.',
  assumption: 'A default value Pravah chose. You can change it.',
  user: 'A number you entered.',
  demo: 'Synthetic records shown only when the server runs in demo mode.',
};
