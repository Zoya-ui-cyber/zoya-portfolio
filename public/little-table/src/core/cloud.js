const cfg=window.LITTLE_TABLE_CONFIG||{};
function authRedirect(){
 const here=new URL(location.href);
 if(['127.0.0.1','localhost','[::1]'].includes(here.hostname))return here.origin+here.pathname;
 return cfg.redirectUrl||here.origin+here.pathname;
}
export const cloudConfigured=Boolean(/^https:\/\/[a-z0-9.-]+$/i.test(cfg.supabaseUrl||'')&&cfg.supabaseAnonKey);
let session=null;try{session=JSON.parse(localStorage.getItem('little-table-session'));}catch{}
export function currentSession(){return session;}
export function clearSession(){session=null;localStorage.removeItem('little-table-session');}
function saveSession(s){session={...s,expires_at:s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600)};localStorage.setItem('little-table-session',JSON.stringify(session));}
async function request(path,{method='GET',body,token,prefer}={}){
 if(!cloudConfigured)throw Error('CLOUD_NOT_CONFIGURED');
 const signal=AbortSignal.timeout(15000);const res=await fetch(cfg.supabaseUrl+path,{method,signal,headers:{apikey:cfg.supabaseAnonKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(prefer?{Prefer:prefer}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 const data=await res.json().catch(()=>null);if(!res.ok)throw Error(data?.msg||data?.message||data?.error_description||data?.error||'REQUEST_FAILED');return data;
}
export async function accessToken(){if(!session)return null;if(session.expires_at<Date.now()/1000+60){const data=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});saveSession(data);}return session.access_token;}
export async function initializeAuth(){const h=new URLSearchParams(location.hash.slice(1));if(h.has('access_token')){const access=h.get('access_token'),user=await request('/auth/v1/user',{token:access});saveSession({access_token:access,refresh_token:h.get('refresh_token'),expires_in:Number(h.get('expires_in')||3600),user});const recovery=h.get('type')==='recovery';history.replaceState(null,'',location.pathname+location.search+(recovery?'#reset-password':'#profile'));}if(session){const user=await request('/auth/v1/user',{token:await accessToken()});session.user=user;saveSession(session);}return session;}
export async function signIn(email,password){const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});saveSession(data);return data;}
export async function signUp(email,password,name){return request('/auth/v1/signup?redirect_to='+encodeURIComponent(authRedirect()),{method:'POST',body:{email,password,data:{display_name:name}}});}
export async function signOut(){try{await request('/auth/v1/logout',{method:'POST',token:await accessToken()});}finally{clearSession();}}
export async function passwordEmail(email){return request('/auth/v1/recover?redirect_to='+encodeURIComponent(authRedirect()),{method:'POST',body:{email}});}
export async function resetPassword(password){return request('/auth/v1/user',{method:'PUT',token:await accessToken(),body:{password}});}
export async function db(path,opts={}){return request('/rest/v1/'+path,{...opts,token:await accessToken()});}
export async function rpc(name,body={}){return db('rpc/'+name,{method:'POST',body});}
export async function getProfile(){if(!session)return null;const rows=await db('profiles?id=eq.'+encodeURIComponent(session.user.id)+'&select=id,display_name,email,status,is_admin');return rows[0];}
export async function loadPrivate(){const rows=await db('private_state?user_id=eq.'+encodeURIComponent(session.user.id)+'&select=payload');return rows[0]?.payload;}
export async function savePrivate(payload){return db('private_state?on_conflict=user_id',{method:'POST',prefer:'resolution=merge-duplicates',body:{user_id:session.user.id,payload,updated_at:new Date().toISOString()}});}
