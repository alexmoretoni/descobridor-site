import SitePageView,{pageMetadata} from '../site-page';
export const dynamic='force-dynamic';
export function generateMetadata(){return pageMetadata('localizar-pessoa-pelo-cpf')}
export default function Page(){return <SitePageView slug="localizar-pessoa-pelo-cpf"/>}
