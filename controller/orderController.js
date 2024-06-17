const db = require('../config/connection');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose')
const User =require("../models/userModel")
const Product =require("../models/productModel")
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
const { log } = require('console');
const {getCartCount,findCartDiscountTotal,cartTotalWithoutDiscount}=require("../utils/cart")
const {getWishListCount}=require("../utils/wishlist")

  // change order status
  const changeOrderStatus=async(req,res)=>{
    try {
 
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
          strPaymentStatus:1,
          totalAmountAfterDiscount:1
        }
      }
    ]);
     
     if (result.modifiedCount>0) {
      if((orderStatus=="Cancelled" || orderStatus=="Returned") && orderArray[0].strPaymentStatus !="Pending"){
       
        orderArray[0].arrProductsDetails.map(async(product)=>{
        
          let quantity=product.intQuantity
            let updateStock=await Product.updateOne({pkProductId:new ObjectId(product.pkProductId)},{$inc:{intStock:quantity}})
         
        })
         if( orderArray[0].strPaymentMethod==='RAZORPAY' || orderArray[0].strPaymentMethod==='Wallet'){
          let totalAmt=parseFloat(orderArray[0].totalAmountAfterDiscount)
        let updateWallent=await Wallet.updateOne({userId:new ObjectId(pkUserId)},{$inc:{balance:totalAmt}})
         
      }
      if( orderArray[0].strPaymentMethod==='COD' && orderStatus=="Returned"){
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
       let wishListCount=await getWishListCount(pkUserId)
       let cartCount= await getCartCount(pkUserId)
   
       if (orderDetails && orderDetails.length) {
         
        
         let orderProducts= await orderDetails[0].arrProductsDetails.map(obj=>{
          let intTotalPrice
          if(obj.offer){
           intTotalPrice=obj.intQuantity*obj.offerPrice
          }else{
           intTotalPrice=obj.intQuantity*obj.intPrice
          }
           return {...obj,intTotalPrice:intTotalPrice}
            
         })
         
          res.render("user/orderDetails",{layout:"user_layout",success:true,deliveryAddress:orderDetails[0].arrDeliveryAddress,wishListCount,orderProducts,orderDetails,pkUserId,cartCount ,message:"successfully loaded cart page",user:true})
        } else {
         res.render("user/orderDetails",{layout:"user_layout",success:true,user:true,pkUserId,cartCount,wishListCount})
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
      let userId=req.session.user.pkUserId
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
    
     
      let cartDetailsFind=await Cart.find({ pkUserId:pkUserId,strStatus:"Active" }).populate('arrProducts.offer');
      
      
      if (cartDetailsFind && cartDetailsFind.length) {
        
        let cartCount= await getCartCount(userId) 
        let wishListCount=await getWishListCount(userId)

        let cartDetails = cartDetailsFind.map(cart => {
         
          return {
            ...cart._doc,
           
          };
        });

        let cartProducts=cartDetails[0].arrProducts.map(obj=>{
          let intTotalPrice=obj.intQuantity*obj.intPrice
          let dataToAdd={
             intTotalPrice
          }
           if(obj.offer){
            let totalOfferPrice=obj.intQuantity*obj.offerPrice
            let discount=intTotalPrice-totalOfferPrice
            dataToAdd={
              ...dataToAdd,
              totalOfferPrice,
              discount
            }
            
           }
         
        
          return {...obj._doc,...dataToAdd}
           
        })
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const coupons = await Coupon.aggregate([{$match:{ status : "Active", expireDate : { $gte : today }}}])
        console.log(coupons);

         let walletBalance=0
        let wallet=await Wallet.aggregate([{$match:{userId:pkUserId}}])
        
          if(wallet.length){
            walletBalance= wallet[0].balance
          }
          let subTotal=await cartTotalWithoutDiscount(cartDetails[0]._id)
          let totalDiscount=await findCartDiscountTotal(cartDetails[0]._id)
          let subTotalPrice =parseFloat( subTotal && subTotal[0] ? subTotal[0].total_price : 0);
          let totalDiscountValue =parseFloat( totalDiscount && totalDiscount[0] ? totalDiscount[0].total_discount : 0);
        let gst=parseFloat(subTotalPrice*4/100)
        let  totalCartPrice =parseFloat(cartDetails[0].total_cart_price+gst)
          let dataTosent={
            layout:"user_layout",success:true,userAddress,
            cartProducts,wishListCount,pkUserId,cartDetails,cartCount ,
            subTotalPrice,
            gst,
            totalCartPrice,
            walletBalance,coupons,message:"successfully loaded cart page",user:true
          }
        
          if(totalDiscountValue>0){
            dataTosent={
              ...dataTosent,
              totalDiscountValue
            }
          }
       res.render("user/checkoutPage",{...dataTosent})
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
      
      let walletAmt=parseFloat(req.body.walletAmt)
    
      let cartProducts=await Cart.find({pkUserId:new ObjectId(pkUserId),strStatus:"Active"})
      let subTotal=await cartTotalWithoutDiscount(cartProducts[0]._id)
      console.log(subTotal)
      let gst=parseFloat(subTotal[0].total_price*4/100)
      let dataToAdd=new Order({
        pkOrderId:new ObjectId(),
        pkUserId:new ObjectId(pkUserId),
        arrProductsDetails:cartProducts[0].arrProducts,
        arrDeliveryAddress:arrAddress,
        intTotalOrderPrice:parseFloat(subTotal[0].total_price),
        totalAmountAfterDiscount:parseFloat(req.body.totalAmountAfterDiscount),
        strPaymentStatus:"Success",
        strPaymentMethod:req.body.paymentMethod,
        gst,
        totalDiscount:parseFloat(req.body.totalDiscount) || 0,
        couponDiscount:parseFloat(req.body.couponReduction),
        strOrderStatus:"Processing",
        walletCashUsed:walletAmt,
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
     if(walletAmt>0){
      let updateWallet=await Wallet.updateOne({userId:new ObjectId(pkUserId)},{$inc:{balance:-walletAmt}})
       if(updateWallet.modifiedCount>0){
        console.log("updateWallet")
       }
      
     }
    
      if(cartProducts.modifiedCount>0){
        res.json({success:true,message:"Ordered successfully "})
      }
      else{
        let updatedOrder = await Order.findById(result._id); // Assuming MongoDB auto-generates _id

        // Update the order status
        updatedOrder.strOrderStatus = "Pending";
        updatedOrder.strPaymentStatus = "Pending";
        
        // Save the updated order
        await updatedOrder.save();
        res.json({success:false,message:"Fail to update cart and wallet Order failed "})
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
      let subTotal=await cartTotalWithoutDiscount(cartProducts[0]._id)
      let gst=parseFloat(subTotal[0].total_price*4/100)


     
      let dataToAdd=new Order({
        pkOrderId:new ObjectId(),
        pkUserId:new ObjectId(pkUserId),
        arrProductsDetails:cartProducts[0].arrProducts,
        arrDeliveryAddress:arrAddress,
        intTotalOrderPrice:parseFloat(subTotal[0].total_price),
        totalAmountAfterDiscount:parseFloat(req.body.totalAmountAfterDiscount),
        gst,
        totalDiscount:parseFloat(req.body.totalDiscount) || 0,
        couponDiscount:req.body.couponReduction?parseFloat(req.body.couponReduction):0,
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

    

      return res.json({
        status: "Success",
        message: razorpayOrder,
        orderId: result._id,
        razorpay: true,
        walletCashUsed:req.body.walletAmt,
        pkUserId:result.pkUserId
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
    const { orderId, payment_id, order_id, signature ,walletCashUsed,pkUserId} = req.body;
    let walletAmt=parseFloat(walletCashUsed)
    
    const order = await Order.findOne({ _id:new ObjectId( orderId )});
   
    try {
      const secret = process.env.KEY_SECRET;
      const generated_signature = hmac_sha256(
        order_id + "|" + payment_id,
        secret
      );
  
      if (generated_signature === signature) {
        let cartProducts=await Cart.updateMany({pkUserId:new ObjectId(pkUserId),strStatus:"Active"},{$set:{strStatus:"Deleted"}})
        let updateWallet=await Wallet.updateOne({userId:new ObjectId(pkUserId)},{$inc:{balance:-walletAmt}})
        
        // if(cartProducts.modifiedCount==0 && updateWallet.modifiedCount==0){
        //   return  res.json({success:false,message:"order failed"})
        //    }
             
      let productArray = await Order.aggregate([
        {
          $match: {
            _id:new ObjectId( orderId )
            
          }
        },
        {
          $project: {
            
            arrProductsDetails: 1
          }
        }
      ]);
   
    console.log(productArray);
      
      if(productArray.length && productArray[0].arrProductsDetails.length>0){
      productArray[0].arrProductsDetails.map(async(product)=>{
        
          let quantity=product.intQuantity
            let updateStock=await Product.updateOne({pkProductId:new ObjectId(product.pkProductId)},{$inc:{intStock:-quantity}})
         
        })
      }else{
        order.strPaymentStatus = "Failed";
        order.strStatus='Deleted'
        order.save();
        console.error("Order fail due to product stock update");
        res
          .status(400)
          .json({ success: false, error: "cant update product stock" });
      }

       
        
        order.strPaymentStatus = "Success";
        order.strOrderStatus="Processing"
        order.walletCashUsed=walletAmt
      
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
          let intTotalPrice
     if(obj.offer){
      intTotalPrice=obj.intQuantity*obj.offerPrice
     }else{
      intTotalPrice=obj.intQuantity*obj.intPrice
     }
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
    const getOrderListAdmin = async (req, res) => {
      try {
          const totalCount = await Order.countDocuments({ strOrderStatus: { $ne: "Pending" } });
  
          if (totalCount > 0) {
              const page = parseInt(req.query.page) || 1;
              const limit = parseInt(req.query.limit) || 5;
              const skip = (page - 1) * limit;
              const totalPages = Math.ceil(totalCount / limit);
  
              let result = await Order.find({ strOrderStatus: { $ne: "Pending" } })
                  .sort({ createdDate: -1 })
                  .skip(skip)
                  .limit(limit);
  
              let usersOrders = result.map((order, index) => {
                  const isoDate = order.createdDate;
                  const date = new Date(isoDate);
                  const formattedDate = date.toString().substring(0, 15);
                  return {
                      ...order._doc,
                      index: skip + index + 1,
                      createdDate: formattedDate,
                  };
              });
  
              res.render("admin/orderList", {
                  layout: "admin_layout",
                  admin: true,
                  usersOrders,
                  totalPages,
                  currentPage: page
              });
          } else {
              res.render("admin/orderList", {
                  layout: "admin_layout",
                  admin: true,
                  usersOrders: [],
                  totalPages: 0,
                  currentPage: 1
              });
          }
      } catch (error) {
          res.json({ success: false, message: error.message });
      }
  };
  
  
    const orderDismiss = async (req, res) => {

      console.log(req.session);
      console.log(req.body);
      const orderId = req.body.orderId;
    
      try {
    
        await Order.findByIdAndDelete(
          {_id:req.body.orderId },
        
        );
        return res.json({ success: true });
      } catch (error) {}
    };
  module.exports = {
    getOrderDetailsPage,
    changeOrderStatus,
    getCheckoutPage,
    checkOut,
    getOrderDetailsPageAdmin,
    getOrderListAdmin,
    checkOutRazorPay,
    verifyPayment,
    orderDismiss
  }