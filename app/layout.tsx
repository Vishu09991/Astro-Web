import type {Metadata} from 'next';
import '@fontsource/noto-serif-devanagari/devanagari-400.css';
import './globals.css';
import './live-panchang.css';
import './editorial.css';
import {LanguageProvider} from '@/components/i18n/LanguageProvider';
export const metadata:Metadata={title:'Shri Parashar Guruji | Vedic Astrology, Vastu & Pujas',description:'Vedic astrology and Vastu consultations, pujas, and Hindu rites with Shri Parashar Guruji. View the daily Panchang and Vedic calendar.',applicationName:'Shri Parashar Guruji',icons:{icon:'/images/logo.svg'},openGraph:{title:'Shri Parashar Guruji',description:'Vedic astrology and Vastu consultations, pujas, and Hindu rites.',type:'website',locale:'en_IN'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><LanguageProvider>{children}</LanguageProvider></body></html>;}
