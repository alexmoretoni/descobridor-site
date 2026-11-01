import {getDb} from '../db';
import {siteSettings} from '../db/schema';
import {eq} from 'drizzle-orm';
export async function mcpEnabled(){const [r]=await getDb().select().from(siteSettings).where(eq(siteSettings.id,'mcp-policy'));if(!r)return true;try{return JSON.parse(r.value).enabled===true}catch{return false}}
