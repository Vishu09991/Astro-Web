'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { Yantra } from '@/components/ui/Yantra';
import styles from './Intro.module.css';

// Survives internal navigation, resets on a full page load.
let introPlayed = false;
const shlokas = [
  'ॐ गं गणपतये नमः॥',
  'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
  'ॐ नमो भगवते वासुदेवाय नमः',
];

export function Intro() {
  const { t: tr } = useLanguage();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (introPlayed) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Claim inside the callback so Strict Mode cleanup cannot consume the intro.
    const show = window.setTimeout(() => {
      if (introPlayed) return;
      introPlayed = true;
      if (!preference.matches) setVisible(true);
    }, 0);
    const onPreferenceChange = () => {
      if (preference.matches) setVisible(false);
    };
    preference.addEventListener('change', onPreferenceChange);
    return () => {
      window.clearTimeout(show);
      preference.removeEventListener('change', onPreferenceChange);
    };
  }, []);
  if (!visible) return null;
  return (
    <div className={`intro ${styles.sequence}`} onAnimationEnd={(event) => {
      // Ignore child fade events; remove only after the homepage reveal.
      if (event.target === event.currentTarget) setVisible(false);
    }}>
      <Yantra className="intro-yantra" />
      <div className={styles.shlokas}>
        {shlokas.map((shloka) => <p lang="hi" key={shloka}>{shloka}</p>)}
      </div>
      <span className="eyebrow">{tr('A MOMENT OF STILLNESS. A JOURNEY WITHIN.')}</span>
      <button className="text-button" onClick={() => setVisible(false)}>{tr('Skip intro →')}</button>
    </div>
  );
}
