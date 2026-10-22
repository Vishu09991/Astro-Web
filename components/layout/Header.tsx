'use client';
import {useState} from 'react';
import {Menu,X,ArrowUpRight} from 'lucide-react';
import {Yantra} from '@/components/ui/Yantra';
const links=[['Home','home'],['About','about'],['Services','services'],['Gallery','gallery'],['Calendar','calendar']];
export function Header(){const [open,setOpen]=useState(false);return <header className="header"><div className="shell nav"><a href="#home" className="brand" aria-label="Shri Parashar Guruji home"><Yantra/><span>Shri Parashar Guruji<small>VEDIC WISDOM · SACRED TRADITIONS</small></span></a><nav className="desktop-nav" aria-label="Main navigation">{links.map(([name,id])=><a key={id} href={`#${id}`}>{name}</a>)}</nav><a className="nav-consult" href="#contact">Let’s connect <ArrowUpRight size={16}/></a><button className="menu-button icon-button" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls="mobile-nav" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div>{open&&<nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">{[...links,['Consulting / Contact','contact']].map(([name,id])=><a key={id} href={`#${id}`} onClick={()=>setOpen(false)}>{name}</a>)}</nav>}</header>;}
