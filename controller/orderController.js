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
const Coupon= require("../models/couponModel")
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Wallet = require('../models/walletModel');

  // change order status
  const changeOrderStatus=async(req,res)=>{
    try {
     console.log(req.body);
      if(req.body.pkOrderId || req.body.pkUserId){
       let pkOrderId=new ObjectId(req.body.pkOrderId)
       let pkUserId=new ObjectId(req.body.pkUserId)
       let orderStatus=req.body.orderStatusChange
     let result=await Order.updateOne({pkUserId,pkOrderId,strStatus:"Active"},{$set:{strOrderStatus:orderStatus,updatedDate:new Date()}})
     let orderArray = await Order.aggregate([
      {
        $match: {
         pkOrderId,
         strStatus:"Active"
          
        }
      },
      {
        $project: {
          pkOrderId:1,
          strPaymentMethod:1,
          arrProductsDetails: 1,
          pkUserId:1,
          totalAmountAfterDiscount:1
        }
      }
    ]);
     
     if (result.modifiedCount>0) {
      if(orderStatus=="Cancelled"){
       
        orderArray[0].arrProductsDetails.map(async(product)=>{
        
          let quantity=product.intQuantity
            let updateStock=await Product.updateOne({pkProductId:new ObjectId(product.pkProductId)},{$inc:{intStock:quantity}})
         
        })
         if( orderArray[0].strPaymentMethod==='RAZORPAY'){
          let totalAmt=parseFloat(orderArray[0].totalAmountAfterDiscount)
        let updateWallent=await Wallet.updateOne({userId:new ObjectId(pkUserId)},{$inc:{balance:totalAmt}})
         
      }
      }
       
       res.json({success:true,message: 'successfully status changed order!',userBlocked:true})
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
      let userId="65ead74f63b8a90a5a0dee7c"
      let pkUserId =new ObjectId(userId)

      let match={
        $match:{
          pkUserId,
          strStatus:"Active"
        }
      }
      let addField={
        $addFields: {
          isDefaultAddressInt: { $cond: { if: "$isDefaultAddress", then: 1, else: 0 } }
        }
      }
      let sort= {
        $sort: {
          isDefaultAddressInt: -1 
        }
      }
      let projectAddress={
        $project:{
          isDefaultAddressInt: 0
        }
      }

      let orderSort={
        $sort:{
          updatedDate:-1,
          createdDate:-1
        }
      }
      let  userAddress=await Address.aggregate([match,addField,sort,projectAddress])
      // let userAddress=await Address.aggregate([{ $match:{ pkUserId:pkUserId,strStatus:"Active" }}])
    
     
      let cartDetails=await Cart.aggregate([{ $match:{ pkUserId:pkUserId,strStatus:"Active" }}])
      
      
      if (cartDetails && cartDetails.length) {
         let grandTotal=0
        let cartCount= await getCartCount(userId)
        let cartProducts=cartDetails[0].arrProducts.map(obj=>{
          let intTotalPrice=obj.intQuantity*obj.intPrice
          let totalOfferPrice=obj.intQuantity*obj.offerPrice
          grandTotal+=obj.intQuantity*obj.offerPrice
          let discount=obj.intQuantity*obj.offer
          return {...obj,intTotalPrice:intTotalPrice, totalOfferPrice,discount}
           
        })
     
        const productAndCategoryIdsInOrder = cartDetails[0].arrProducts.map((item) => ({
          productId: item.pkProductId,
          categoryId: item.fkcategoryId,
        }));
        const productIdsInOrder = productAndCategoryIdsInOrder.map(
          (item) => item.productId
        );
        const categoryIdsInOrder = productAndCategoryIdsInOrder.map(
          (item) => item.categoryId
        );
        
        const currentDate = new Date();

        const findCoupons = await Coupon.find({
            $and: [
                { status: "Active" },
                {
                    $or: [
                        { products: productIdsInOrder },
                        { categories:categoryIdsInOrder },
                    ],
                },
                { 
                    $or: [
                        { usageLimit: { $gt: 0 } }, // Check if usage limit is greater than 0
                        { endDate: { $gt: currentDate } }, // Check if expiry date is greater than current date
                    ]          
                }
            ],
        });
        let coupons=findCoupons.map((coupon)=>{
          return{
            ...coupon._doc
          }
        })
         let walletBalance=0
        let wallet=await Wallet.aggregate([{$match:{userId:pkUserId}}])
        
          if(wallet.length){
            walletBalance= wallet[0].balance
          }
       res.render("user/checkoutPage",{layout:"user_layout",success:true,userAddress,cartProducts,pkUserId,cartDetails,cartCount ,walletBalance,coupons,grandTotal,message:"successfully loaded cart page",user:true})
       } else {
        res.redirect("/")
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
        totalAmountAfterDiscount:parseFloat(req.body.totalAmountAfterDiscount),
        strPaymentStatus:"Pending",
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

   //procced to checkout
   const checkOutRazorPay=async (req,res)=>{
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
    
      console.log(req.body.totalAmountAfterDiscount);


     
      let dataToAdd=new Order({
        pkOrderId:new ObjectId(),
        pkUserId:new ObjectId(pkUserId),
        arrProductsDetails:cartProducts[0].arrProducts,
        arrDeliveryAddress:arrAddress,
        intTotalOrderPrice:cartProducts[0].total_cart_price,
        totalAmountAfterDiscount:parseFloat(req.body.totalAmountAfterDiscount),
        strPaymentStatus:"Pending",
        strPaymentMethod:"RAZORPAY",
        strOrderStatus:"Pending",
        createdDate:new Date(),
        updatedDate:null
      })
     let result =await dataToAdd.save()

     if(result._id){
      let match={
        $match:{
          _id:new ObjectId(result._id),
          strStatus:"Active"
        }
      }
    //  let findOrder=await Order.aggregate([match])
    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });
    
  let amount=parseFloat(req.body.totalAmountAfterDiscount)*100
      const options = {
        amount: amount,
        currency: "INR",
        receipt: "" + result._id,
      };

      const razorpayOrder = await new Promise((resolve, reject) => {
        instance.orders.create(options, async function (err, order) {
          if (err) {
            console.log(err);
            res.json({success:false,message:"Order failed"})
            reject(err);
          } else {
            console.log(order);
            resolve(order);
          }
        });
      });

      console.log(razorpayOrder);

      return res.json({
        status: "Success",
        message: razorpayOrder,
        orderId: result._id,
        razorpay: true,
      });
      
     }
     else{
      res.json({success:false,message:"Order failed"})
     }
  
    } catch (error) {
      res.json({success:t=false,message:error.message})
    }
  }

  function hmac_sha256(data, key) {
    return crypto.createHmac("sha256", key).update(data).digest("hex");
  }
  
  const verifyPayment = async (req, res) => {
    const { orderId, payment_id, order_id, signature } = req.body;
    
    const order = await Order.findOne({ _id:new ObjectId( orderId )});
   
    try {
      const secret = process.env.KEY_SECRET;
      const generated_signature = hmac_sha256(
        order_id + "|" + payment_id,
        secret
      );
  
      if (generated_signature === signature) {
        let cartProducts=await Cart.updateOne({pkUserId:new ObjectId(pkUserId),strStatus:"Active"},{$set:{strStatus:"Deleted"}})
        if(cartProducts.modifiedCount>0){
          res.json({success:true,message:"Ordered successfully "})
        }
        else{
          res.json({success:false,message:"Fail to delete cart"})
        }
        order.strPaymentStatus = "Success";
        order.strOrderStatus="Processing"
        order.save();
       
        res.json({ success: true, message: orderId });
      } else {
        order.strPaymentStatus = "Failed";
        order.strStatus='Deleted'
        order.save();
        console.error("Invalid payment signature");
        res
          .status(400)
          .json({ success: false, error: "Invalid payment signature" });
      }
    } catch (error) {
      order.strPaymentStatus = "Failed";
      order.strStatus='Deleted'
      order.save();
      console.error("Error handling payment success:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };



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
           pkUserId:new ObjectId(userId),
           strStatus:"Active"
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
    getOrderListAdmin,
    checkOutRazorPay,
    verifyPayment
  }