const crypto = require('crypto');

const COOKIE = 'kaizen_google_session';
const STATE_COOKIE = 'kaizen_google_oauth_state';
const SCOPES = [
  'openid','email','profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/tasks'
];

function env(name){
  const v = process.env[name];
  if(!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}
function key(){ return crypto.createHash('sha256').update(env('KAIZEN_SESSION_SECRET')).digest(); }
function enc(obj){
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(obj),'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv,tag,data]).toString('base64url');
}
function dec(s){
  const b = Buffer.from(s,'base64url');
  const iv=b.subarray(0,12), tag=b.subarray(12,28), data=b.subarray(28);
  const d=crypto.createDecipheriv('aes-256-gcm',key(),iv); d.setAuthTag(tag);
  return JSON.parse(Buffer.concat([d.update(data),d.final()]).toString('utf8'));
}
function parseCookies(req){
  return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return [decodeURIComponent(x.slice(0,i)),decodeURIComponent(x.slice(i+1))]}));
}
function setCookie(res,name,value,opts={}){
  const parts=[`${name}=${encodeURIComponent(value)}`,'Path=/','HttpOnly','Secure','SameSite=Lax'];
  if(opts.maxAge!=null) parts.push(`Max-Age=${opts.maxAge}`);
  res.setHeader('Set-Cookie',parts.join('; '));
}
function addCookie(res,name,value,opts={}){
  const existing=res.getHeader('Set-Cookie');
  const parts=[`${name}=${encodeURIComponent(value)}`,'Path=/','HttpOnly','Secure','SameSite=Lax'];
  if(opts.maxAge!=null) parts.push(`Max-Age=${opts.maxAge}`);
  const c=parts.join('; ');
  res.setHeader('Set-Cookie', existing ? (Array.isArray(existing)?[...existing,c]:[existing,c]) : c);
}
function clearCookie(res,name){ addCookie(res,name,'',{maxAge:0}); }
function authUrl(state){
  const u=new URL('https://accounts.google.com/o/oauth2/v2/auth');
  u.searchParams.set('client_id',env('GOOGLE_CLIENT_ID'));
  u.searchParams.set('redirect_uri',env('GOOGLE_REDIRECT_URI'));
  u.searchParams.set('response_type','code');
  u.searchParams.set('scope',SCOPES.join(' '));
  u.searchParams.set('access_type','offline');
  u.searchParams.set('include_granted_scopes','true');
  u.searchParams.set('prompt','consent');
  u.searchParams.set('state',state);
  return u.toString();
}
async function tokenExchange(code){
  const body=new URLSearchParams({code,client_id:env('GOOGLE_CLIENT_ID'),client_secret:env('GOOGLE_CLIENT_SECRET'),redirect_uri:env('GOOGLE_REDIRECT_URI'),grant_type:'authorization_code'});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!r.ok) throw new Error(`Google token exchange failed: ${await r.text()}`);
  const t=await r.json(); t.expires_at=Date.now()+(t.expires_in||3600)*1000; return t;
}
async function refresh(tokens){
  if(tokens.access_token && tokens.expires_at && Date.now() < tokens.expires_at-60000) return tokens;
  if(!tokens.refresh_token) throw new Error('Google session expired; reconnect required.');
  const body=new URLSearchParams({refresh_token:tokens.refresh_token,client_id:env('GOOGLE_CLIENT_ID'),client_secret:env('GOOGLE_CLIENT_SECRET'),grant_type:'refresh_token'});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!r.ok) throw new Error(`Google token refresh failed: ${await r.text()}`);
  const n=await r.json(); return {...tokens,...n,refresh_token:tokens.refresh_token,expires_at:Date.now()+(n.expires_in||3600)*1000};
}
async function session(req,res){
  const raw=parseCookies(req)[COOKIE]; if(!raw) return null;
  let tokens=dec(raw); const fresh=await refresh(tokens);
  if(fresh.access_token!==tokens.access_token) addCookie(res,COOKIE,enc(fresh),{maxAge:60*60*24*30});
  return fresh;
}
async function googleFetch(tokens,url,opts={}){
  const r=await fetch(url,{...opts,headers:{...(opts.headers||{}),Authorization:`Bearer ${tokens.access_token}`}});
  if(!r.ok) throw new Error(`Google API ${r.status}: ${await r.text()}`);
  if(r.status===204) return null; return r.json();
}
module.exports={COOKIE,STATE_COOKIE,authUrl,parseCookies,setCookie,addCookie,clearCookie,tokenExchange,enc,dec,session,googleFetch};
