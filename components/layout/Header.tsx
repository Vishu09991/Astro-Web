'use client';
import Link from 'next/link';
import {useLanguage} from '@/components/i18n/LanguageProvider';
import {LanguageToggle} from '@/components/ui/LanguageToggle';
import {useState} from 'react';
import {Menu,X,ArrowUpRight} from 'lucide-react';
import {Yantra} from '@/components/ui/Yantra';
const links=[['Home','home'],['About','about'],['Services','services'],['Gallery','gallery'],['Calendar','calendar']];
export function Header(){const [open,setOpen]=useState(false);const {language,setLanguage,t}=useLanguage();return <header className="header"><div className="shell nav"><Link href="/#home" className="brand" aria-label={t("Shri Parashar Guruji home")}><Yantra/><span>{t("Shri Parashar Guruji")}<small>{t("VEDIC WISDOM · SACRED TRADITIONS")}</small></span></Link><nav className="desktop-nav" aria-label={t("Main navigation")}>{links.map(([name,id])=><Link key={id} href={id==='about'?'/about':`/#${id}`}>{t(name)}</Link>)}</nav><LanguageToggle value={language} onChange={setLanguage}/><Link className="nav-consult" href="/#contact">{t("Let’s connect")} <ArrowUpRight size={16}/></Link><button className="menu-button icon-button" aria-label={t(open?'Close menu':'Open menu')} aria-expanded={open} aria-controls="mobile-nav" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div>{open&&<nav id="mobile-nav" className="mobile-nav" aria-label={t("Mobile navigation")}>{[...links,['Consulting / Contact','contact']].map(([name,id])=><Link key={id} href={id==='about'?'/about':`/#${id}`} onClick={()=>setOpen(false)}>{t(name)}</Link>)}</nav>}</header>;}
