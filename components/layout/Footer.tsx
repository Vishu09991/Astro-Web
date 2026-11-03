'use client';
import {useLanguage} from '@/components/i18n/LanguageProvider';
import Link from 'next/link';
import {Yantra} from '@/components/ui/Yantra';
export function Footer(){const {t:tr}=useLanguage();return <footer><div className="shell footer-main"><Link href="/#home" className="brand"><Yantra/><span>{tr("Shri Parashar Guruji")}<small>{tr("VEDIC WISDOM · SACRED TRADITIONS")}</small></span></Link><p>{tr("Ancient wisdom.")}<br/>{tr("A more harmonious tomorrow.")}</p><Link href="/#home" className="text-link">{tr("Back to top ↑")}</Link></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} {tr("Shri Parashar Guruji. All rights reserved.")}</span><span>{tr("Tradition with reverence. Guidance with care.")}</span></div></footer>;}

