'use client';

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useLanguage } from '@/components/i18n/LanguageProvider';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Yantra } from '@/components/ui/Yantra';
import { sectionLinks } from './sectionLinks';

export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('home');
  const bar = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const sections = sectionLinks.map(([, id]) => document.getElementById(id));
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const readingLine = (bar.current?.getBoundingClientRect().bottom ?? 0) + 34;
        const current = sections.findLast(section => section && section.getBoundingClientRect().top <= readingLine);
        setActive(current?.id ?? 'home');
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(frame);
    };
  }, []);

  const closeMenu = () => flushSync(() => setOpen(false));
  const links = (mobile = false) => sectionLinks.map(([name, id]) => (
    <a key={id} href={'#' + id} aria-current={active === id ? 'location' : undefined} onClick={mobile ? closeMenu : undefined}>
      {name === 'Live Panchang' && language === 'hi' ? 'दैनिक पंचांग' : t(name)}
    </a>
  ));

  return (
    <header className="header">
      <div className="shell nav" ref={bar}>
        <a href="#home" className="brand" aria-label={t('Shri Parashar Guruji home')} onClick={open ? closeMenu : undefined}>
          <Yantra />
          <span>{t('Shri Parashar Guruji')}</span>
        </a>
        <nav className="desktop-nav" aria-label={t('Main navigation')}>{links()}</nav>
        <LanguageToggle value={language} onChange={setLanguage} />
        <a className="nav-consult" href="#contact" onClick={open ? closeMenu : undefined}>{t('Book a Consultation')} <ArrowUpRight size={16} /></a>
        <button className="menu-button icon-button" aria-label={t(open ? 'Close menu' : 'Open menu')} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav id="mobile-nav" className="mobile-nav" aria-label={t('Mobile navigation')}>{links(true)}</nav>}
    </header>
  );
}
