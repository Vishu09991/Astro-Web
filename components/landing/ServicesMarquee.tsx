'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Pause, Play } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { services, type Service } from '@/data/services';
import styles from './ServicesMarquee.module.css';

const pixelsPerSecond = 44;

export function ServicesMarquee({ items = services }: { items?: readonly Service[] }) {
  const { language } = useLanguage();
  const viewport = useRef<HTMLDivElement>(null);
  const original = useRef<HTMLUListElement>(null);
  const [metrics, setMetrics] = useState({ width: 0, copies: 1 });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const container = viewport.current;
    const sequence = original.current;
    if (!container || !sequence) return;

    const observer = new ResizeObserver(() => {
      const width = sequence.getBoundingClientRect().width;
      if (!width) return;
      const copies = Math.ceil(container.clientWidth / width);
      setMetrics(current => current.width === width && current.copies === copies ? current : { width, copies });
    });
    observer.observe(container);
    observer.observe(sequence);
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;
  const hi = language === 'hi';
  const label = hi ? 'हमारी सेवाएँ' : 'Our services';
  const action = paused
    ? hi ? 'सेवाओं की पट्टी चलाएँ' : 'Resume services ticker'
    : hi ? 'सेवाओं की पट्टी रोकें' : 'Pause services ticker';

  return (
    <section className={styles.strip} aria-label={label} data-paused={paused} data-ready={metrics.width > 0}>
      <div ref={viewport} className={styles.viewport} tabIndex={0} role="group" aria-label={hi ? 'सेवाओं के नाम' : 'Bilingual service list'}>
        <div className={styles.track} style={{
          '--distance': metrics.width + 'px',
          '--duration': metrics.width / pixelsPerSecond + 's',
        } as CSSProperties}>
          {Array.from({ length: metrics.copies + 1 }, (_, copy) => (
            <ul key={copy} ref={copy === 0 ? original : undefined} className={styles.sequence}
              role="list" aria-hidden={copy > 0 || undefined} inert={copy > 0}>
              {items.map(({ id, name }) => (
                <li key={id} className={styles.item}>
                  <span className={styles.hindi} lang="hi">{name.hi}</span>
                  <span className={styles.english} lang="en">{name.en}</span>
                  <span className={styles.diamond} aria-hidden="true" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <button type="button" className={styles.control} aria-label={action} title={action} onClick={() => setPaused(value => !value)}>
        {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      </button>
    </section>
  );
}
