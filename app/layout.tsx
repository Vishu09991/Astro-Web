import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Shri Parashar Guruji | Vedic Wisdom & Sacred Traditions',description:'Explore Vedic Astrology, Vastu consultation, sacred pujas and rituals with Shri Parashar Guruji. Discover services, daily Panchang, and personal guidance.',applicationName:'Shri Parashar Guruji',icons:{icon:'/images/logo.svg'},openGraph:{title:'Shri Parashar Guruji',description:'Ancient Vedic Wisdom for a Harmonious Life',type:'website',locale:'en_IN'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
