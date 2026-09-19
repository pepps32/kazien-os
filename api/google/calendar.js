const {session,googleFetch}=require('../_lib/google');
module.exports=async(req,res)=>{
 try{
  const s=await session(req,res); if(!s) return res.status(401).json({error:'not_connected'});
  if(req.method==='GET'){
   const u=new URL(req.url,`https://${req.headers.host}`); const timeMin=u.searchParams.get('timeMin')||new Date(Date.now()-86400000).toISOString(); const timeMax=u.searchParams.get('timeMax')||new Date(Date.now()+7*86400000).toISOString();
   const g=new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');g.searchParams.set('singleEvents','true');g.searchParams.set('orderBy','startTime');g.searchParams.set('timeMin',timeMin);g.searchParams.set('timeMax',timeMax);g.searchParams.set('maxResults','100');
   return res.status(200).json(await googleFetch(s,g.toString()));
  }
  if(req.method==='POST'){
   const body=req.body||{}; const out=await googleFetch(s,'https://www.googleapis.com/calendar/v3/calendars/primary/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}); return res.status(200).json(out);
  }
  res.setHeader('Allow','GET, POST');res.status(405).end();
 }catch(e){res.status(500).json({error:e.message});}
};
