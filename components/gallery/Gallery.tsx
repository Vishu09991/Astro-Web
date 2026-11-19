'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { useInView } from 'motion/react';
import { useEffect, useRef, useState, useSyncExternalStore, type TouchEvent } from 'react';
import photos from '@/data/gallery-images.json';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import styles from './Gallery.module.css';

const wrap = (index: number, length: number) => ((index % length) + length) % length;
const reducedQuery = '(prefers-reduced-motion: reduce)';
function watchMotion(notify: () => void) {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
const reducedMotion = () => window.matchMedia(reducedQuery).matches;
const groupSize = 3;
const featuredSizes = '(max-width: 600px) calc(100vw - 40px), (min-width: 1312px) 715px, 60vw';
const supportSizes = '(max-width: 600px) calc(50vw - 24px), (min-width: 1312px) 477px, 40vw';

function useSwipe(move: (direction: number) => void, setTouching?: (touching: boolean) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const handlers = {
    onPointerDown: () => { swiped.current = false; },
    onTouchStart: (event: TouchEvent) => {
      const finger = event.touches[0];
      start.current = event.touches.length === 1 ? { x: finger.clientX, y: finger.clientY } : null;
      setTouching?.(true);
    },
    onTouchCancel: () => { start.current = null; setTouching?.(false); },
    onTouchEnd: (event: TouchEvent) => {
      const origin = start.current;
      start.current = null;
      setTouching?.(event.touches.length > 0);
      if (!origin || event.touches.length) return;
      const dx = event.changedTouches[0].clientX - origin.x;
      const dy = event.changedTouches[0].clientY - origin.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        swiped.current = true;
        move(dx < 0 ? 1 : -1);
      }
    },
  };
  return { handlers, swiped };
}

function Lightbox({ images, initial, close }: { images: string[]; initial: number; close: () => void }) {
  const { t, language } = useLanguage();
  const ref = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(initial);
  const step = (delta: number) => setIndex(value => wrap(value + delta, images.length));
  const { handlers: swipeHandlers } = useSwipe(step);
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
    <div className={styles.lightboxImage} {...swipeHandlers}>
      <Image src={images[index]} alt={label + ' ' + (index + 1)} fill unoptimized loading="eager" draggable={false} />
    </div>
    <button type="button" autoFocus className={styles.close} onClick={close} aria-label={t('Close dialog')}><X /></button>
    {images.length > 1 && <>
      <button type="button" className={styles.previous} onClick={() => step(-1)} aria-label={t('Previous photograph')}><ChevronLeft /></button>
      <button type="button" className={styles.next} onClick={() => step(1)} aria-label={t('Next photograph')}><ChevronRight /></button>
    </>}
  </dialog>;
}

export function PhotoCarousel({ images }: { images: string[] }) {
  const { t, language } = useLanguage();
  const hi = language === 'hi';
  const pageCount = Math.ceil(images.length / groupSize);
  const reduced = useSyncExternalStore(watchMotion, reducedMotion, () => true);
  const section = useRef<HTMLElement>(null);
  const incoming = useRef<HTMLDivElement>(null);
  const inView = useInView(section);
  const [current, setCurrent] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [touching, setTouching] = useState(false);
  const [paused, setPaused] = useState(false);
  const step = (direction: number) => {
    if (pageCount > 1) setPending(wrap(current + direction, pageCount));
  };
  const { swiped, handlers } = useSwipe(step, setTouching);
  const nextPage = pageCount > 1 ? wrap(current + 1, pageCount) : null;
  const prepared = pending ?? (inView && !reduced && !paused ? nextPage : null);

  useEffect(() => {
    if (pending === null || selected !== null || !incoming.current) return;
    const page = pending;
    const layer = incoming.current;
    let active = true;
    let fade: Animation | undefined;

    async function reveal() {
      // Keep the old group in view while the incoming optimized images decode.
      const images = Array.from(layer.querySelectorAll('img'));
      await Promise.allSettled(images.map(image => image.decode()));
      if (!active) return;
      if (images.some(image => !image.naturalWidth)) {
        setPending(null);
        return;
      }

      if (!reduced && typeof layer.animate === 'function') {
        fade = layer.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 360, easing: 'ease-in-out', fill: 'forwards',
        });
        await fade.finished.catch(() => {});
        if (!active) return;
      }
      setCurrent(page);
      setPending(null);
    }

    void reveal();
    return () => {
      active = false;
      fade?.cancel();
    };
  }, [pending, reduced, selected]);

  useEffect(() => {
    if (!inView || nextPage === null || paused || reduced || touching || selected !== null || pending !== null) return;
    const timer = window.setInterval(() => {
      const gallery = section.current;
      const hovered = window.matchMedia('(any-hover: hover)').matches && gallery?.matches(':hover');
      const keyboardFocus = gallery?.contains(document.activeElement) && document.activeElement?.matches(':focus-visible');
      if (!document.hidden && !hovered && !keyboardFocus) setPending(nextPage);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [inView, nextPage, paused, reduced, touching, selected, pending]);

  if (!pageCount) return null;
  const pages = prepared !== null && prepared !== current ? [current, prepared] : [current];
  return <section id="gallery" ref={section} className={'section shell ' + styles.gallery}
    aria-label={hi ? 'चित्र दीर्घा' : 'Photo gallery'}>
    <div className={styles.viewport} {...handlers}>
      {pages.map(page => {
        const first = page * groupSize;
        const group = images.slice(first, first + groupSize);
        const offscreen = page !== current;
        const entering = offscreen && page === pending;
        return <div key={page} ref={entering ? incoming : undefined} className={styles.page}
          data-offscreen={offscreen} data-entering={entering} data-count={group.length} inert={offscreen}>
          {group.map((src, position) => {
            const index = first + position;
            const label = (hi ? 'तस्वीर ' : 'Photograph ') + (index + 1);
            return <button type="button" className={styles.photo} key={src} aria-label={label}
              onClick={event => {
                if (!swiped.current || event.detail === 0) setSelected(index);
                swiped.current = false;
              }}>
              <Image src={src} alt="" fill sizes={position === 0 ? featuredSizes : supportSizes}
                loading={offscreen || inView ? 'eager' : 'lazy'} draggable={false} />
            </button>;
          })}
        </div>;
      })}
    </div>
    {pageCount > 1 && <div className={styles.controls} role="group" aria-label={hi ? 'दीर्घा नियंत्रण' : 'Gallery controls'}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          step(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
      <button type="button" className={styles.control} onClick={() => step(-1)}
        aria-label={hi ? 'पिछली तस्वीरें' : 'Previous photographs'}><ChevronLeft size={18} /></button>
      <div className={styles.pagination}>
        {Array.from({ length: pageCount }, (_, page) =>
          <button key={page} type="button" className={styles.dot}
            aria-label={hi ? 'तस्वीरों का समूह ' + (page + 1) : 'Photo group ' + (page + 1)}
            aria-current={page === current ? 'true' : undefined}
            onClick={() => setPending(page === current ? null : page)} />
        )}
      </div>
      <button type="button" className={styles.control} onClick={() => step(1)}
        aria-label={hi ? 'अगली तस्वीरें' : 'Next photographs'}><ChevronRight size={18} /></button>
      {!reduced && <button type="button" className={styles.control} onClick={() => setPaused(value => !value)}
        aria-label={t(paused ? 'Play slideshow' : 'Pause slideshow')}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
    </div>}
    {selected !== null && <Lightbox images={images} initial={selected} close={() => setSelected(null)} />}
  </section>;
}

export function Gallery() {
  return <PhotoCarousel images={photos} />;
}
