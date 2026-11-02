import {publicCatalog} from '../../commerce';
import {settings,publicSettings} from '../../settings';import {json} from '../../access';
export async function GET(){return json({settings:publicSettings(await settings()),packages:await publicCatalog()})}
