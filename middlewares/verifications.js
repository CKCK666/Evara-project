const db=require("../config/connection")
const {ADMIN_COLLECTION}=require("../config/collections")
const jwt =require("jsonwebtoken")
const { ObjectId } = require('mongodb');
const { required } = require("nodemon/lib/config");
const verifyLogin=async(req,res,next)=>{
    
    if((req.session.user && !req.session.user.isAdmin) || req.session.passport){
       
     
     next()
      }
      else{
      
        req.session.destroy();
         res.render("user/loginPage",{layout:"user_layout"})
     
      }
  }
  
  const isAdmin=(req,res,next)=>{

      let user=req.session.user
  
      if(user &&user.isAdmin){
        console.log("inside admin");
          next()
         }
         else{
            res.render("admin/loginPage",{layout:"admin_layout"})
         }
  }
 


  module.exports={verifyLogin,isAdmin}
