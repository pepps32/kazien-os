const crypto=require('crypto');
const {STATE_COOKIE,authUrl,setCookie}=require('../_lib/google');
module.exports=async(req,res)=>{
  try{
    const state=crypto.randomBytes(24).toString('base64url');
    setCookie(res,STATE_COOKIE,state,{maxAge:600});
    res.statusCode=302; res.setHeader('Location',authUrl(state)); res.end();
  }catch(e){res.status(500).json({ok:false,error:e.message});}
};
