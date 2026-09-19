const {session}=require('../_lib/google');
module.exports=async(req,res)=>{try{const s=await session(req,res);res.status(200).json({connected:!!s});}catch(e){res.status(200).json({connected:false,error:e.message});}};
