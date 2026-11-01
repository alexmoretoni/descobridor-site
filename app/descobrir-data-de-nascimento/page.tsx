import SitePageView,{pageMetadata} from '../site-page';
export const dynamic='force-dynamic';
export function generateMetadata(){return pageMetadata('descobrir-data-de-nascimento')}
export default function Page(){return <SitePageView slug="descobrir-data-de-nascimento"/>}
