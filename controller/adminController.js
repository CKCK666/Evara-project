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
const Order = require("../models/orderModel")

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
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
   
    const currentDate = new Date();
    let matchQuery={  strPaymentStatus:"Success"}
     let orderSort="all"
    if(req.query.sort=='daily'){
        matchQuery={
          strPaymentStatus: "Success",
          createdDate: {
            $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
            $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
          }
        }
        orderSort="daily"
    }
     if(req.query.sort=='weekly'){
      const sevenDaysAgo = new Date(currentDate);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchQuery={
        strPaymentStatus: "Success",
         createdDate: { $gte: sevenDaysAgo, $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) } 
      }
      orderSort="weekly"
    }

    if(req.query.sort=='yearly'){
      matchQuery={
        strPaymentStatus: "Success",
      createdDate: {
        $gte: new Date(currentDate.getFullYear(), 0, 1), // Start of the current year
        $lt: new Date(currentDate.getFullYear() + 1, 0, 1) // Start of the next year
    }}
    orderSort="yearly"
    }

    if(req.query.start && req.query.end ){
      const startDateString = req.query.start
const endDateString = req.query.end

const startDate = new Date(startDateString);
const endDate = new Date(endDateString);

endDate.setHours(23, 59, 59, 999); 

matchQuery={
  strPaymentStatus: "Success",
  createdDate: {
    $gte:startDate,
    $lte: endDate
}}
orderSort="custom"

    }

    const totalCount = await Order.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalCount / limit);

    let findOrder = await Order.find(matchQuery)
    .sort({ createdDate: -1 })
    .skip(skip)
    .limit(limit);

   let salesOrder=findOrder.map((order)=>{
        return{
         ...order._doc
        }
   })
   let orderSalesDetails=await Order.aggregate([
    {
      $match: {
      
       strPaymentStatus:"Success"
       
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 }, 
        totalSalesAmt: { $sum: { $sum: "$arrProductsDetails.intPrice" } }, 
        totalDiscountAfterAmount: { $sum: "$totalAmountAfterDiscount" } ,
        totalDiscountAmount: { $sum: { $subtract: ["$intTotalOrderPrice", "$totalAmountAfterDiscount"] } }
      }
    }
  ])
  
  

  res.render("admin/homePage",{layout:"admin_layout",admin:true,salesOrder,orderSort,orderSalesDetails,totalPages, currentPage: page})
    
  } catch (error) {
    console.log(error.message);
  }

}
  





  

 
  //logout 
const logout=(req,res)=>{
    req.session.destroy();
     res.redirect('/admin');
   }
   
  module.exports={adminLogin,
  
    getAdminHome,logout,
    
  }