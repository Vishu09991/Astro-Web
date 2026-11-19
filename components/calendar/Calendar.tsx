'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Info, MapPin, RotateCw } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { Modal } from '@/components/ui/Modal';
import { cities } from '@/data/site';
import { dateInZone, monthDates } from '@/lib/panchang/types';
import type { PanchangSelection } from '@/lib/panchang/live';
import type { ShubhDayResponse, ShubhMonth } from '@/lib/panchang/shubh-normalizer';

type Result<T> = { key: string; revision: number; data?: T; error?: string };

function useCalendarResult<T>(path: string, key: string, revision: number) {
  const [result, setResult] = useState<Result<T> | null>(null);
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    fetch(path + '?' + key, { signal: controller.signal })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'unavailable');
        if (!controller.signal.aborted) setResult({ key, revision, data: body as T });
      })
      .catch(error => {
        if (!controller.signal.aborted) setResult({ key, revision, error: error.message });
      });
    return () => controller.abort();
  }, [path, key, revision]);
  return result?.key === key && result.revision === revision ? result : null;
}

export function Calendar({ location, setLocation }: PanchangSelection) {
  const { language, t } = useLanguage();
  const hi = language === 'hi';
  const locale = hi ? 'hi-IN' : 'en-IN';
  const [today, setToday] = useState('');
  const [selection, setSelection] = useState<{ year: number; month: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [detailRevision, setDetailRevision] = useState(0);
  const knownCity = cities.some(city => city.id === location.id);
  const locationQuery = new URLSearchParams(knownCity
    ? { city: location.id }
    : { latitude: String(location.latitude), longitude: String(location.longitude) });
  const currentMonth = { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) };
  const view = selection ?? currentMonth;
  const monthQuery = new URLSearchParams(locationQuery);
  monthQuery.set('year', String(view.year));
  monthQuery.set('month', String(view.month));
  const detailQuery = new URLSearchParams(locationQuery);
  if (selected) detailQuery.set('date', selected);

  const result = useCalendarResult<ShubhMonth>('/api/panchang', today ? monthQuery.toString() : '', revision);
  const detail = useCalendarResult<ShubhDayResponse>('/api/panchang/day', selected ? detailQuery.toString() : '', detailRevision);
  const month = result?.data;
  const data = detail?.data?.data;
  const timezone = month?.tz ?? location.timezone;

  useEffect(() => {
    const update = () => setToday(dateInZone(new Date(), timezone));
    const initial = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 60000);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [timezone]);

  const months = Array.from({ length: 12 }, (_, index) => new Date(2000, index).toLocaleString(locale, { month: 'long' }));
  const dateFormat = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const days = new Map(month?.days.map(day => [day.date, day]));
  const dates = today ? monthDates(view.year, view.month) : [];
  const first = dates.length ? new Date(dates[0] + 'T12:00:00Z').getUTCDay() : 0;
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const festivalsOn = (date: string) => month?.festivals?.filter(item => item.date === date) ?? [];
  const ekadashiOn = (date: string) => month?.ekadashi?.filter(item => item.smartaDate === date || item.vaishnavaDate === date) ?? [];
  const formatTime = (value: string, zone = data?.tz ?? timezone) => new Intl.DateTimeFormat(locale, {
    timeZone: zone, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(value));

  function move(delta: number) {
    const next = new Date(Date.UTC(view.year, view.month - 1 + delta, 1));
    const year = next.getUTCFullYear();
    if (year >= 1900 && year <= 2100) setSelection({ year, month: next.getUTCMonth() + 1 });
  }

  const retry = () => setRevision(value => value + 1);
  const loading = !result && !month;
  const status = loading ? t('Loading verified Panchang data…')
    : result?.error === 'rate_limited' ? (hi ? 'अनुरोध सीमा पूरी हुई। कुछ समय बाद पुनः प्रयास करें।' : 'The Panchang request limit was reached. Try again shortly.')
    : result?.error ? t('Panchang data unavailable')
    : t('Select a day for all transitions and timings. Times are local to the selected city.');

  return (
    <section id="calendar" className="section calendar-section">
      <div className="shell">
        <span className="eyebrow">{hi ? 'मासिक पंचांग' : 'Monthly Panchang'}</span>
        <div className="section-heading"><h2>{hi ? 'वैदिक कैलेंडर' : 'Vedic Calendar'}</h2><p>{t('Explore the Vedic calendar, daily Panchang, and religious observances for your chosen location.')}</p></div>
        <div className="calendar-settings">
          <label><span><MapPin size={14} /> {t('Location')}</span><select value={location.id} onChange={event => {
            const city = cities.find(entry => entry.id === event.target.value);
            if (city) setLocation(city);
            setSelected(null);
          }}>
            {!knownCity && <option value={location.id}>{t(location.name)}</option>}
            {cities.map(city => <option key={city.id} value={city.id}>{t(city.name)}</option>)}
          </select></label>
          <p>{t('Amanta')} · {timezone}<br />{t('Daily values at local sunrise')}</p>
        </div>
        <div className="calendar-panel">
          <div className="calendar-toolbar">
            <div className="month-title"><CalendarDays size={24} /><h3>{today ? months[view.month - 1] : ''} <em>{today ? view.year : ''}</em></h3></div>
            <div className="calendar-controls">
              <button className="text-button" onClick={() => setSelection(null)}>{t('Today')}</button>
              <select aria-label={t('Month')} value={view.month || 1} disabled={!today} onChange={event => setSelection({ ...view, month: Number(event.target.value) })}>{months.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select>
              <select aria-label={t('Year')} value={view.year || 2026} disabled={!today} onChange={event => setSelection({ ...view, year: Number(event.target.value) })}>{Array.from({ length: 201 }, (_, index) => 1900 + index).map(year => <option key={year}>{year}</option>)}</select>
              <button className="icon-button" aria-label={t('Previous month')} disabled={!today || view.year === 1900 && view.month === 1} onClick={() => move(-1)}><ChevronLeft size={18} /></button>
              <button className="icon-button" aria-label={t('Next month')} disabled={!today || view.year === 2100 && view.month === 12} onClick={() => move(1)}><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="calendar-notice" role="status"><Info size={16} /><span>{status}</span>{result?.error && <button className="icon-button" aria-label={t('Retry calendar')} onClick={retry}><RotateCw size={16} /></button>}</div>
          <div className="calendar-scroll">
            <div className="calendar-grid" aria-busy={loading}>
              {weekdays.map(name => <div className="weekday" key={name}>{hi ? t(name) : name.slice(0, 3)}</div>)}
              {Array.from({ length: first }, (_, index) => <div className="calendar-blank" key={index} />)}
              {dates.map(date => {
                const day = days.get(date);
                const labels = [...new Set([...(day?.markers ?? []), ...festivalsOn(date).map(item => item.name), ...ekadashiOn(date).map(item => item.name)])];
                return <button key={date} type="button" className={'calendar-day' + (date === today ? ' today' : '')} aria-current={date === today ? 'date' : undefined} aria-label={date + ', ' + (day?.tithiName ?? t('Panchang unavailable'))} onClick={() => setSelected(date)}>
                  <span className="day-number">{Number(date.slice(-2))}</span>
                  <span className="day-vaar">{t(weekdays[new Date(date + 'T12:00:00Z').getUTCDay()])}</span>
                  {day?.tithiName && <strong>{day.tithiName}</strong>}{day?.paksha && <span>{day.paksha}</span>}{day?.nakshatra && <strong>{day.nakshatra}</strong>}
                  {labels.map(label => <span key={label} className="festival-tag">{label}</span>)}
                </button>;
              })}
            </div>
          </div>
          <div className="calendar-legend"><span><i /> {t('Today')}</span><span>{t('Swipe to explore the full calendar on small screens')}</span></div>
        </div>
        <div className="festival-panel">
          <div><h3>{t('Festivals this month')}</h3></div>
          {month?.festivals ? <div>{month.festivals.length ? month.festivals.map(item => <button key={item.date + item.name} className="festival-list-item" onClick={() => setSelected(item.date)}><span>{item.date}</span><strong>{item.name}</strong></button>) : <p>{t('No observances returned by the verified feed for this selection.')}</p>}</div> : <p>{t('Verified festival data is unavailable.')}</p>}
        </div>
        <p className="calendar-source"><a href="https://shubh.live" target="_blank" rel="noreferrer">{hi ? 'शुभएआई द्वारा' : 'Powered by ShubhAI'}</a></p>
      </div>
      {selected && <Modal title={(hi ? 'दैनिक पंचांग ' : 'Daily Panchang ') + selected} onClose={() => setSelected(null)}>
        <div className="modal-content">
          <span className="eyebrow">{t(location.name)} · {data?.tz ?? timezone}</span>
          <h2>{dateFormat.format(new Date(selected + 'T12:00:00Z'))}</h2>
          {data ? <>
            <div className="sun-times">{(['sunrise', 'sunset', 'moonrise', 'moonset'] as const).map((field, index) => {
              const instant = data[field];
              return instant && <span key={field}>{t(['Sunrise', 'Sunset', 'Moonrise', 'Moonset'][index])} · {formatTime(instant)}</span>;
            })}</div>
            {(['tithi', 'nakshatra', 'yoga', 'karana'] as const).map((field, index) => {
              const item = data[field];
              return item && <div className="detail-block" key={field}><h3>{(hi ? ['तिथि', 'नक्षत्र', 'योग', 'करण'] : ['Tithi', 'Nakshatra', 'Yoga', 'Karana'])[index]}</h3><p>{item.name}{item.paksha && ' · ' + item.paksha}{item.endsAt && ' · ' + t('ends') + formatTime(item.endsAt)}</p></div>;
            })}
            {!!detail?.data?.periods?.length && <div className="detail-block"><h3>{hi ? 'मुहूर्त' : 'Day periods'}</h3>{detail.data.periods.map(period => <p key={period.name + period.start}>{period.name} · {formatTime(period.start)} → {formatTime(period.end)}</p>)}</div>}
          </> : <div className="empty-state"><p role="status">{t(detail?.error ? 'Panchang data unavailable' : 'Verified data is loading.')}</p>{detail?.error && <button className="icon-button" aria-label={t('Retry calendar')} onClick={() => setDetailRevision(value => value + 1)}><RotateCw size={16} /></button>}</div>}
          {(festivalsOn(selected).length > 0 || ekadashiOn(selected).length > 0 || !!days.get(selected)?.markers.length) && <div className="detail-block"><h3>{t('Festivals & Vrats')}</h3>
            {days.get(selected)?.markers.map(marker => <p key={marker}>{marker}</p>)}
            {festivalsOn(selected).map(item => <p key={item.name}>{item.name}</p>)}
            {ekadashiOn(selected).map(item => <div key={item.name + item.smartaDate}>
              <strong>{item.name}</strong>
              {item.paksha && <p>{item.paksha}{item.mahadwadashi ? ' · Mahadwadashi' : ''}</p>}
              {item.smartaDate && <p>Smarta · {item.smartaDate}</p>}
              {item.vaishnavaDate && <p>Vaishnava · {item.vaishnavaDate}</p>}
              {item.parana && <p>{hi ? 'पारण' : 'Parana'} · {formatTime(item.parana.start)} → {formatTime(item.parana.end)}</p>}
            </div>)}
          </div>}
        </div>
      </Modal>}
    </section>
  );
}
