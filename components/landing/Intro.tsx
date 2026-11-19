'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { Yantra } from '@/components/ui/Yantra';
import styles from './Intro.module.css';

const shlokas = [
  'ॐ गं गणपतये नमः॥',
  'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
  'ॐ नमो भगवते वासुदेवाय नमः',
];

// Keep the overlay and gate in the first server render and in the hydration render.
export function Intro({ children }: { children: ReactNode }) {
  const { t: tr } = useLanguage();
  const [visible, setVisible] = useState(true);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !overlay.current) return;
    let active = true;
    const animation = overlay.current.getAnimations?.()[0];
    const finish = () => { if (active) setVisible(false); };
    // CSS normally completes the reveal. Handle late hydration, cancellation,
    // and disabled animations without starting a second clock.
    (animation?.finished ?? Promise.resolve()).then(finish, finish);
    return () => { active = false; };
  }, [visible]);

  return (
    <>
      {visible && (
        <div ref={overlay} className={`intro ${styles.sequence}`}>
          <Yantra className="intro-yantra" />
          <div className={styles.shlokas}>
            {shlokas.map((shloka) => <p lang="hi" key={shloka}>{shloka}</p>)}
          </div>
          <span className="eyebrow">{tr('A MOMENT OF STILLNESS. A JOURNEY WITHIN.')}</span>
          <button type="button" className="text-button" onClick={() => {
            setVisible(false);
            requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true }));
          }}>{tr('Skip intro →')}</button>
        </div>
      )}
      <div className={styles.homepage}>{children}</div>
    </>
  );
}
