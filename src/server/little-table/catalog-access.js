/**
 * @param {Request} request
 * @param {{supabaseUrl:string,supabaseAnonKey:string}} settings
 * @param {typeof fetch} fetcher
 */
export async function authorizeCatalog(request,settings,fetcher=fetch){
 const bearer=request.headers.get('authorization')||'';
 if(!/^Bearer [^\s]+$/i.test(bearer))return {status:401,error:'LOGIN_REQUIRED'};
 const headers={apikey:settings.supabaseAnonKey,Authorization:bearer};
 try{
  const response=await fetcher(settings.supabaseUrl+'/auth/v1/user',{headers,cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!response.ok)return {status:response.status>=500?503:401,error:response.status>=500?'AUTH_UNAVAILABLE':'LOGIN_REQUIRED'};
  const user=await response.json();
  if(!user.id||!user.email_confirmed_at)return {status:403,error:'EMAIL_VERIFICATION_REQUIRED'};
  const member=await fetcher(settings.supabaseUrl+'/rest/v1/profiles?id=eq.'+encodeURIComponent(user.id)+'&select=status',{headers,cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!member.ok)return {status:503,error:'AUTH_UNAVAILABLE'};
  const rows=await member.json();
  if(rows[0]?.status!=='approved')return {status:403,error:'APPROVAL_REQUIRED'};
  return {status:200,error:null};
 }catch{return {status:503,error:'AUTH_UNAVAILABLE'};}
}
