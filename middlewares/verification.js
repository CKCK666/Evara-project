const db=require("../config/connection")
const { ObjectId } = require('mongodb');
const verifyLogin=async(req,res,next)=>{
  
  if(req.session.user && !req.session.user.isAdmin){
   next()
    }
    else{
      req.session.destroy();
       res.render("user/loginPage")
   
    }
}

const isAdmin=(req,res,next)=>{
    let user=req.session.user
   
    if(user &&user.isAdmin){
        next()
       }
       else{
          res.render("admin/loginPage")
       }
}
module.exports={verifyLogin,isAdmin}