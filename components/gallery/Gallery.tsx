'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useInView } from 'motion/react';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import photos from '@/data/gallery-images.json';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import styles from './Gallery.module.css';

const wrap = (index: number, length: number) => ((index % length) + length) % length;
const columns = () => window.innerWidth <= 600 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
const desktop = () => 3;
function watchWidth(notify: () => void) {
  window.addEventListener('resize', notify);
  return () => window.removeEventListener('resize', notify);
}
const reducedQuery = '(prefers-reduced-motion: reduce)';
function watchMotion(notify: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
const reducedMotion = () => window.matchMedia(reducedQuery).matches;

function Lightbox({ images, initial, close }: { images: string[]; initial: number; close: () => void }) {
  const { t, language } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(initial);
  const step = (delta: number) => setIndex(value => wrap(value + delta, images.length));
  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);
  const label = language === 'hi' ? 'तस्वीर' : 'Photograph';
  return <dialog ref={ref} className={styles.lightbox} aria-label={label}
    onCancel={event => { event.preventDefault(); close(); }}
    onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        step(event.key === 'ArrowLeft' ? -1 : 1);
      }
    }}>
    <Image src={images[index]} alt={label + ' ' + (index + 1)} fill unoptimized loading="eager" />
    <button type="button" autoFocus className={styles.close} onClick={close} aria-label={t('Close dialog')}><X /></button>
    {images.length > 1 && <>
      <button type="button" className={styles.previous} onClick={() => step(-1)} aria-label={t('Previous photograph')}><ChevronLeft /></button>
      <button type="button" className={styles.next} onClick={() => step(1)} aria-label={t('Next photograph')}><ChevronRight /></button>
    </>}
  </dialog>;
}

export function PhotoCarousel({ images }: { images: string[] }) {
  const { t, language } = useLanguage();
  const visible = Math.min(useSyncExternalStore(watchWidth, columns, desktop), images.length);
  const reduced = useSyncExternalStore(watchMotion, reducedMotion, () => true);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(section);
  const animation = useRef<Animation | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const [first, setFirst] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [paused, setPaused] = useState(false);
  const loops = images.length > visible;

  const move = useCallback((direction: number) => {
    if (!loops || !track.current || animation.current) return;
    if (reduced) {
      setFirst(value => value + direction);
      return;
    }
    // Keep one neighbor mounted on each side. After moving one panel,
    // recycle the hidden neighbor while the visible photographs stay in place.
    const element = track.current;
    const stride = (element.children[1] as HTMLElement).offsetLeft - (element.children[0] as HTMLElement).offsetLeft;
    const slide = element.animate([
      { transform: 'translateX(' + -stride + 'px)' },
      { transform: 'translateX(' + -(1 + direction) * stride + 'px)' },
    ], { duration: 520, easing: 'cubic-bezier(.25,.75,.25,1)', fill: 'forwards' });
    animation.current = slide;
    slide.onfinish = () => {
      flushSync(() => setFirst(value => value + direction));
      slide.cancel();
      animation.current = null;
    };
  }, [loops, reduced]);
  useEffect(() => () => {
    animation.current?.cancel();
    animation.current = null;
  }, [visible, reduced]);

  useEffect(() => {
    if (!inView || !loops || paused || reduced || hover || focused || touching || selected !== null) return;
    const timer = window.setInterval(() => { if (!document.hidden) move(1); }, 3500);
    return () => window.clearInterval(timer);
  }, [inView, loops, paused, reduced, hover, focused, touching, selected, move]);

  if (!images.length) return null;
  const slots = Array.from({ length: visible + (loops ? 2 : 0) }, (_, i) => first + i - (loops ? 1 : 0));
  return <section id="gallery" ref={section} className={'section shell ' + styles.gallery}
    aria-label={language === 'hi' ? 'चित्र दीर्घा' : 'Photo gallery'}
    onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(true); }}
    onPointerLeave={() => setHover(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
    <div className={styles.viewport}
      onTouchStart={e => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        swiped.current = false;
        setTouching(true);
      }}
      onTouchCancel={() => { touch.current = null; setTouching(false); }}
      onTouchEnd={e => {
        const start = touch.current;
        touch.current = null;
        setTouching(false);
        if (!start) return;
        const dx = e.changedTouches[0].clientX - start.x;
        const dy = e.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          swiped.current = true;
          move(dx < 0 ? 1 : -1);
        }
      }}>
      <div ref={track} className={styles.track} data-loop={loops} style={{ '--columns': visible } as CSSProperties}>
        {slots.map((slot, position) => {
          const index = wrap(slot, images.length);
          const hidden = loops && (position === 0 || position === slots.length - 1);
          const label = (language === 'hi' ? 'तस्वीर ' : 'Photograph ') + (index + 1);
          return <button type="button" className={styles.photo} key={slot} aria-label={label}
            inert={hidden} onClick={() => { if (!swiped.current) setSelected(index); swiped.current = false; }}
            onPointerDown={() => { swiped.current = false; }}>
            <Image src={images[index]} alt="" fill sizes="(max-width:600px) 100vw, (max-width:1000px) 50vw, 33vw" draggable={false} />
          </button>;
        })}
      </div>
      {loops && <>
        <button type="button" className={styles.previous} onClick={() => move(-1)} aria-label={t('Previous photograph')}><ChevronLeft /></button>
        <button type="button" className={styles.next} onClick={() => move(1)} aria-label={t('Next photograph')}><ChevronRight /></button>
        {!reduced && <button type="button" className={styles.pause} onClick={() => setPaused(value => !value)} aria-label={t(paused ? 'Play slideshow' : 'Pause slideshow')}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
      </>}
    </div>
    {selected !== null && <Lightbox images={images} initial={selected} close={() => setSelected(null)} />}
  </section>;
}

export function Gallery() {
  return <PhotoCarousel images={photos} />;
}
