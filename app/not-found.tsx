'use client';
import {useLanguage} from '@/components/i18n/LanguageProvider';
import Link from 'next/link';
export default function NotFound(){const {t:tr}=useLanguage();return <main className="shell section"><span className="eyebrow">404</span><h1>{tr("Page not found")}</h1><Link className="button" href="/">{tr("Return home")}</Link></main>;}
