'use client';
import {useState} from 'react';
import {MotionConfig} from 'motion/react';
import {Header} from './layout/Header';
import {Hero} from './landing/Hero';
import {Intro} from './landing/Intro';
import {About} from './about/About';
import {Services} from './services/Services';
import {Gallery} from './gallery/Gallery';
import {Calendar} from './calendar/Calendar';
import {Contact} from './contact/Contact';
import {Footer} from './layout/Footer';
import {type Language,type Service} from '@/data/services';
export function Website({contactConfigured}:{contactConfigured:boolean}){const [language,setLanguage]=useState<Language>('en');const [service,setService]=useState('general');function book(item:Service){setService(item.id);setTimeout(()=>{document.getElementById('contact')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.getElementById('selected-service')?.focus({preventScroll:true});},0);}return <MotionConfig reducedMotion="user"><a className="skip-link" href="#main">Skip to content</a><Intro/><Header/><main id="main"><Hero/><About language={language} onLanguage={setLanguage}/><Services language={language} onLanguage={setLanguage} onBook={book}/><div className="verse-band"><span>ॐ</span><p lang="hi">गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।<br/>गुरुः साक्षात् परब्रह्म तस्मै श्रीगुरवे नमः॥</p><small>WITH REVERENCE TO THE GURU, THE LIGHT OF WISDOM.</small></div><Gallery/><Calendar/><Contact selectedService={service} onSelectedService={setService} configured={contactConfigured}/></main><Footer/></MotionConfig>;}
