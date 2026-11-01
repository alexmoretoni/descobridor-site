import {settings,publicSettings} from '../../settings';import {getDb} from '../../../db';import {packages} from '../../../db/schema';import {eq} from 'drizzle-orm';import {json} from '../../access';
export async function GET(){return json({settings:publicSettings(await settings()),packages:await getDb().select().from(packages).where(eq(packages.active,1))})}
