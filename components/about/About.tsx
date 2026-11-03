'use client';
import {useLanguage} from '@/components/i18n/LanguageProvider';
import Link from 'next/link';
import Image from 'next/image';
import {ArrowUpRight,Flower2} from 'lucide-react';
import {about} from '@/data/translations/about';
import {site} from '@/data/site';
import {Language} from '@/data/services';
import {LanguageToggle} from '@/components/ui/LanguageToggle';
export function About({language,onLanguage}:{language:Language;onLanguage:(l:Language)=>void}){const {t:tr}=useLanguage();const t=about[language];return <section id="about" className="section shell about" lang={language}><div className="portrait-frame">{site.portrait?<Image src={site.portrait} alt={tr("Shri Parashar Guruji")} fill sizes="(max-width:760px) 100vw,40vw"/>:<div className="portrait-placeholder"><Flower2 size={68} strokeWidth={.7}/><span lang="hi">श्री पराशर गुरुजी</span><small>{tr("PERSONAL PHOTOGRAPH TO BE ADDED")}</small></div>}<div className="portrait-label">श्री गुरवे नमः <span>{tr("A life guided by devotion")}</span></div></div><div><div className="section-top"><span className="eyebrow">01 / {t.eyebrow}</span><LanguageToggle value={language} onChange={onLanguage}/></div><h2>{t.title}</h2><h3>{t.intro}</h3><p>{t.body}</p><p>{t.philosophy}</p><p className="editorial-note">{t.placeholder}</p><Link className="text-link" href="/about">{tr("Read the full introduction")} <ArrowUpRight size={18}/></Link></div></section>;}
