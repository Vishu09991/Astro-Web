'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { guruPhotos } from '@/data/guru-photos';
import styles from './GuruShloka.module.css';

export function GuruShloka() {
  const { language } = useLanguage();
  const [paused, setPaused] = useState(false);
  // Three duplicate panels make the final view identical to the initial view.
  const panels = [...guruPhotos, ...guruPhotos.slice(0, 3)];

  return (
    <section className={styles.section} aria-label={language === 'hi' ? 'गुरु वंदना' : 'Reverence to the Guru'}>
      <div className={styles.background} aria-hidden="true">
        <div className={styles.track} style={{ animationPlayState: paused ? 'paused' : 'running' }}>
          {panels.map((photo, index) => (
            <div className={styles.panel} key={`${photo.src}-${index}`}>
              <Image src={photo.src} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33.34vw" style={{ objectPosition: photo.position }} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.verse}>
        <span lang="hi" aria-hidden="true">ॐ</span>
        <p lang="hi">गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।<br />गुरुः साक्षात् परब्रह्म तस्मै श्रीगुरवे नमः॥</p>
      </div>
      <button className={styles.pause} type="button" onClick={() => setPaused(!paused)} aria-label={language === 'hi' ? (paused ? 'तस्वीरों का स्लाइडशो चलाएँ' : 'तस्वीरों का स्लाइडशो रोकें') : (paused ? 'Resume photo slideshow' : 'Pause photo slideshow')}>
        {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      </button>
    </section>
  );
}
