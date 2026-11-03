'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import type {Language} from '@/data/services';
import {hindi} from '@/data/translations/site';
const Context=createContext({language:'en' as Language,setLanguage:(value:Language)=>{void value;},t:(text:string)=>text});
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setValue]=useState<Language>('en');
 useEffect(()=>{let saved:string|null=null;try{saved=localStorage.getItem('guruji-language');}catch{}const timer=setTimeout(()=>{if(saved==='hi')setValue('hi');},0);return()=>clearTimeout(timer);},[]);
 useEffect(()=>{document.documentElement.lang=language;},[language]);
 function setLanguage(value:Language){setValue(value);try{localStorage.setItem('guruji-language',value);}catch{}}
 const t=(text:string)=>language==='hi'?(hindi[text]??text):text;
 return <Context.Provider value={{language,setLanguage,t}}>{children}</Context.Provider>;
}
export const useLanguage=()=>useContext(Context);
