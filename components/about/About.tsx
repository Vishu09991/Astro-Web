'use client';
import {useLanguage} from '@/components/i18n/LanguageProvider';
import Image from 'next/image';
import {ArrowUpRight,Flower2} from 'lucide-react';
import {about} from '@/data/translations/about';
import {site} from '@/data/site';
import {Language} from '@/data/services';
import {LanguageToggle} from '@/components/ui/LanguageToggle';
export function About({language,onLanguage}:{language:Language;onLanguage:(l:Language)=>void}){const {t:tr}=useLanguage();const t=about[language];return <section id="about" className="section shell about" lang={language}><div className="portrait-frame">{site.portrait?<Image src={site.portrait} alt={tr("Shri Parashar Guruji")} fill sizes="(max-width:760px) 100vw,40vw"/>:<div className="portrait-placeholder"><Flower2 size={68} strokeWidth={.7}/><span lang="hi">श्री पराशर गुरुजी</span><small>{tr("PERSONAL PHOTOGRAPH TO BE ADDED")}</small></div>}<div className="portrait-label"><span className="portrait-sanskrit" lang="sa">श्री गुरवे नमः</span> <span>{tr("A life guided by devotion")}</span></div></div><div><div className="section-top"><span className="eyebrow">{language==='hi'?'परिचय':'About Guruji'}</span><LanguageToggle value={language} onChange={onLanguage}/></div><h2>{t.intro}</h2><p>{tr("Shri Parashar Guruji, lovingly called Bhaiiya, welcomes you to a space of devotion, thoughtful conversation, and traditional worship.")}</p><p>{t.body}</p><p>{t.philosophy}</p><a className="text-link" href="#contact">{t.link} <ArrowUpRight size={18}/></a></div></section>;}
