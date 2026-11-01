import {GET as getDashboard,dashboardPost} from '../../dashboard-api';
export const GET=getDashboard;
export async function POST(request:Request){return dashboardPost(request)}
