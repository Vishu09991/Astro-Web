import { useId } from 'react';
import styles from './GaneshaMandala.module.css';

const petals = Array.from({ length: 12 }, (_, index) => index * 30);
const lotusOutline = 'M0 -83C-30 -100 -42 -126 -25 -151C-17 -163 -5 -176 0 -188C5 -176 17 -163 25 -151C42 -126 30 -100 0 -83Z';
const smallPetal = 'M0 -66C-20 -80 -24 -99 -14 -115C-9 -124 -3 -130 0 -140C3 -130 9 -124 14 -115C24 -99 20 -80 0 -66Z';

export function GaneshaMandala() {
  const id = useId();
  const outer = id + '-outer';
  const inner = id + '-inner';
  const detail = id + '-detail';

  return (
    <div className={styles.layer} aria-hidden="true">
      <svg className={styles.mandala} viewBox="-200 -200 400 400" fill="none" focusable="false">
        <defs>
          <path id={outer} d={lotusOutline} />
          <path id={inner} d={smallPetal} />
          <g id={detail}>
            <path d="M0 -96C-23 -109 -33 -127 -20 -148C-13 -159 -4 -169 0 -177C4 -169 13 -159 20 -148C33 -127 23 -109 0 -96Z" />
            <path d="M0 -107C-5 -118 -15 -124 -15 -135C-15 -145 -6 -151 0 -162C6 -151 15 -145 15 -135C15 -124 5 -118 0 -107Z" />
            <path d="M0 -114V-152M0 -123Q-4 -130 -10 -134M0 -123Q4 -130 10 -134" />
            <path d="M-20 -114Q-23 -117 -23 -122M20 -114Q23 -117 23 -122" />
            <g fill="currentColor" stroke="none">
              <circle cy="-169" r="1.4" />
              <circle cx="-20" cy="-137" r="1.25" />
              <circle cx="20" cy="-137" r="1.25" />
              <circle cy="-102" r="1.3" />
            </g>
          </g>
        </defs>

        <g stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
          <g className={styles.emboss} transform="translate(.8 1)">
            {petals.map(angle => <use key={angle} href={'#' + outer} transform={'rotate(' + angle + ')'} />)}
            <circle r="72" />
          </g>

          <g strokeWidth="1.05">
            {petals.map(angle => (
              <g key={angle} transform={'rotate(' + angle + ')'}>
                <use href={'#' + outer} fill="currentColor" fillOpacity=".12" />
                <use href={'#' + detail} className={styles.engraving} strokeWidth=".85" />
                <path d="M0 -151L3 -156L0 -162L-3 -156Z" transform="rotate(15)" opacity=".75" />
              </g>
            ))}
          </g>

          <g className={styles.innerTier} strokeWidth="1">
            {petals.map(angle => (
              <g key={angle} transform={'rotate(' + (angle + 15) + ')'}>
                <use href={'#' + inner} fill="currentColor" fillOpacity=".1" />
                <path d="M0 -76C-14 -87 -16 -99 -8 -112L0 -127L8 -112C16 -99 14 -87 0 -76Z" />
                <path d="M0 -85Q-8 -98 0 -114Q8 -98 0 -85Z" />
              </g>
            ))}
          </g>

          <circle r="72" strokeWidth="1.2" />
          <circle r="67" strokeWidth=".8" />
          <circle r="62" strokeWidth="1.4" strokeDasharray="1 5" opacity=".7" />
          <circle r="57" strokeWidth=".75" />
          {petals.map(angle => (
            <path key={angle} d="M0 -23Q-13 -34 0 -53Q13 -34 0 -23Z" transform={'rotate(' + angle + ')'} strokeWidth=".85" opacity=".72" />
          ))}
          <path d="M0 -25L22 13H-22ZM0 25L-22 -13H22Z" strokeWidth="1" />
          <circle r="16" strokeWidth=".85" />
          <circle r="8" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}
