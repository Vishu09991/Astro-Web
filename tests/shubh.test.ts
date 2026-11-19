import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDaily } from '../lib/panchang/shubh-normalizer';
import { shubhRequest } from '../lib/panchang/shubh-api';
import { cities } from '../data/site';

const date = '2026-11-19';
const sample = {
  date, tz: 'Asia/Kolkata', sunrise: date + 'T06:20:00+05:30',
  tithi: { name: 'fixture', endsAt: '2026-11-20T01:15:00+05:30' },
  nakshatra: { name: 'fixture', endsAt: '...' },
};

test('daily adapter preserves a next-day offset, rejects the wrong day, and omits invalid times', () => {
  const value = normalizeDaily(sample, date, cities[0]);
  assert.equal(value?.tithi?.endsAt, sample.tithi.endsAt);
  assert.equal(value?.nakshatra?.endsAt, undefined);
  assert.equal(normalizeDaily(sample, '2026-11-20', cities[0]), null);
  assert.equal(normalizeDaily({ ...sample, sunrise: '2026-11-20T06:00:00+05:30' }, date, cities[0]), null);
});

test('server transport deduplicates calls and observes upstream cooldown', async t => {
  const previous = process.env.SHUBH_API_KEY;
  process.env.SHUBH_API_KEY = 'test-key';
  t.after(() => { if (previous === undefined) delete process.env.SHUBH_API_KEY; else process.env.SHUBH_API_KEY = previous; });
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url: URL, init: RequestInit) => {
    calls++;
    assert.equal(url.origin, 'https://shubh.live');
    assert.equal(url.searchParams.get('date'), date);
    assert.equal(new Headers(init.headers).get('X-API-Key'), 'test-key');
    assert.equal(url.href.includes('test-key'), false);
    if (url.pathname.endsWith('/sun')) return new Response('', { status: 429, headers: { 'Retry-After': '120' } });
    if (url.pathname.endsWith('/day-periods')) return new Response('private upstream error', { status: 401 });
    return Response.json(sample);
  });
  await Promise.all([shubhRequest('panchang', cities[0], { date }), shubhRequest('panchang', cities[0], { date })]);
  await shubhRequest('panchang', cities[0], { date });
  assert.equal(calls, 1);
  await assert.rejects(shubhRequest('day-periods', cities[0], { date }), { code: 'unavailable' });
  await assert.rejects(shubhRequest('sun', cities[0], { date }), { code: 'rate_limited', retryAfter: 120 });
  await assert.rejects(shubhRequest('sun', cities[1], { date }), { code: 'rate_limited' });
  assert.equal(calls, 3);
});
