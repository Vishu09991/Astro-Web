import {z} from 'zod';
export const transitionSchema=z.object({name:z.string().min(1),start:z.iso.datetime({offset:true}),end:z.iso.datetime({offset:true}),paksha:z.string().optional()});
const periodSchema=z.object({name:z.string(),period:z.array(z.object({start:z.iso.datetime({offset:true}),end:z.iso.datetime({offset:true})}))});
export const providerSchema=z.object({sunrise:z.iso.datetime({offset:true}),sunset:z.iso.datetime({offset:true}),tithi:z.array(transitionSchema).min(1),nakshatra:z.array(transitionSchema).min(1),yoga:z.array(transitionSchema).min(1),karana:z.array(transitionSchema).min(1),auspicious_period:z.array(periodSchema).optional(),inauspicious_period:z.array(periodSchema).optional()});
export type Transition=z.infer<typeof transitionSchema>;
export type Panchang=z.infer<typeof providerSchema>;
export type DayData={date:string;status:'available'|'unavailable';data?:Panchang;reason?:string};
export type Festival={date:string;name:string;kind:string};
export type MonthData={days:DayData[];festivals:Festival[];festivalStatus:'available'|'unavailable';message?:string;source:string};
export function atSunrise(items:Transition[],sunrise:string){const time=Date.parse(sunrise);return items.find(item=>Date.parse(item.start)<=time&&Date.parse(item.end)>time);}
export function dateInZone(date:Date,timezone:string){return new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
// Resolve local noon using the IANA time zone, including daylight-saving offsets.
export function localNoon(date:string,timezone:string){const base=Date.parse(`${date}T12:00:00Z`);let instant=base;for(let i=0;i<3;i++){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(instant));const get=(name:string)=>Number(parts.find(p=>p.type===name)?.value);const local=Date.UTC(get('year'),get('month')-1,get('day'),get('hour'),get('minute'),get('second'));instant+=base-local;}return new Date(instant).toISOString();}
export function monthDates(year:number,month:number){return Array.from({length:new Date(Date.UTC(year,month,0)).getUTCDate()},(_,i)=>`${year}-${String(month).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`);}
