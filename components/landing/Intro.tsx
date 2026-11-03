'use client';
import {useLanguage} from '@/components/i18n/LanguageProvider';
import {useEffect,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {Yantra} from '@/components/ui/Yantra';
export function Intro(){const {t:tr}=useLanguage();
 const [visible,setVisible]=useState(false);const reduced=useReducedMotion();
 useEffect(()=>{if(reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;try{if(sessionStorage.getItem('guruji-intro'))return;sessionStorage.setItem('guruji-intro','seen');}catch{}const show=setTimeout(()=>setVisible(true),0);const hide=setTimeout(()=>setVisible(false),2200);return()=>{clearTimeout(show);clearTimeout(hide);};},[reduced]);
 return <AnimatePresence>{visible&&<motion.div className="intro" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:.45}}><Yantra className="intro-yantra"/><p lang="hi">ॐ गं गणपतये नमः॥</p><span className="eyebrow">{tr("A MOMENT OF STILLNESS. A JOURNEY WITHIN.")}</span><button className="text-button" onClick={()=>setVisible(false)}>{tr("Skip intro →")}</button></motion.div>}</AnimatePresence>;
}
