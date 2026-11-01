import SitePageView,{pageMetadata} from '../site-page';
export const dynamic='force-dynamic';
export function generateMetadata(){return pageMetadata('puxar-dados-pelo-telefone')}
export default function Page(){return <SitePageView slug="puxar-dados-pelo-telefone"/>}
