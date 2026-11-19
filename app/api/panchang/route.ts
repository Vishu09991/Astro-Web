import { NextRequest, NextResponse } from 'next/server';
import { resolveLocation } from '@/lib/panchang/location';
import { optionalShubhRequest, ShubhError, shubhRequest } from '@/lib/panchang/shubh-api';
import { normalizeEkadashi, normalizeFestivals, normalizeMonth, type ShubhMonth } from '@/lib/panchang/shubh-normalizer';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const year = Number(query.get('year'));
  const month = Number(query.get('month'));
  const location = resolveLocation(query);
  if (!Number.isInteger(year) || year < 1900 || year > 2100 ||
      !Number.isInteger(month) || month < 1 || month > 12 || !location) {
    return NextResponse.json({ error: 'invalid_selection' }, { status: 400 });
  }

  try {
    const params = { year: String(year), month: String(month) };
    const rawMonth = await shubhRequest('panchang/month', location, params);
    const grid = normalizeMonth(rawMonth.data, year, month);
    if (!grid) throw new ShubhError('unavailable');
    const [rawFestivals, rawEkadashi] = await Promise.all([
      optionalShubhRequest('panchang/festivals', location, { year: params.year }),
      optionalShubhRequest('panchang/ekadashi', location, params),
    ]);
    const prefix = params.year + '-' + params.month.padStart(2, '0');
    const result: ShubhMonth = {
      ...grid,
      festivals: normalizeFestivals(rawFestivals, year)?.filter(item => item.date.startsWith(prefix)),
      ekadashi: normalizeEkadashi(rawEkadashi, year),
    };
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (cause) {
    const error = cause instanceof ShubhError ? cause : new ShubhError('unavailable');
    return NextResponse.json({ error: error.code, retryAfter: error.retryAfter }, {
      status: error.code === 'rate_limited' ? 429 : 503,
      headers: { 'Retry-After': String(error.retryAfter), 'Cache-Control': 'no-store' },
    });
  }
}
