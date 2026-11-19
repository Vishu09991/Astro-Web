import {NextRequest,NextResponse} from 'next/server';
import {resolveLocation} from '@/lib/panchang/location';
export function GET(request:NextRequest){const location=resolveLocation(request.nextUrl.searchParams);return NextResponse.json(location?{location}:{error:'Invalid coordinates'},{status:location?200:400,headers:{'Cache-Control':'no-store'}});}
