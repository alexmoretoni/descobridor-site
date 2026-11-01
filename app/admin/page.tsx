export const metadata={robots:{index:false,follow:false}};
import AdminLock from '../admin-lock';import {hasAdminSession,securityRecord} from '../admin-security';
import {requireChatGPTUser,chatGPTSignOutPath} from '../chatgpt-auth';import {identity} from '../access';import Dashboard from '../dashboard';
export const dynamic='force-dynamic';
export default async function Admin(){const user=await requireChatGPTUser('/admin');const {admin}=await identity();if(!admin)return <main style={{padding:60,fontFamily:'Arial'}}><h1>Acesso restrito</h1><p>Esta área é exclusiva do administrador.</p><a href="/cliente">Ir ao painel do cliente</a><p><a href={chatGPTSignOutPath('/admin')} target="_top">Sair e entrar com outra conta</a></p></main>;if(!await hasAdminSession(user.userId))return <AdminLock username={user.email} setup={!await securityRecord(user.userId)}/>;return <Dashboard mode="admin"/>}
