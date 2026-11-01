import {NextResponse,type NextRequest} from 'next/server';
import {listPages} from './app/pages';
import {redirectForUrl} from './app/page-routing';
export async function middleware(request:NextRequest){
 const url=new URL(request.url);
 // Leave authentication, API writes and all asset handling under their existing owners.
 if(!['GET','HEAD'].includes(request.method)||/^\/(?:api|admin|cliente|analytics|_next|_vinext|signin-with-chatgpt|signout-with-chatgpt|callback)(?:\/|$)/.test(url.pathname))return NextResponse.next();
 if(/\.[a-z0-9]+$/i.test(url.pathname))return NextResponse.next();
 const pages=await listPages(),location=redirectForUrl(url,pages);
 if(location)return NextResponse.redirect(location,301);
 const response=NextResponse.next();
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('X-Content-Type-Options','nosniff');
 return response;
}
export const config={matcher:['/((?!api/|admin|cliente|analytics|_next/|_vinext/).*)']};
