const nf = new Intl.NumberFormat('en-IN');
const nf1 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

export const fmt = (v: number | null | undefined, digits: 0 | 1 = 0) =>
  v === null || v === undefined || !Number.isFinite(v) ? '—' : digits ? nf1.format(v) : nf.format(Math.round(v));

export const fmtInr = (v: number | null | undefined) => (v === null || v === undefined ? '—' : `₹${nf.format(Math.round(v))}`);

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const fmtShortDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
