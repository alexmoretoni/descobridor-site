import SitePageView,{pageMetadata} from '../site-page';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){return pageMetadata((await params).slug)}
export default async function DynamicPage({params}:{params:Promise<{slug:string}>}){return <SitePageView slug={(await params).slug}/>}
