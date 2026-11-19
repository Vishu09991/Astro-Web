import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveLocation } from '@/lib/panchang/location';
import { optionalShubhRequest, shubhRequest, ShubhError } from '@/lib/panchang/shubh-api';
import { normalizeDaily, normalizeFestivals, normalizePeriods, normalizeSky, type ShubhDayResponse } from '@/lib/panchang/shubh-normalizer';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const date = z.iso.date().safeParse(query.get('date'));
  const location = resolveLocation(query);
  if (!date.success || date.data < '1900-01-01' || date.data > '2100-12-31' || !location) {
    return NextResponse.json({ error: 'invalid_selection' }, { status: 400 });
  }
  try {
    const response = await shubhRequest('panchang', location, { date: date.data });
    const data = normalizeDaily(response.data, date.data, location);
    if (!data) throw new ShubhError('unavailable');
    const params = { date: date.data };
    const year = Number(date.data.slice(0, 4));
    const [rawPeriods, rawFestivals] = await Promise.all([
      optionalShubhRequest('day-periods', location, params),
      query.get('includeFestivals') === '1' ? optionalShubhRequest('panchang/festivals', location, { year: String(year) }) : undefined,
    ]);
    const periods = normalizePeriods(rawPeriods, date.data, data.tz);
    data.sunrise ??= periods?.sunrise;
    data.sunset ??= periods?.sunset;
    if (!data.sunrise || !data.sunset) {
      const solar = normalizeSky(await optionalShubhRequest('sun', location, params), date.data, data.tz);
      data.sunrise ??= solar?.sunrise;
      data.sunset ??= solar?.sunset;
    }
    const result: ShubhDayResponse = { data, fetchedAt: response.fetchedAt, periods: periods?.periods, festivals: normalizeFestivals(rawFestivals, year) };
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (cause) {
    const error = cause instanceof ShubhError ? cause : new ShubhError('unavailable');
    return NextResponse.json({ error: error.code, retryAfter: error.retryAfter }, {
      status: error.code === 'rate_limited' ? 429 : 503,
      headers: { 'Retry-After': String(error.retryAfter), 'Cache-Control': 'no-store' },
    });
  }
}
