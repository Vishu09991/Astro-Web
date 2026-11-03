'use client';
import {useLanguage} from '@/components/i18n/LanguageProvider';
export default function ErrorPage({reset}:{reset:()=>void}){const {t:tr}=useLanguage();return <main className="shell section"><h1>{tr("A moment of pause.")}</h1><p>{tr("Something went wrong while opening this page. Please try again.")}</p><button className="button" onClick={reset}>{tr("Try again")}</button></main>;}
