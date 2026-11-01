export const metadata={robots:{index:false,follow:false}};
import {requireChatGPTUser} from '../chatgpt-auth';import Dashboard from '../dashboard';export const dynamic='force-dynamic';export default async function Client(){await requireChatGPTUser('/cliente');return <Dashboard mode="client"/>}
