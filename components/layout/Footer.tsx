'use client';

import { useLanguage } from '@/components/i18n/LanguageProvider';
import { Yantra } from '@/components/ui/Yantra';
import { site } from '@/data/site';
import { whatsappUrl } from '@/lib/contact';
import { sectionLinks } from './sectionLinks';

export function Footer() {
  const { t, language } = useLanguage();
  const whatsapp = whatsappUrl(site.whatsapp, '', '', language);

  return (
    <footer>
      <div className="shell footer-main">
        <a href="#home" className="brand"><Yantra /><span>{t('Shri Parashar Guruji')}<small>{t('VEDIC WISDOM · SACRED TRADITIONS')}</small></span></a>
        <p>{t('Ancient wisdom.')}<br />{t('A more harmonious tomorrow.')}</p>
        <nav className="footer-quick-links" aria-label={language === 'hi' ? 'त्वरित नेविगेशन' : 'Quick navigation'}>
          {sectionLinks.slice(1).map(([name, id]) => <a key={id} href={'#' + id}>{name === 'Live Panchang' && language === 'hi' ? 'दैनिक पंचांग' : t(name)}</a>)}
        </nav>
        <div className="footer-contact-links">
          {site.phone && <a href={'tel:' + site.phone.replace(/\s/g, '')}>{site.phone}</a>}
          {site.email && <a href={'mailto:' + site.email}>{site.email}</a>}
          {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer">{t('WhatsApp Enquiry')}</a>}
        </div>
        <a href="#home" className="text-link">{t('Back to top ↑')}</a>
      </div>
      <div className="shell footer-bottom"><span>© {new Date().getFullYear()} {t('Shri Parashar Guruji. All rights reserved.')}</span><span>{t('Tradition with reverence. Guidance with care.')}</span></div>
    </footer>
  );
}
