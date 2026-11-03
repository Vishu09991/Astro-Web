import {Website} from '@/components/Website';
import {contactEndpoint} from '@/lib/contact-delivery';
export const dynamic='force-dynamic';
export default function Home(){return <Website contactConfigured={Boolean(contactEndpoint())}/>;}
