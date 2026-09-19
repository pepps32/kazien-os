const {session,googleFetch}=require('../_lib/google');
module.exports=async(req,res)=>{
 try{
  const s=await session(req,res); if(!s) return res.status(401).json({error:'not_connected'});
  if(req.method==='GET'){
   const lists=await googleFetch(s,'https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=100');
   const first=(lists.items||[])[0]; if(!first) return res.status(200).json({lists:[],items:[]});
   const items=await googleFetch(s,`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(first.id)}/tasks?showCompleted=true&showHidden=true&maxResults=100`);
   return res.status(200).json({lists:lists.items||[],taskListId:first.id,items:items.items||[]});
  }
  if(req.method==='POST'){
   const {taskListId='@default',...task}=req.body||{}; const out=await googleFetch(s,`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(task)}); return res.status(200).json(out);
  }
  res.setHeader('Allow','GET, POST');res.status(405).end();
 }catch(e){res.status(500).json({error:e.message});}
};
