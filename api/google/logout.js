const {COOKIE,clearCookie}=require('../_lib/google');
module.exports=async(req,res)=>{clearCookie(res,COOKIE);res.status(200).json({ok:true});};
