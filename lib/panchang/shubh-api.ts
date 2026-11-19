import type { PanchangLocation } from './live';

const base = 'https://shubh.live/api/v1/';
const ttl = {
  panchang: 12 * 3600,
  'day-periods': 12 * 3600,
  'panchang/month': 24 * 3600,
  'panchang/festivals': 7 * 24 * 3600,
  'panchang/ekadashi': 24 * 3600,
  sun: 12 * 3600,
} as const;

export type ShubhEndpoint = keyof typeof ttl;

export async function optionalShubhRequest(endpoint: ShubhEndpoint, location: PanchangLocation, parameters: Record<string, string>) {
  try { return (await shubhRequest(endpoint, location, parameters)).data; } catch { return undefined; }
}
export class ShubhError extends Error {
  constructor(public code: 'not_configured' | 'rate_limited' | 'unavailable', public retryAfter = 60) {
    super(code);
  }
}

const cache = new Map<string, { data: unknown; expires: number; fetchedAt: string }>();
const inFlight = new Map<string, Promise<{ data: unknown; fetchedAt: string }>>();
const requestTimes: number[] = [];
let blockedUntil = 0;

function retryDelay(header: string | null, now: number) {
  const seconds = header ? (/^\d+$/.test(header) ? Number(header) : (Date.parse(header) - now) / 1000) : NaN;
  return Number.isFinite(seconds) ? Math.max(1, Math.ceil(seconds)) : 60;
}

// Called by server route handlers only. Cache keys contain public request parameters and never the credential.
export async function shubhRequest(endpoint: ShubhEndpoint, location: PanchangLocation, parameters: Record<string, string>) {
  const apiKey = process.env.SHUBH_API_KEY?.trim();
  if (!apiKey) throw new ShubhError('not_configured');

  const url = new URL(endpoint, base);
  url.search = new URLSearchParams({ lat: String(location.latitude), lon: String(location.longitude), ...parameters }).toString();
  const key = url.href;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expires > now) return cached;
  const pending = inFlight.get(key);
  if (pending) return pending;

  while (requestTimes.length && requestTimes[0] <= now - 60_000) requestTimes.shift();
  const localLimit = requestTimes.length >= 55 ? requestTimes[0] + 60_000 : 0;
  const retryAt = Math.max(blockedUntil, localLimit);
  if (retryAt > now || inFlight.size >= 12) {
    throw new ShubhError('rate_limited', retryAt > now ? Math.ceil((retryAt - now) / 1000) : 5);
  }
  requestTimes.push(now);

  const work = (async () => {
    try {
      const response = await fetch(url, {
        headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
      });
      if (response.status === 429) {
        const delay = retryDelay(response.headers.get('retry-after'), Date.now());
        blockedUntil = Math.max(blockedUntil, Date.now() + delay * 1000);
        throw new ShubhError('rate_limited', delay);
      }
      if (!response.ok) throw new ShubhError('unavailable');
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object') throw new ShubhError('unavailable');
      const value = {
        data, fetchedAt: new Date().toISOString(), expires: Date.now() + ttl[endpoint] * 1000,
      };
      if (cache.size >= 512) cache.delete(cache.keys().next().value!);
      cache.set(key, value);
      return value;
    } catch (error) {
      if (error instanceof ShubhError) throw error;
      // Upstream bodies and exception details may contain sensitive information.
      throw new ShubhError('unavailable');
    }
  })();
  inFlight.set(key, work);
  try {
    return await work;
  } finally {
    inFlight.delete(key);
  }
}
