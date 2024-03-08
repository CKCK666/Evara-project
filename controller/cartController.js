const db = require('../config/connection');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose')
const User =require("../models/userModel")
const Product =require("../models/productModel")
const {USER_COLLECTION, PRODUCTS_COLLECTION, CATEGORY_COLLECTION, CART_COLLECTION, ORDER_COLLECTION} =require("../config/collections")
const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const Cart = require('../models/cartModel');



const addToCart=async(req,res)=>{
    try {
      console.log();
        if(req.body.pkUserId){
          let pkUserId =new ObjectId(req.body.pkUserId)
        let product=await db.get().collection(PRODUCTS_COLLECTION).find({pkProductId:new ObjectId(req.body.pkProductId),strStatus:"Active"}).toArray()
         if(product && product.length){
           let pkProductId=new ObjectId(product[0].pkProductId)
           let userCart= await db.get().collection(CART_COLLECTION).find({pkUserId}).toArray()
             
           if(userCart && userCart.length){
            let productInCart=await db.get().collection(CART_COLLECTION).find({pkUserId,"arrProducts.pkProductId":pkProductId}).toArray()
            
            if(productInCart.length){
              const update = {
                $inc: { "arrProducts.$.intQuantity": 1 },
             
              };
              const result = await db.get().collection(CART_COLLECTION).updateOne({pkUserId,"arrProducts.pkProductId":pkProductId}, update);
          
              
            let aggregatePipeline = [
                {
                  $match: { pkUserId } // Match documents with the specified pkUserId
                },
                {
                  $unwind: "$arrProducts" // Deconstruct the arrProducts array
                },
                {
                  $group: {
                    _id: null,
                    total_cart_price: {
                      $sum: { $multiply: ["$arrProducts.intQuantity", "$arrProducts.intPrice"] }
                    }
                  }
                }
              ];
              
              let totalPriceResult = await db.get().collection(CART_COLLECTION).aggregate(aggregatePipeline).toArray();
              
              // Update total_cart_price for the cart
              let updatedTotalPriceResult = await db.get().collection(CART_COLLECTION).updateOne(
                { pkUserId },
                { $set: { total_cart_price: totalPriceResult[0].total_cart_price } }
              );
  
            console.log("cart-updated111111111111");
              res.json({success:true,message:"cart updated-1"})
  
  
  
  
  
  
  
          
            }else{
              let matchQuery = {
                pkUserId: new ObjectId(req.body.pkUserId),
               
              };
             
              let dataToAdd = {
                $addToSet: {
                  arrProducts: {
                    
                    ...product[0],
                    intQuantity: 1,
                    
                  }
                }
              };
              
              let result = await db.get().collection(CART_COLLECTION).updateOne(matchQuery, dataToAdd);
            
              
              // Calculate total_cart_price using aggregation framework
              let aggregatePipeline = [
                {
                  $match: {
                    pkUserId: new ObjectId(req.body.pkUserId), // Match documents with the specified user ID
                  
                  }
                },
                {
                  $unwind: "$arrProducts" // Deconstruct the arrProducts array
                },
                {
                  $group: {
                    _id: null,
                    total_cart_price: {
                      $sum: { $multiply: ["$arrProducts.intQuantity", "$arrProducts.intPrice"] }
                    }
                  }
                }
              ];
              
              let totalPriceResult = await db.get().collection(CART_COLLECTION).aggregate(aggregatePipeline).toArray();
              
              // Update total_cart_price for the cart
              let updatedTotalPriceResult = await db.get().collection(CART_COLLECTION).updateOne(matchQuery, { $set: { total_cart_price: totalPriceResult[0].total_cart_price } });
              
         
             console.log("cartttt-22222222");
            
          res.json({success:true,message:"cart updated-2"})
              }
  
           }else{
           
          
            
            product[0].intQuantity=1
            
            let dataToAdd={
              pkCartId:new ObjectId(),
              pkUserId,
              arrProducts:[
                ...product,
                
              ],
              total_cart_price:product[0].intPrice,
              updatedDate:null,
              createDate:new Date()
            }
            let result=await db.get().collection(CART_COLLECTION).insertOne(dataToAdd)
            res.json({success:true,message:"new cart added-3"})
          }
          
         }
         else{
          res.json({success:true,message:"Product not found"})
         }
  
        }else{
          res.json({success:true,message:"user id not found"})
        }
    } catch (error) {
      res.json({success:false,message:error.message})
    }
  }
  
  //get cart page
  const getCartPage=async(req,res)=>{
   try {
    let pkUserId =req.session.user.pkUserId
    
    let cartCount=0
   let cartDetails=await Cart.find({pkUserId:new ObjectId(pkUserId)})
  
   if (cartDetails && cartDetails.length) {
  
    let cartCount= await getCartCount(pkUserId)
    
  
    let cartProducts=cartDetails[0].arrProducts.map(obj=>{
      let intTotalPrice=obj.intQuantity*obj.intPrice
      return {...obj,intTotalPrice:intTotalPrice}
    })
     res.render("user/cartPage",{layout:"user_layout",success:true,cartDetails,cartProducts,pkUserId,message:"successfully loaded cart page",user:true,cartCount})
   } else {
    res.render("user/cartPage",{layout:"user_layout",success:true,user:true,pkUserId,cartCount})
   }
   } catch (error) {
    res.json({success:false,message:error.message})
   }
  }
  
  const getCheckoutPage=async(req,res)=>{
    try {
      let pkUserId =new ObjectId(req.session.user.pkUserId)
      let userAddress=await db.get().collection(USER_COLLECTION).find({pkUserId:pkUserId},{ projection: { "arrAddress": 1, "_id": 0 }}).toArray()
      userAddress.forEach(doc => {
        doc.arrAddress.sort((a, b) => {
            if (a.isDefaultAddress && !b.isDefaultAddress) {
                return -1; // a comes before b
            } else if (!a.isDefaultAddress && b.isDefaultAddress) {
                return 1; // b comes before a
            }
            return 0; // maintain original order
        });
    });
    
      let cartDetails=await db.get().collection(CART_COLLECTION).find({pkUserId}).toArray()
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
    
  const checkOut=async (req,res)=>{
    try {
      console.log("hereeeee");
      let pkUserId=req.session.user.pkUserId
      let match1={
        $match:{
          pkUserId:new ObjectId(pkUserId),
          strStatus:"Active",
        }
      }
      let unwind={
        $unwind:"$arrAddress"
      }
      let match2={
        $match:{
          "arrAddress.isDefaultAddress": true
        }
      }
      let userAddress=await db.get().collection(USER_COLLECTION).aggregate([match1,unwind,match2]).toArray()
      console.log(userAddress);
     
      let cartProducts=await db.get().collection(CART_COLLECTION).find({pkUserId:new ObjectId(pkUserId)}).toArray()
      let dataToAdd={
        pkOrderId:new ObjectId(),
        pkUserId:new ObjectId(pkUserId),
        arrProductsDetails:cartProducts[0].arrProducts,
        arrDeliveryAddress:userAddress[0].arrAddress,
        intTotalOrderPrice:cartProducts[0].total_cart_price,
        strPaymentStatus:"Success",
        strPaymentMethod:"COD",
        strOrderStatus:"Processing",
        createdDate:new Date(),
        updatedDate:null
      }
     let result =await db.get().collection(ORDER_COLLECTION).insertOne(dataToAdd)
     if(result.insertedId){
      res.json({success:true,message:"Ordered successfully"})
     }
     else{
      res.json({success:false,message:"Order failed"})
     }
  
    } catch (error) {
      res.json({success:true,message:error.message})
    }
  }
  
  const changeQuantity=async(req,res)=>{
    try {
      console.log(req.body);
      let pkProductId=new ObjectId(req.body.pkProductId)
      let pkUserId=req.session.user.pkUserId
      let quantity=parseInt(req.body.quantity)
      let productInCart=await db.get().collection(CART_COLLECTION).find({pkUserId:new ObjectId(pkUserId),"arrProducts.pkProductId":pkProductId}).toArray()
         console.log(productInCart);   
      if(productInCart.length){
        const update = {
          $inc: { "arrProducts.$.intQuantity": quantity},
       
        };
        const result = await db.get().collection(CART_COLLECTION).updateOne({pkUserId:new ObjectId(pkUserId),"arrProducts.pkProductId":pkProductId}, update);
    
        
      let aggregatePipeline = [
          {
            $match: { pkUserId:new ObjectId(pkUserId) } // Match documents with the specified pkUserId
          },
          {
            $unwind: "$arrProducts" // Deconstruct the arrProducts array
          },
          {
            $group: {
              _id: null,
              total_cart_price: {
                $sum: { $multiply: ["$arrProducts.intQuantity", "$arrProducts.intPrice"] }
              }
            }
          }
        ];
        
        let totalPriceResult = await db.get().collection(CART_COLLECTION).aggregate(aggregatePipeline).toArray();
        
        // Update total_cart_price for the cart
        let updatedTotalPriceResult = await db.get().collection(CART_COLLECTION).updateOne(
          {pkUserId:new ObjectId( pkUserId )},
          { $set: { total_cart_price: totalPriceResult[0].total_cart_price } }
        );
        
        console.log(updatedTotalPriceResult);
        let InCart=productInCart[0].arrProducts.map(obj=>{
          let intTotalPrice=obj.intQuantity*obj.intPrice
          return {...obj,intTotalPrice:intTotalPrice}
        })
  
  
  
        res.json({success:true,message:"cart updated-1",quantity,totalPriceResult:totalPriceResult[0].total_cart_price,pkUserId})
  
  
  
  
  
  
  
    
      }
      console.log("no product cart");
    } catch (error) {
       res.json({succes:false,message:error.message})
    }
  
  }


  module.exports = {

     addToCart,getCartPage,getCheckoutPage,
     checkOut,
   
     changeQuantity
  };