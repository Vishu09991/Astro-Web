import assert from 'node:assert/strict';
import { loadEnvFile } from 'node:process';
import { NextRequest } from 'next/server';
import { GET as getDay } from '../app/api/panchang/day/route';
import { GET as getMonth } from '../app/api/panchang/route';
import { dateInZone } from '../lib/panchang/types';
import type { ShubhDayResponse, ShubhMonth } from '../lib/panchang/shubh-normalizer';

async function main() {
  const date = '2026-11-19';
  const offset = /[+-]\d{2}:\d{2}$/;
  const sunrises = new Set<string>();
  for (const city of ['delhi', 'mumbai', 'chennai']) {
    const response = await getDay(new NextRequest('http://localhost/api/panchang/day?date=' + date + '&city=' + city + '&includeFestivals=1'));
    assert.equal(response.status, 200, city + ' daily');
    const { data, periods, festivals } = await response.json() as ShubhDayResponse;
    assert.equal(data.date, date);
    assert.equal(data.tz, 'Asia/Kolkata');
    for (const field of ['tithi', 'nakshatra', 'yoga', 'karana'] as const) {
      assert.ok(data[field]?.name);
      assert.match(data[field]?.endsAt ?? '', offset);
    }
    assert.ok(data.sunrise && data.sunset && data.moonrise && data.moonset);
    assert.ok(data.vara && data.lunarMonth && data.samvat && data.sunRashi && data.moonRashi);
    assert.equal(dateInZone(new Date(data.sunrise), data.tz), date);
    assert.ok(periods && periods.length >= 4);
    assert.ok(festivals?.length);
    sunrises.add(data.sunrise);
    console.log(city + ': normalized daily, solar/lunar fields, day periods and festivals passed');
  }
  assert.equal(sunrises.size, 3);
  for (const [year, month, length] of [[2026, 11, 30], [2027, 2, 28]]) {
    const response = await getMonth(new NextRequest('http://localhost/api/panchang?year=' + year + '&month=' + month + '&city=delhi'));
    assert.equal(response.status, 200);
    const payload = await response.json() as ShubhMonth;
    assert.equal(payload.days.length, length);
    assert.ok(payload.days.every(day => day.tithiName && day.nakshatra));
    assert.ok(payload.days.some(day => day.markers.length > 0));
    assert.ok(payload.festivals);
    assert.ok(payload.ekadashi?.some(event => event.smartaDate && event.vaishnavaDate && event.parana));
    console.log(year + '-' + month + ': normalized monthly grid, festivals and Ekadashi passed');
  }
}

try { loadEnvFile('.env.local'); } catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}
if (!process.env.SHUBH_API_KEY?.trim()) {
  console.error('SHUBH_API_KEY is missing.');
  process.exitCode = 1;
} else {
  void main().catch(error => {
    console.error(error instanceof Error ? error.message : 'ShubhAI smoke test failed.');
    process.exitCode = 1;
  });
}
