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
     
        if(req.body.pkUserId){
          let pkUserId =new ObjectId(req.body.pkUserId)
        let productFind=await Product.find({pkProductId:new ObjectId(req.body.pkProductId),strStatus:"Active"},{createdDate:0,updatedDate:0})
          let product=productFind.map((pro)=>{
            return{...pro._doc}
          })
         if(product && product.length){
          
           let pkProductId=new ObjectId(product[0].pkProductId)
           let userCart= await Cart.find({pkUserId,strStatus:"Active"})
              
           if(userCart && userCart.length){
            let productInCart=await Cart.find({pkUserId,"arrProducts.pkProductId":pkProductId,strStatus:"Active"})
            
            if(productInCart.length){
              const update = {
                $inc: { "arrProducts.$.intQuantity": 1 },
             
              };
              const result = await Cart.updateOne({pkUserId,"arrProducts.pkProductId":pkProductId,strStatus:"Active"}, update);
               if(result.modifiedCount>0){
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
                
                let totalPriceResult = await Cart.aggregate(aggregatePipeline)
                 
                // Update total_cart_price for the cart
                let updatedTotalPriceResult = await Cart.updateOne(
                  { pkUserId,strStatus:"Active" },
                  { $set: { total_cart_price: totalPriceResult[0].total_cart_price } }
                );
    
              console.log("cart-updated111111111111");
                res.json({success:true,message:"cart updated-1"})
               }else{

                res.json({success:false,message:"Failed to increase quantity"})
               }
              
            
  
  
  
  
  
  
  
          
            }else{
              let matchQuery = {
                pkUserId: new ObjectId(req.body.pkUserId),
                strStatus:"Active"
               
              };
             
              let dataToAdd = {
                $addToSet: {
                  arrProducts: {
                    
                    ...product[0],
                  
                    
                  }
                }
              };
              
              let result = await Cart.updateOne(matchQuery, dataToAdd);
            
              if(result.modifiedCount>0){
                   // Calculate total_cart_price using aggregation framework
              let aggregatePipeline = [
                {
                  $match: {
                    pkUserId: new ObjectId(req.body.pkUserId), // Match documents with the specified user ID
                    strStatus:"Active"
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
                let totalPriceResult = await Cart.aggregate(aggregatePipeline)
                console.log(totalPriceResult);
                // Update total_cart_price for the cart
                let updatedTotalPriceResult = await Cart.updateOne(matchQuery, { $set: { total_cart_price: totalPriceResult[0].total_cart_price } });
                
           
               console.log("cartttt-22222222");
              
            res.json({success:true,message:"cart updated-2"})
              }
              else{
                res.json({success:false,message:"Fail to add new product in cart"})
              }
              
             
              }
  
           }else{
           
          
            
            product[0].intQuantity=1
            
            let dataToAdd=new Cart({
              pkCartId:new ObjectId(),
              pkUserId:new ObjectId(pkUserId),
              arrProducts:[
                ...product,
                
              ],
              total_cart_price:product[0].intPrice,
              updatedDate:null,
              createDate:new Date()
            })
            let result=await dataToAdd.save()
             if(result._id){
              res.json({success:true,message:"new cart added-3"})
             }else{
              res.json({success:false,message:"Failed add to cart-3"})
             }
           
          }
          
         }
         else{
          res.json({success:false,message:"Product not found"})
         }
  
        }else{
          res.json({success:false,message:"user id not found"})
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
   let cartDetailsFind=await Cart.find({pkUserId:new ObjectId(pkUserId),strStatus:"Active"})
   let cartDetails=cartDetailsFind.map((cart)=>{
       return{...cart._doc}
   })
  
   if (cartDetails && cartDetails.length) {
  
    let cartCount= await getCartCount(pkUserId)
    
  
    let cartProducts=cartDetails[0].arrProducts.map(obj=>{
      let intTotalPrice=obj.intQuantity*obj.intPrice

      return {...obj._doc,intTotalPrice:intTotalPrice,pkCartId:cartDetails[0].pkCartId}
    })
    
     res.render("user/cartPage",{layout:"user_layout",success:true,cartDetails,cartProducts,pkUserId,message:"successfully loaded cart page",user:true,cartCount})
   } else {
    res.render("user/cartPage",{layout:"user_layout",success:true,user:true,pkUserId,cartCount})
   }
   } catch (error) {
    res.json({success:false,message:error.message})
   }
  }
  
 
  
  const changeQuantity=async(req,res)=>{
    try {
  
      let pkProductId=new ObjectId(req.body.pkProductId)
       let pkUserId=req.session.user.pkUserId
     
      let quantity=parseInt(req.body.quantity)
      let productInCartFind=await Cart.find({pkUserId:new ObjectId(pkUserId),"arrProducts.pkProductId":pkProductId,strStatus:"Active"})
         let productInCart=productInCartFind.map((product)=>{
         return {...product._doc}
         })
      if(productInCart.length){
        const update = {
          $inc: { "arrProducts.$.intQuantity": quantity},
       
        };
        const result = await Cart.updateOne({pkUserId:new ObjectId(pkUserId),"arrProducts.pkProductId":pkProductId,strStatus:"Active"}, update);
    
        if(result.modifiedCount>0){
          
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
          
          let totalPriceResult = await Cart.aggregate(aggregatePipeline)
          

          
          // Update total_cart_price for the cart
          let updatedTotalPriceResult = await Cart.updateOne(
            {pkUserId:new ObjectId( pkUserId ),strStatus:"Active"},
            { $set: { total_cart_price: totalPriceResult[0].total_cart_price } }
          );
          if(updatedTotalPriceResult.modifiedCount===0){
            return res.json({success:false,message:"Fail to update total cart price"})
          }
     
          let InCart=productInCart[0].arrProducts.map(obj=>{
            let intTotalPrice=obj.intQuantity*obj.intPrice
            return {...obj,intTotalPrice:intTotalPrice}
          })
    
    
    
          res.json({success:true,message:"cart updated-1",quantity,totalPriceResult:totalPriceResult[0].total_cart_price,pkUserId})
        }
        else{
          res.json({succes:false,message:"Fail to change quantity"})
        }
      
  
  
  
  
  
  
  
    
      }
    
    } catch (error) {
       res.json({succes:false,message:error.message})
    }
  
  }

  const removeFromCart=async(req,res)=>{
    try {
      if(req.body.pkCartId || req.body.pkProductId){
      let findProductPrice= await Cart.aggregate([
          {
            $match: {
              pkCartId:new  ObjectId(req.body.pkCartId) ,
              strStatus:"Active"
            }
          },
          {
            $unwind: "$arrProducts"
          },
          {
            $match: {
             "arrProducts.pkProductId":new ObjectId(req.body.pkProductId) ,
              
            }
          },

          {
            $project: {
              totalPrice: { $multiply: ["$arrProducts.intPrice", "$arrProducts.intQuantity"] }
            }
          },
          {
            $group: {
              _id: null,
              totalSum: { $sum: "$totalPrice" }
            }
          }
        ])

        
        
        let match={pkCartId:new ObjectId(req.body.pkCartId),strStatus:"Active"}
        let update = {
          $pull: {
            arrProducts: { pkProductId:new ObjectId(req.body.pkProductId) }
          }
        };
        let removeProduct=await Cart.updateOne(match,update)
         
         let productPrice=parseFloat(findProductPrice[0].totalSum)
        if(removeProduct.modifiedCount>0){
      let arrProductsCount= await Cart.find({pkCartId:new ObjectId(req.body.pkCartId),strStatus:"Active" ,"arrProducts": { $exists: true, $not: { $size: 0 } } })
           console.log("arrProductCount:",arrProductsCount);
      if(!arrProductsCount.length){
            let findCart=await Cart.updateOne(match,{$set:{strStatus:"Deleted"}})
            if(findCart.modifiedCount>0){
              return    res.json({success:true,message:"Successfully removed from cart1"})
            }
            else{
              return    res.json({success:false,message:"Failed remove from cart1"})
            }
            
           }
           let  decreProdPrice=await Cart.updateOne(match,{$inc:{total_cart_price:-productPrice}})
           if(decreProdPrice.modifiedCount>0){
            res.json({success:true,message:"Successfully updated total cart price"})
           }else{
            res.json({success:false,message:"Failed  updated total cart price"})
           }
        }
        else{
          res.json({success:false,message:"Failed to remove from cart"})
        }
      }else{
         res.json({success:false,message:"Required Cart id and Product id"})
      }
    } catch (error) {
      res.json({succes:false,message:error.message})
    }
  }


  module.exports = {

     addToCart,getCartPage,
     
    removeFromCart,
     changeQuantity
  };

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