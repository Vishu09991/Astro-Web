export function contactEndpoint(){
 const id=process.env.FORMSPREE_FORM_ID?.trim();
 if(id&&/^[a-zA-Z0-9]{6,32}$/.test(id))return `https://formspree.io/f/${id}`;
 return process.env.CONTACT_WEBHOOK_URL||null;
}
