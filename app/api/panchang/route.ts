import {NextRequest,NextResponse} from 'next/server';
import {cities} from '@/data/site';
import {getMonth} from '@/lib/panchang/provider';
export const maxDuration=300;
const pending=new Map<string,ReturnType<typeof getMonth>>();
export async function GET(request:NextRequest){const q=request.nextUrl.searchParams;const year=Number(q.get('year')),month=Number(q.get('month'));const city=cities.find(c=>c.id===q.get('city'));const tradition=q.get('tradition');const language=q.get('language')||'en';if((language!=='en'&&language!=='hi')||!Number.isInteger(year)||year<1900||year>2100||!Number.isInteger(month)||month<1||month>12||!city||(tradition!=='amanta'&&tradition!=='purnimanta'))return NextResponse.json({error:'Invalid calendar selection.'},{status:400});
 const key=`${year}-${month}-${city.id}-${tradition}-${language}`;
 if(pending.size>=3&&!pending.has(key))return NextResponse.json({error:'The calendar is busy. Please try again shortly.'},{status:429});
 const work=pending.get(key)||getMonth(year,month,city,tradition,language);pending.set(key,work);
 try{return NextResponse.json(await work,{headers:{'Cache-Control':'public, max-age=60, s-maxage=300'}});}catch{return NextResponse.json({error:'Panchang data is temporarily unavailable.'},{status:503});}finally{pending.delete(key);}}
