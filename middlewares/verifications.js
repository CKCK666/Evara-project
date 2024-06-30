const db=require("../config/connection")
const {ADMIN_COLLECTION}=require("../config/collections")
const jwt =require("jsonwebtoken")
const { ObjectId } = require('mongodb');
const { required } = require("nodemon/lib/config");
const User =require("../models/userModel")
const verifyLogin=async(req,res,next)=>{
  
    if( req.session.user && req.session.otpVerified ){
     let user=await User.aggregate([{$match:{pkUserId:new ObjectId(req.session.user.pkUserId),strStatus:"Active"}}])
     
     if(user && user.length>0){
       
        next()
     }else{
       
        res.clearCookie('ckCookie', { domain: 'localhost', path: '/' })
        req.session.destroy();
  
        res.clearCookie('passport')
      
             res.render("user/loginPage",{layout:"user_layout"})

     }
     
      }
      else{
        
        req.session.otpVerified=false;
        res.clearCookie('ckCookie', { domain: 'localhost', path: '/' })
     res.clearCookie('passport')
  
         res.render("user/loginPage",{layout:"user_layout"})
     
      }
  }
  
  const isAdmin=(req,res,next)=>{

      let user=req.session.user
  
      if(user &&user.isAdmin){
     
          next()
         }
         else{
          
            res.render("admin/loginPage",{layout:"admin_layout"})
         }
  }
 


  module.exports={verifyLogin,isAdmin}
