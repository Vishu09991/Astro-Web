'use client';
import {useLanguage} from '@/components/i18n/LanguageProvider';
import {useEffect,useState} from 'react';
import {MotionConfig} from 'motion/react';
import {Header} from './layout/Header';
import {Hero} from './landing/Hero';
import {Intro} from './landing/Intro';
import {About} from './about/About';
import {Services} from './services/Services';
import {Gallery} from './gallery/Gallery';
import {GuruShloka} from './gallery/GuruShloka';
import {LivePanchang} from './calendar/LivePanchang';
import {Calendar} from './calendar/Calendar';
import {Contact} from './contact/Contact';
import {Footer} from './layout/Footer';
import {cities,site} from '@/data/site';
import type {PanchangLocation} from '@/lib/panchang/live';
import {type Service} from '@/data/services';
export function Website({contactConfigured}:{contactConfigured:boolean}){const {t:tr}=useLanguage();const {language,setLanguage}=useLanguage();const [service,setService]=useState('general');const [location,updateLocation]=useState<PanchangLocation>(cities.find(city=>city.id===site.defaultCity)??cities[0]);useEffect(()=>{
 const timer=window.setTimeout(()=>{
   try {
     const saved=cities.find(city=>city.id===localStorage.getItem('guruji-panchang-city'));
     if(saved)updateLocation(saved);
   } catch {}
 },0);
 return ()=>window.clearTimeout(timer);
},[]);
function setLocation(next:PanchangLocation){
 updateLocation(next);
 try {
   if(cities.some(city=>city.id===next.id))localStorage.setItem('guruji-panchang-city',next.id);
   else localStorage.removeItem('guruji-panchang-city');
 } catch {}
}
const panchang={location,setLocation};function book(item:Service){setService(item.id);setTimeout(()=>{document.getElementById('contact')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.getElementById('selected-service')?.focus({preventScroll:true});},0);}return <MotionConfig reducedMotion="user"><a className="skip-link" href="#main">{tr("Skip to content")}</a><Intro/><Header/><main id="main"><Hero/><About language={language} onLanguage={setLanguage}/><LivePanchang {...panchang}/><Services language={language} onLanguage={setLanguage} onBook={book}/><GuruShloka/><Gallery/><Calendar {...panchang}/><Contact selectedService={service} onSelectedService={setService} configured={contactConfigured}/></main><Footer/></MotionConfig>;}

