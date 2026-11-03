import {NextRequest,NextResponse} from 'next/server';
import {contactSchema} from '@/lib/contact';
import {contactEndpoint} from '@/lib/contact-delivery';
import {services} from '@/data/services';
export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:'This request is not allowed.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>16000)return NextResponse.json({error:'Your message is too large.'},{status:413});
 let input;try{const body=await request.text();if(body.length>16000)return NextResponse.json({error:'Your message is too large.'},{status:413});input=contactSchema.safeParse(JSON.parse(body));}catch{return NextResponse.json({error:'Please check the form and try again.'},{status:400});}
 if(!input.success)return NextResponse.json({error:input.error.issues[0]?.message||'Please check the form.'},{status:400});
 const endpoint=contactEndpoint();
 if(!endpoint)return NextResponse.json({error:'Online enquiries are not configured yet. Your message has not been sent. Please call or use WhatsApp.'},{status:503});
 try{const url=new URL(endpoint);if(url.protocol!=='https:')throw new Error('HTTPS required');const {website,...payload}=input.data;void website;
 const response=await fetch(url,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','Accept':'application/json',...(url.hostname!=='formspree.io'&&process.env.CONTACT_WEBHOOK_TOKEN?{Authorization:`Bearer ${process.env.CONTACT_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify({...payload,subject:'Consultation enquiry — Shri Parashar Guruji',service:services.find(s=>s.id===payload.service)?.name.en||'General consultation',serviceId:payload.service,source:'Shri Parashar Guruji website'}),signal:AbortSignal.timeout(15000),cache:'no-store'});
 if(!response.ok)throw new Error('Delivery failed');if(url.hostname==='formspree.io'){const result=await response.json();if(result.ok!==true)throw new Error('Not accepted');}return NextResponse.json({message:'Your enquiry has been accepted. A consultation is not confirmed until you receive a reply.'});
 }catch{return NextResponse.json({error:'Delivery could not be confirmed. Please try again later or use the contact details when available.'},{status:502});}
}
