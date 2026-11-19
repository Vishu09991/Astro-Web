import styles from './GaneshaMandala.module.css';

const petals = Array.from({ length: 12 }, (_, index) => index * 30);

export function GaneshaMandala() {
  return (
    <div className={styles.layer} aria-hidden="true">
      <svg className={styles.mandala} viewBox="-200 -200 400 400" fill="none" focusable="false">
        <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round">
          {petals.map(angle => (
            <g key={angle} transform={'rotate(' + angle + ')'}>
              <path d="M0 -70C-38 -98 -48 -132 0 -193C48 -132 38 -98 0 -70Z" />
              <path d="M0 -85C-27 -108 -29 -134 0 -171C29 -134 27 -108 0 -85Z" />
              <path d="M0 -98Q-14 -125 0 -151Q14 -125 0 -98Z" />
              <path d="M0 -43C-26 -63 -27 -86 0 -119C27 -86 26 -63 0 -43Z" transform="rotate(15)" />
              <path d="M-4 -135L0 -141L4 -135L0 -129Z" transform="rotate(15)" />
            </g>
          ))}
          <circle r="66" />
          <circle r="60" />
          <path d="M0-48L42-24V24L0 48L-42 24V-24Z M0-48L42 24H-42Z M0 48L-42-24H42Z" />
          <circle r="19" />
          <circle r="10" />
        </g>
      </svg>
    </div>
  );
}
