const db = require('../config/connection');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose')
const User =require("../models/userModel")
const Product =require("../models/productModel")
const {USER_COLLECTION, PRODUCTS_COLLECTION, CATEGORY_COLLECTION, CART_COLLECTION, ORDER_COLLECTION} =require("../config/collections")
const Cart =require("../models/cartModel")
const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');



  // change order status
  const changeOrderStatus=async(req,res)=>{
    try {
     console.log(req.body);
      if(req.body.pkOrderId || req.body.pkUserId){
       let pkOrderId=new ObjectId(req.body.pkOrderId)
       let pkUserId=new ObjectId(req.body.pkUserId)
       let orderStatus=req.body.orderStatusChange
     let result=await Order.updateOne({pkUserId,pkOrderId},{$set:{strOrderStatus:orderStatus,updatedDate:new Date()}})
       console.log(result);
     if (result.modifiedCount>0) {
       
       res.json({success:true,message: 'successfully Cancelled the order!',userBlocked:true})
     }
     else{
     
       res.json({success:false,message: 'fail to update!'})
     }
   }else{
     res.json({success:false,message: 'Need both order id and user id'})
   }
    } catch (error) {
     console.log(error.message);
       res.json({success:false,message: error.message})
    }
   }
 
   const getOrderDetailsPage=async(req,res)=>{
    
     try {
       if(req.query.pkUserId || req.query.pkOrderId){
       let pkUserId =new ObjectId(req.query.pkUserId)
       let pkOrderId =new ObjectId(req.query.pkOrderId)
       let orderDetails=await Order.aggregate([{$match:{pkUserId,pkOrderId,strStatus:"Active"}}])
       
       let cartCount=0
       if (orderDetails && orderDetails.length) {
         
         let cartCount= await getCartCount(pkUserId)
         let orderProducts= await orderDetails[0].arrProductsDetails.map(obj=>{
           let intTotalPrice=obj.intQuantity*obj.intPrice
           return {...obj,intTotalPrice:intTotalPrice}
            
         })
         
          res.render("user/orderDetails",{layout:"user_layout",success:true,deliveryAddress:orderDetails[0].arrDeliveryAddress,orderProducts,orderDetails,cartCount ,message:"successfully loaded cart page",user:true})
        } else {
         res.render("user/orderDetails",{layout:"user_layout",success:true,user:true,pkUserId,cartCount})
        }
       }else{
 
       }
     } catch (error) {
       res.json({success:false,message:error.message})
     }
      
     
   }
  
   //get chheckout page
   const getCheckoutPage=async(req,res)=>{
    try {
      let pkUserId =new ObjectId(req.session.user.pkUserId)
      let userAddress=await Address.aggregate([{ $match:{ pkUserId:pkUserId,strStatus:"Active" }}])
    
     
      let cartDetails=await Cart.aggregate([{ $match:{ pkUserId:pkUserId,strStatus:"Active" }}])
      
      let cartCount=0
      if (cartDetails && cartDetails.length) {
        let cartCount= await getCartCount(req.session.user.pkUserId)
        let cartProducts=cartDetails[0].arrProducts.map(obj=>{
          let intTotalPrice=obj.intQuantity*obj.intPrice
          return {...obj,intTotalPrice:intTotalPrice}
           
        })
      
         res.render("user/checkoutPage",{layout:"user_layout",success:true,userAddress,cartProducts,pkUserId,cartDetails,cartCount ,message:"successfully loaded cart page",user:true})
       } else {
        res.render("user/checkoutPage",{layout:"user_layout",success:true,user:true,pkUserId,cartCount})
       }
    } catch (error) {
      res.json({success:false,message:error.message})
    }
     
    
  }

    //procced to checkout
  const checkOut=async (req,res)=>{
    try {
    
      let pkUserId=req.session.user.pkUserId
      if(!req.body.pkAddressId){
       return res.json({success:false,message:"Required address id"})
      }
      let arrAddress=[]
      let matchAddress={
        $match:{
          pkAddressId:new ObjectId(req.body.pkAddressId),
          strStatus:"Active"
        }
      }
      let userAddress=await Address.aggregate([matchAddress])
      if(userAddress.length){
         arrAddress=[...userAddress]
      }
      
      
    
      let cartProducts=await Cart.find({pkUserId:new ObjectId(pkUserId),strStatus:"Active"})
     
      let dataToAdd=new Order({
        pkOrderId:new ObjectId(),
        pkUserId:new ObjectId(pkUserId),
        arrProductsDetails:cartProducts[0].arrProducts,
        arrDeliveryAddress:arrAddress,
        intTotalOrderPrice:cartProducts[0].total_cart_price,
        strPaymentStatus:"Success",
        strPaymentMethod:"COD",
        strOrderStatus:"Processing",
        createdDate:new Date(),
        updatedDate:null
      })
     let result =await dataToAdd.save()
     if(result._id){
      
      
      let productArray = await Order.aggregate([
        {
          $match: {
            _id:result._id,
            
          }
        },
        {
          $project: {
            
            arrProductsDetails: 1
          }
        }
      ]);
   
    
      
      if(productArray[0].arrProductsDetails.length>0){
      productArray[0].arrProductsDetails.map(async(product)=>{
        
          let quantity=product.intQuantity
            let updateStock=await Product.updateOne({pkProductId:new ObjectId(product.pkProductId)},{$inc:{intStock:-quantity}})
         
        })

     let cartProducts=await Cart.updateOne({pkUserId:new ObjectId(pkUserId),strStatus:"Active"},{$set:{strStatus:"Deleted"}})
      if(cartProducts.modifiedCount>0){
        res.json({success:true,message:"Ordered successfully "})
      }
      else{
        res.json({success:false,message:"Fail to delete cart"})
      }
        
      }

    
     }
     else{
      res.json({success:false,message:"Order failed"})
     }
  
    } catch (error) {
      res.json({success:t=false,message:error.message})
    }
  }

  const getOrderDetailsPageAdmin=async(req,res)=>{
   
    try {
      if(req.query.pkOrderId){
      // let pkUserId =new ObjectId(req.query.pkUserId)
      let pkOrderId =new ObjectId(req.query.pkOrderId)
      let result =await Order.find({pkOrderId})
      
      if (result  && result.length) {
        let orderDetails= result.map((order,index)=>{
          const isoDate = order.createdDate;
          const date = new Date(isoDate);
          const formattedDate = date.toString().substring(0, 15) 
          return {
            ...order._doc,
            index:index+1,
            createdDate: formattedDate
           }
          
          })
      
        let orderProducts= await orderDetails[0].arrProductsDetails.map(obj=>{
          let intTotalPrice=obj.intQuantity*obj.intPrice
          return {...obj,intTotalPrice:intTotalPrice}
           
        })
       
        
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
  
    //get order list
    const getOrderListAdmin=async(req,res)=>{
      try {
        let result = await Order.find({}).sort({ updatedDate: -1, createdDate: -1 });
         if(result.length){
         let usersOrders= result.map((order,index)=>{
          const isoDate = order.createdDate;
          const date = new Date(isoDate);
          const formattedDate = date.toString().substring(0, 15) 
          return {
            ...order._doc,
            index:index+1,
            createdDate: formattedDate
           }
          
          })
           console.log(usersOrders);
          res.render("admin/orderList",{layout:"admin_layout",admin:true,usersOrders})
         }
         else{
          res.json({success:false,message:"Fail to fetch orders"})
         }
    
        
      } catch (error) {
        res.json({success:false,message:error.message})
      }
    
    }
  

   async function getCartCount(userId) {

    let userCart=await Cart.find({pkUserId:new ObjectId(userId),strStatus:"Active"})
    let cartCount=0
    if(userCart && userCart.length){
      let totalQuantity=await Cart.aggregate([
       {
         $match:{
           pkUserId:new ObjectId(userId)
         }
       },
       {
         $unwind: "$arrProducts" // Unwind the arrProducts array to deconstruct the array
       },
       {
         $group: {
           _id: null,
           totalItems: { $sum: "$arrProducts.intQuantity" }
         }
       }
     ])
     cartCount=totalQuantity[0].totalItems
     return cartCount
    }
    else{
      return cartCount
    }
    
  }
  
  module.exports = {
    getOrderDetailsPage,
    changeOrderStatus,
    getCheckoutPage,
    checkOut,
    getOrderDetailsPageAdmin,
    getOrderListAdmin
  }