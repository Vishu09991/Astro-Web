import tzLookup from 'tz-lookup';
import {cities} from '@/data/site';
import type {PanchangLocation} from './live';
export function resolveLocation(q:URLSearchParams):PanchangLocation|null{
 if(q.has('city'))return cities.find(c=>c.id===q.get('city'))||null;
 if(!q.get('latitude')?.trim()||!q.get('longitude')?.trim())return null;
 const lat=Number(q.get('latitude')),lon=Number(q.get('longitude'));
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return null;
 const latitude=Math.round(lat*1000)/1000,longitude=Math.round(lon*1000)/1000;
 try{return {id:`${latitude},${longitude}`,name:`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,latitude,longitude,timezone:tzLookup(latitude,longitude)};}catch{return null;}
}
