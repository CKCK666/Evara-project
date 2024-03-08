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
  





  
  //get order list
  const getOrderList=async(req,res)=>{
    try {
    
       let result=await db.get().collection(ORDER_COLLECTION).find().toArray()
       if(result.length){
       let usersOrders=await result.map((order,index)=>{
        const isoDate = order.createdDate;
        const date = new Date(isoDate);
        const formattedDate = date.toString().substring(0, 15) 
        return {
          ...order,
          index:index+1,
          createdDate: formattedDate
         }
        
        })
       
        res.render("admin/orderList",{layout:"admin_layout",admin:true,usersOrders})
       }
       else{
        res.json({success:false,message:"Fail to fetch orders"})
       }
  
      
    } catch (error) {
      res.json({success:false,message:error.message})
    }
  
  }

  const getOrderDetailsPage=async(req,res)=>{
   
    try {
      if(req.query.pkOrderId){
      // let pkUserId =new ObjectId(req.query.pkUserId)
      let pkOrderId =new ObjectId(req.query.pkOrderId)
      let result =await db.get().collection(ORDER_COLLECTION).find({pkOrderId}).toArray()
      
      if (result  && result.length) {
        let orderDetails=await result.map((order,index)=>{
          const isoDate = order.createdDate;
          const date = new Date(isoDate);
          const formattedDate = date.toString().substring(0, 15) 
          return {
            ...order,
            index:index+1,
            createdDate: formattedDate
           }
          
          })
      
        let orderProducts= await orderDetails[0].arrProductsDetails.map(obj=>{
          let intTotalPrice=obj.intQuantity*obj.intPrice
          return {...obj,intTotalPrice:intTotalPrice}
           
        })
        console.log(orderProducts);
        
         res.render("admin/orderDetailsPage",{layout:"admin_layout",success:true,deliveryAddress:orderDetails[0].arrDeliveryAddress,orderProducts,orderDetails,message:"successfully loaded cart page",admin:true})
       } else {
        res.render("admin/orderDetailsPage",{layout:"admin_layout",success:true,admin:true})
       }
      }else{
        res.json({success:false,message:"order id not found"})
      }
    } catch (error) {
      res.json({success:false,message:error.message})
    }
     
    
  }
  //logout 
const logout=(req,res)=>{
    req.session.destroy();
     res.redirect('/admin');
   }
   
  module.exports={adminLogin,
    getOrderDetailsPage,
    getOrderList,
    getAdminHome,logout,
    
  }