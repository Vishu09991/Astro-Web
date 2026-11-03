import {z} from 'zod';
import {cities} from '@/data/site';
import {atSunrise,localNoon,monthDates,providerSchema,type DayData,type MonthData} from './types';
let token:{value:string;expires:number}|undefined;
let tokenRequest:Promise<string>|undefined;
const cache=new Map<string,{value:Promise<DayData>;expires:number}>();
async function accessToken(){
 if(token&&token.expires>Date.now())return token.value;
 if(tokenRequest)return tokenRequest;
 tokenRequest=(async()=>{const res=await fetch('https://api.prokerala.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',client_id:process.env.PROKERALA_CLIENT_ID!,client_secret:process.env.PROKERALA_CLIENT_SECRET!}),signal:AbortSignal.timeout(15000),cache:'no-store'});if(!res.ok)throw new Error('Authentication unavailable');const result=z.object({access_token:z.string(),expires_in:z.number()}).parse(await res.json());token={value:result.access_token,expires:Date.now()+Math.max(0,result.expires_in-60)*1000};return token.value;})();
 try{return await tokenRequest;}finally{tokenRequest=undefined;}
}
async function day(date:string,city:typeof cities[number],language:'en'|'hi'):Promise<DayData>{
 const key=`${date}:${city.id}:${language}`;const existing=cache.get(key);if(existing&&existing.expires>Date.now())return existing.value;
 if(cache.size>400)cache.delete(cache.keys().next().value!);
 const value=(async():Promise<DayData>=>{try{
 const params=new URLSearchParams({ayanamsa:'1',coordinates:`${city.latitude},${city.longitude}`,datetime:localNoon(date,city.timezone),timezone:city.timezone,la:language});
 const response=await fetch(`https://api.prokerala.com/v2/astrology/panchang/advanced?${params}`,{headers:{Authorization:`Bearer ${await accessToken()}`},signal:AbortSignal.timeout(20000),cache:'no-store'});
 if(response.status===401)token=undefined;
 if(!response.ok)throw new Error('Provider unavailable');
 const envelope=z.object({status:z.literal('ok'),data:providerSchema}).parse(await response.json());
 if(!atSunrise(envelope.data.tithi,envelope.data.sunrise)||!atSunrise(envelope.data.nakshatra,envelope.data.sunrise))throw new Error('Missing sunrise transition');
 return {date,status:'available',data:envelope.data};
 }catch{return {date,status:'unavailable',reason:'Verified Panchang data is currently unavailable for this date.'};}})();
 cache.set(key,{value,expires:Date.now()+6*60*60*1000});
 const result=await value;if(result.status==='unavailable')cache.set(key,{value,expires:Date.now()+60000});return result;
}
export async function getMonth(year:number,month:number,city:typeof cities[number],tradition:'amanta'|'purnimanta',language:'en'|'hi'='en'):Promise<MonthData>{
 const dates=monthDates(year,month);const days:DayData[]=[];
 if(!process.env.PROKERALA_CLIENT_ID||!process.env.PROKERALA_CLIENT_SECRET){dates.forEach(date=>days.push({date,status:'unavailable',reason:'Panchang data is unavailable. The verified data connection has not been configured.'}));}
 else { // Bound concurrent calls; preserve all provider transitions rather than guessing daily values.
 for(let i=0;i<dates.length;i+=2){days.push(...await Promise.all(dates.slice(i,i+2).map(date=>day(date,city,language))));}}
 let festivals:MonthData['festivals']=[];let festivalStatus:MonthData['festivalStatus']='unavailable';
 if(process.env.PANCHANG_FESTIVALS_URL){try{
 const url=new URL(process.env.PANCHANG_FESTIVALS_URL);if(url.protocol!=='https:')throw new Error('HTTPS required');
 for(const [key,value] of Object.entries({year,month,latitude:city.latitude,longitude:city.longitude,timezone:city.timezone,tradition,language}))url.searchParams.set(key,String(value));
 const response=await fetch(url,{headers:process.env.PANCHANG_FESTIVALS_TOKEN?{Authorization:`Bearer ${process.env.PANCHANG_FESTIVALS_TOKEN}`}:{},signal:AbortSignal.timeout(15000),next:{revalidate:21600}});
 if(!response.ok)throw new Error('Unavailable');
 const parsed=z.object({tradition:z.enum(['amanta','purnimanta']),timezone:z.string(),festivals:z.array(z.object({date:z.iso.date(),name:z.string().min(1),kind:z.string().min(1)}))}).parse(await response.json());
 if(parsed.tradition!==tradition||parsed.timezone!==city.timezone||parsed.festivals.some(f=>!dates.includes(f.date)))throw new Error('Mismatched calendar');
 festivals=parsed.festivals;festivalStatus='available';
 }catch{ /* Unavailable is explicit; festival dates are never inferred from tithi alone. */ }}
 return {days,festivals,festivalStatus,source:'Prokerala · Lahiri ayanamsa',message:days.every(d=>d.status==='unavailable')?'Panchang data is unavailable. Dates remain browsable; no unverified lunar values are displayed.':undefined};
}
