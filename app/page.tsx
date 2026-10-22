import {Website} from '@/components/Website';
export const dynamic='force-dynamic';
export default function Home(){return <Website contactConfigured={Boolean(process.env.CONTACT_WEBHOOK_URL)}/>;}
