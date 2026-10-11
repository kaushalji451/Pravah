import type { CityOverview, LocationDetails, RwhResponse, SearchResponse, SourcesResponse } from './types';

const getBaseUrl = (): string => {
  // Check Vite environment variables
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    if (metaEnv.VITE_API_BASE_URL) return metaEnv.VITE_API_BASE_URL;
    if (metaEnv.NEXT_PUBLIC_API_BASE_URL) return metaEnv.NEXT_PUBLIC_API_BASE_URL;
  }
  // Check Node / process environment variables fallback
  if (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return 'https://rqza50bkhg.execute-api.ap-southeast-2.amazonaws.com';
};

const BASE = getBaseUrl().replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { signal, headers: { Accept: 'application/json' } });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError(`Can't reach the Pravah server at ${BASE}. Check that the backend is running.`);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error || `Request failed (${res.status}).`, res.status);
  return body as T;
}

export const api = {
  search: (q: string, signal?: AbortSignal) => get<SearchResponse>(`/api/societies/search?q=${encodeURIComponent(q)}`, signal),
  details: (id: string, signal?: AbortSignal) => get<LocationDetails>(`/api/societies/${encodeURIComponent(id)}`, signal),
  sources: () => get<SourcesResponse>('/api/sources'),
  overview: (signal?: AbortSignal) => get<CityOverview>('/api/overview', signal),
  rwh: (
    id: string,
    p: { areaSqft?: number; annualRainfallMm?: number; runoffCoefficient?: number; pricePerKl?: number },
    signal?: AbortSignal,
  ) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(p)) if (v !== undefined && Number.isFinite(v)) qs.set(k, String(v));
    return get<RwhResponse>(`/api/rwh/${encodeURIComponent(id)}?${qs}`, signal);
  },
};
