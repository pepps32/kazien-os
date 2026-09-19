const {COOKIE,STATE_COOKIE,parseCookies,addCookie,clearCookie,tokenExchange,enc}=require('../_lib/google');
module.exports=async(req,res)=>{
  try{
    const u=new URL(req.url,`https://${req.headers.host}`);
    const code=u.searchParams.get('code'), state=u.searchParams.get('state'), err=u.searchParams.get('error');
    if(err) throw new Error(`Google authorization: ${err}`);
    const expected=parseCookies(req)[STATE_COOKIE];
    if(!code||!state||!expected||state!==expected) throw new Error('OAuth state validation failed.');
    const tokens=await tokenExchange(code);
    addCookie(res,COOKIE,enc(tokens),{maxAge:60*60*24*30}); clearCookie(res,STATE_COOKIE);
    res.statusCode=302; res.setHeader('Location','/?google=connected'); res.end();
  }catch(e){res.statusCode=302;res.setHeader('Location','/?google=error&message='+encodeURIComponent(e.message));res.end();}
};
