const db=require("../config/connection")
const mongoose=require("mongoose")
const Admin =require("../models/adminModel")
const Product =require("../models/productModel")
const Category =require("../models/categoryModel")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const { ObjectId} = require('mongodb');
const {USER_COLLECTION,ADMIN_COLLECTION, CATEGORY_COLLECTION, PRODUCTS_COLLECTION, ORDER_COLLECTION}=require("../config/collections");
const { log, logger } = require("handlebars");
const User = require("../models/userModel")

//post login
const adminLogin=async(req,res)=>{
   
  try {
    let {email,password} =req.body
    
    
    let user= await Admin.findOne({strEmail:email})
     
    if(user){
     
      let result= await bcrypt.compare(password,user.strPassword)
       
      if(result){
        req.session.loggedIn = true;
        req.session.user = user._doc;
      
        res.json({success:true,message: 'Form submitted successfully!'})
       
      }
      else{
        res.json({success:false,message: 'Invaild email or password!'})
      }
    }
    else{
      res.json({success:false,message: 'Invaild email or password!'})
    }
  } catch (error) {
    console.log(error.message);
    res.json({success:false,message: error.message})
  }

  
}

//get admin home page
const getAdminHome=async(req,res)=>{
res.render("admin/homePage",{layout:"admin_layout",admin:true})
}
  





  

 
  //logout 
const logout=(req,res)=>{
    req.session.destroy();
     res.redirect('/admin');
   }
   
  module.exports={adminLogin,
  
    getAdminHome,logout,
    
  }