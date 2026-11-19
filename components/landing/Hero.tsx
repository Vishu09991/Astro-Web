'use client';
import {useLanguage} from '@/components/i18n/LanguageProvider';
import {site} from '@/data/site';
import {whatsappUrl} from '@/lib/contact';
import Image from 'next/image';
import { GaneshaMandala } from './GaneshaMandala';
import { ServicesMarquee } from './ServicesMarquee';
import {MessageCircle,ArrowDown} from 'lucide-react';
export function Hero(){const {t:tr,language}=useLanguage();const whatsapp=whatsappUrl(site.whatsapp,'','',language);return <><section id="home" className="hero shell"><div className="hero-copy"><h1>{tr("Ancient Vedic")} {tr("Wisdom for a")} <em>{tr("Harmonious Life.")}</em></h1><p>{language==='hi'?'श्री पराशर गुरुजी से वैदिक ज्योतिष और वास्तु शास्त्र पर परामर्श लें, या किसी पूजा और संस्कार की योजना बनाएँ।':'Consult Shri Parashar Guruji on Vedic Astrology and Vastu Shastra, or speak with him about arranging a puja or ceremony.'}</p><div className="hero-actions"><a className="button" href="#contact">{tr("Book a Consultation")}<ArrowUpRightIcon/></a>{whatsapp&&<a className="button secondary" href={whatsapp} target="_blank" rel="noopener noreferrer">{language==='hi'?'WhatsApp पर संपर्क करें':'Contact on WhatsApp'}<MessageCircle size={17}/></a>}</div></div><div className="hero-visual"><div className="hero-image"><GaneshaMandala/><Image src="/images/ganesha-diya-freestanding.webp" alt={language==='hi'?'भगवान गणेश की पीतल प्रतिमा और जलता हुआ दीपक':'Brass statue of Lord Ganesha beside a lit diya'} fill priority sizes="(max-width: 760px) 100vw, 48vw"/></div><div className="hero-verse"><span lang="hi">तमसो मा ज्योतिर्गमय</span><small>{tr("FROM DARKNESS, LEAD ME TO LIGHT")}</small></div></div><a className="scroll-note" href="#about"><ArrowDown size={14}/> {tr("About")}</a></section><ServicesMarquee/></>;}
function ArrowUpRightIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>;}

