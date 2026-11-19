import { z } from 'zod';
import { dateInZone } from './types';
import type { PanchangLocation } from './live';

const iso = z.iso.datetime({ offset: true });
const element = z.object({
  name: z.string().min(1),
  endsAt: iso.optional().catch(undefined),
  paksha: z.string().optional().catch(undefined),
  pada: z.number().optional().catch(undefined),
});
const rashi = z.object({ sa: z.string(), en: z.string() });
const interval = z.object({ start: iso, end: iso }).refine(value => Date.parse(value.end) > Date.parse(value.start));
const period = interval.and(z.object({ name: z.string().min(1), type: z.string(), note: z.string().optional() }));
const skyTime = iso.nullish().catch(undefined);

const daily = z.object({
  date: z.iso.date(),
  tz: z.string().min(1),
  sunrise: skyTime,
  sunset: skyTime,
  moonrise: skyTime,
  moonset: skyTime,
  vara: rashi.optional().catch(undefined),
  tithi: element.optional().catch(undefined),
  nakshatra: element.optional().catch(undefined),
  yoga: element.optional().catch(undefined),
  karana: element.optional().catch(undefined),
  moonRashi: rashi.optional().catch(undefined),
  sunRashi: rashi.optional().catch(undefined),
  muhurat: z.object({ brahma: interval.optional().catch(undefined) }).optional().catch(undefined),
  lunarMonth: z.object({ amanta: z.string(), isAdhika: z.boolean() }).optional().catch(undefined),
  samvat: z.object({ vikram: z.number(), samvatsara: z.string().optional() }).optional().catch(undefined),
});

export type ShubhDaily = z.infer<typeof daily>;

const sky = z.object({ date: z.iso.date(), tz: z.string(), sunrise: skyTime, sunset: skyTime });
const dayPeriods = sky.extend({ periods: z.array(period) });
const month = z.object({
  year: z.number().int(), month: z.number().int(), tz: z.string(),
  days: z.array(z.object({
    date: z.iso.date(), tithiNumber: z.number().int().optional(), tithiName: z.string().optional(),
    paksha: z.string().optional(), nakshatra: z.string().optional(), markers: z.array(z.string()).default([]),
  })),
});
const festivals = z.object({ year: z.number().int(), festivals: z.array(z.object({ name: z.string().min(1), date: z.iso.date() })) });
const ekadashi = z.object({ year: z.number().int(), events: z.array(z.object({
  name: z.string().min(1), paksha: z.string().optional(), smartaDate: z.iso.date().nullish(),
  vaishnavaDate: z.iso.date().nullish(), kind: z.string().optional(), mahadwadashi: z.boolean().optional(),
  parana: interval.nullish().catch(undefined),
})) });

export type ShubhMonth = z.infer<typeof month> & {
  festivals?: z.infer<typeof festivals>['festivals'];
  ekadashi?: z.infer<typeof ekadashi>['events'];
};
export type ShubhDayResponse = {
  data: ShubhDaily; fetchedAt: string;
  periods?: z.infer<typeof period>[];
  festivals?: z.infer<typeof festivals>['festivals'];
};

export function normalizeSky(raw: unknown, date: string, timezone: string) {
  const value = sky.safeParse(raw);
  if (!value.success || value.data.date !== date || value.data.tz !== timezone) return undefined;
  return value.data;
}

export function normalizePeriods(raw: unknown, date: string, timezone: string) {
  const value = dayPeriods.safeParse(raw);
  if (!value.success || value.data.date !== date || value.data.tz !== timezone) return undefined;
  return value.data;
}

export function normalizeMonth(raw: unknown, year: number, selectedMonth: number) {
  const value = month.safeParse(raw);
  if (!value.success || value.data.year !== year || value.data.month !== selectedMonth) return null;
  const prefix = year + '-' + String(selectedMonth).padStart(2, '0') + '-';
  const dates = new Set(value.data.days.map(day => day.date));
  if (!dates.size || dates.size !== value.data.days.length || [...dates].some(date => !date.startsWith(prefix))) return null;
  try { new Intl.DateTimeFormat('en', { timeZone: value.data.tz }); } catch { return null; }
  return value.data;
}

export function normalizeFestivals(raw: unknown, year: number) {
  const value = festivals.safeParse(raw);
  return value.success && value.data.year === year && value.data.festivals.every(item => item.date.startsWith(year + '-'))
    ? value.data.festivals : undefined;
}

export function normalizeEkadashi(raw: unknown, year: number) {
  const value = ekadashi.safeParse(raw);
  return value.success && value.data.year === year ? value.data.events : undefined;
}

export function normalizeDaily(raw: unknown, date: string, location: PanchangLocation): ShubhDaily | null {
  const parsed = daily.safeParse(raw);
  if (!parsed.success || parsed.data.date !== date) return null;
  const value = parsed.data;
  try {
    const sample = value.sunrise ? new Date(value.sunrise) : new Date(date + 'T12:00:00Z');
    // Confirm the returned zone is valid and a returned sunrise belongs to the requested day.
    if (value.sunrise && dateInZone(sample, value.tz) !== date) return null;
    new Intl.DateTimeFormat('en', { timeZone: value.tz });
  } catch {
    value.tz = location.timezone;
    if (value.sunrise && dateInZone(new Date(value.sunrise), value.tz) !== date) return null;
  }
  return value.tithi || value.nakshatra || value.yoga || value.sunrise ? value : null;
}
