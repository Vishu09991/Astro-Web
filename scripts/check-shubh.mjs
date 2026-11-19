import { loadEnvFile } from 'node:process';

try { loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const key = process.env.SHUBH_API_KEY?.trim();
if (!key) {
  console.error('SHUBH_API_KEY is missing. Configure it in the ignored .env.local file.');
  process.exit(1);
}

const delhi = { lat: '28.6139', lon: '77.2090' };
const date = '2026-11-19';
const tasks = [
  ['Delhi', 'panchang', { ...delhi, date }],
  ['Mumbai', 'panchang', { lat: '19.0760', lon: '72.8777', date }],
  ['Chennai', 'panchang', { lat: '13.0827', lon: '80.2707', date }],
  ['Delhi', 'day-periods', { ...delhi, date }],
  ['Delhi', 'sun', { ...delhi, date }],
  ['Delhi', 'panchang/month', { ...delhi, year: '2026', month: '11' }],
  ['Delhi', 'panchang/festivals', { ...delhi, year: '2026' }],
  ['Delhi', 'panchang/ekadashi', { ...delhi, year: '2026', month: '11' }],
];

function shape(value, depth = 0) {
  if (depth >= 6 || value === null) return value === null ? 'null' : typeof value;
  if (Array.isArray(value)) {
    const variants = new Map(value.slice(0, 40).map(item => {
      const outline = shape(item, depth + 1);
      return [JSON.stringify(outline), outline];
    }));
    return [...variants.values()].slice(0, 6);
  }
  if (typeof value === 'object') return Object.fromEntries(Object.entries(value).slice(0, 40)
    .filter(([field]) => /^[A-Za-z][A-Za-z0-9_ -]{0,48}$/.test(field) && !/auth|secret|token|key/i.test(field))
    .map(([field, entry]) => [field, shape(entry, depth + 1)]));
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return 'ISO datetime with offset';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'ISO date';
  }
  return typeof value;
}

for (const [city, endpoint, query] of tasks) {
  try {
    const url = new URL(endpoint, 'https://shubh.live/api/v1/');
    url.search = new URLSearchParams(query).toString();
    const response = await fetch(url, {
      headers: { 'X-API-Key': key, Accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    });
    console.log(city, endpoint, response.status);
    if (!response.ok) {
      process.exitCode = 1;
      if ([401, 403, 429].includes(response.status)) break;
      continue;
    }
    console.log(JSON.stringify(shape(await response.json()), null, 2));
  } catch {
    console.error(city, endpoint, 'request or JSON parsing failed');
    process.exitCode = 1;
  }
}
