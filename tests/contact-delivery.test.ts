import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NextRequest} from 'next/server';
import {POST} from '../app/api/contact/route';
import {whatsappUrl} from '../lib/contact';
import {hindi} from '../data/translations/site';
test('Formspree submission forwards validated fields and reports only acceptance',async()=>{
 const originalFetch=global.fetch;const originalId=process.env.FORMSPREE_FORM_ID;const originalWebhook=process.env.CONTACT_WEBHOOK_URL;
 const request=()=>new NextRequest('http://localhost/api/contact',{method:'POST',headers:{origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify({name:'Test Visitor',phone:'+91 78781 49322',email:'visitor@example.com',service:'general',message:'Please arrange a consultation.',website:''})});
 try{
 process.env.FORMSPREE_FORM_ID='testform';delete process.env.CONTACT_WEBHOOK_URL;
 let captured:Record<string,string>|undefined;
 global.fetch=async(url,options)=>{assert.equal(String(url),'https://formspree.io/f/testform');captured=JSON.parse(String(options?.body));return Response.json({ok:true});};
 const accepted=await POST(request());assert.equal(accepted.status,200);assert.equal(captured?.service,'General consultation');assert.equal(captured?.email,'visitor@example.com');
 global.fetch=async()=>Response.json({ok:false},{status:200});assert.equal((await POST(request())).status,502);
 global.fetch=async()=>Response.json({error:'quota'},{status:429});assert.equal((await POST(request())).status,502);
 delete process.env.FORMSPREE_FORM_ID;assert.equal((await POST(request())).status,503);
 }finally{global.fetch=originalFetch;if(originalId===undefined)delete process.env.FORMSPREE_FORM_ID;else process.env.FORMSPREE_FORM_ID=originalId;if(originalWebhook===undefined)delete process.env.CONTACT_WEBHOOK_URL;else process.env.CONTACT_WEBHOOK_URL=originalWebhook;}
});
test('Hindi WhatsApp message preserves service and visitor message',()=>{const url=whatsappUrl('917878149322','गणेश पूजा','घर पर आयोजन','hi')!;const message=new URL(url).searchParams.get('text')!;assert.match(message,/नमस्ते गुरुजी/);assert.match(message,/गणेश पूजा/);assert.match(message,/घर पर आयोजन/);assert.equal(hindi['Home'],'मुख्य पृष्ठ');});
