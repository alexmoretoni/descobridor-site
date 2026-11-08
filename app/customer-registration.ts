import {getDb} from '../db';
import {customers} from '../db/schema';
import {eq} from 'drizzle-orm';
export async function registeredCustomer(request:Request){
 const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('descobridor_customer='))?.slice('descobridor_customer='.length)||'';
 if(!/^[a-f0-9-]{36}$/.test(token))return null;
 const [customer]=await getDb().select().from(customers).where(eq(customers.id,'registration-'+token)).limit(1);
 return customer||null;
}
