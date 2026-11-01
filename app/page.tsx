import SitePageView,{pageMetadata} from './site-page';
export const dynamic='force-dynamic';
export function generateMetadata(){return pageMetadata('home')}
export default function Page(){return <SitePageView slug="home"/>}
