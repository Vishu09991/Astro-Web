import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {cities} from '@/data/site';
export async function GET(request:NextRequest){
 const q=request.nextUrl.searchParams.get('q')?.trim()||'';if(q.length<2||q.length>80)return NextResponse.json({locations:[]});
 const fallback=cities.filter(c=>c.name.toLowerCase().includes(q.toLowerCase()));
 // Open-Meteo's customer endpoint is used only when a commercial-use key is configured.
 if(!process.env.GEOCODING_API_KEY)return NextResponse.json({locations:fallback,limited:true});
 try{const params=new URLSearchParams({name:q,count:'8',language:request.nextUrl.searchParams.get('language')==='hi'?'hi':'en',format:'json',apikey:process.env.GEOCODING_API_KEY});
 const response=await fetch(`https://customer-geocoding-api.open-meteo.com/v1/search?${params}`,{next:{revalidate:86400},signal:AbortSignal.timeout(7000)});if(!response.ok)throw Error();
 const parsed=z.object({results:z.array(z.object({id:z.number(),name:z.string(),country:z.string().optional(),admin1:z.string().optional(),latitude:z.number(),longitude:z.number(),timezone:z.string()})).optional()}).parse(await response.json());
 return NextResponse.json({locations:(parsed.results||[]).map(c=>({...c,id:String(c.id),name:[c.name,c.admin1,c.country].filter(Boolean).join(', ')})),limited:false});
 }catch{return NextResponse.json({locations:fallback,limited:true});}
}
