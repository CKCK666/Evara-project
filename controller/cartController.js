const db = require('../config/connection');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose')
const User =require("../models/userModel")
const Product =require("../models/productModel")

const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const Cart = require('../models/cartModel');
const {getCartCount,findTotalCartPrice,cartTotalWithoutDiscount,findCartDiscountTotal}=require("../utils/cart")
const {getWishListCount}=require("../utils/wishlist");
const match = require('nodemon/lib/monitor/match');


const addToCart=async(req,res)=>{
    try {
    
        if( req.session.user.pkUserId){
          let pkUserId =new ObjectId(req.session.user.pkUserId)
        let productFind=await Product.find({pkProductId:new ObjectId(req.body.pkProductId),strStatus:"Active"},{createdDate:0,updatedDate:0}).populate({
          path:"offer",
          match:{status:true}
        })
          let product=productFind.map((pro)=>{
            return{...pro._doc}
          })
         if(product && product.length){
          
           let pkProductId=new ObjectId(product[0].pkProductId)
           let userCart= await Cart.find({pkUserId,strStatus:"Active"})
              
           if(userCart && userCart.length){
            let productInCart=await Cart.find({pkUserId,"arrProducts.pkProductId":pkProductId,strStatus:"Active"})
            
            if(productInCart.length){
             let availableStock=product[0].intStock
             let limit=availableStock<10?availableStock:10
             let message=availableStock<10?"Quantity in cart exceeds available stock.":"Purchase limit exceeded. Maximum allowed quantity is 10."
             let quantityInCart=productInCart[0].arrProducts.find(pro => pro.pkProductId.equals(pkProductId));
           

              if(quantityInCart.intQuantity < limit){
              const update = {
                $inc: { "arrProducts.$.intQuantity": 1 },
             
              };
           
              const result = await Cart.updateOne({pkUserId,"arrProducts.pkProductId":pkProductId,strStatus:"Active"}, update);
               if(result.modifiedCount>0){
             
              
                let totalPriceResult = await findTotalCartPrice(pkUserId)
              
                if (totalPriceResult.length > 0 && totalPriceResult[0].total_cart_price !== undefined) {
                  // Update total_cart_price for the cart
                  let updatedTotalPriceResult = await Cart.updateOne(
                      { pkUserId, strStatus: "Active" },
                      { $set: { total_cart_price: parseFloat(totalPriceResult[0].total_cart_price) } }
                  );
          
                  console.log("Update result:", updatedTotalPriceResult);
              } else {
                  console.log("No active products found or total_cart_price is undefined.");
              }
    
              console.log("cart-updated111111111111");
                res.json({success:true,message:"cart updated-1"})
               }else{

                res.json({success:false,message:"Failed to increase quantity"})
               }
              
              }else{

                res.json({success:false,message:message})
              }
               
  
  
   
  
  
  
          
            }else{
              let matchQuery = {
                pkUserId,
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
                 
            
                   let totalPriceResult = await findTotalCartPrice(pkUserId)
                   if (totalPriceResult.length > 0 && totalPriceResult[0].total_cart_price !== undefined) {
                    // Update total_cart_price for the cart
                    let updatedTotalPriceResult = await Cart.updateOne(
                        { pkUserId, strStatus: "Active" },
                        { $set: { total_cart_price: parseFloat(totalPriceResult[0].total_cart_price) } }
                    );
            
                    console.log("Update result:", updatedTotalPriceResult);
                } else {
                    console.log("No active products found or total_cart_price is undefined.");
                }
                
           
               console.log("cartttt-22222222");
              
            res.json({success:true,message:"cart updated-2"})
              }
              else{
                res.json({success:false,message:"Fail to add new product in cart"})
              }
              
             
              }
  
           }else{

            //new Cart!!!!!!!!!!!!!!!!!!!!!!!!!
           let total=0
         
           if(product[0].offerPrice){
            total=product[0].offerPrice
            
           }else{
            total=product[0].intPrice
            
           }
          
            
            product[0].intQuantity=1
            
            let dataToAdd=new Cart({
              pkCartId:new ObjectId(),
              pkUserId:new ObjectId(req.session.user.pkUserId),
              arrProducts:[
               
                ...product
                ],
              total_cart_price:parseFloat(total),
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
    
  
   let cartDetailsFind=await Cart.find({pkUserId:new ObjectId(pkUserId),strStatus:"Active"}).populate('arrProducts.offer');
   let cartDetails = cartDetailsFind.map(cart => {
    let filteredProducts = cart.arrProducts.filter(product => product.strStatus === "Active");
    return {
      ...cart._doc,
      arrProducts: filteredProducts
    };
  });

   let cartCount= await getCartCount(pkUserId)
   let wishListCount=await getWishListCount(pkUserId)
   if (cartDetails && cartDetails.length && cartDetails[0].arrProducts && cartDetails[0].arrProducts.length>0) {
   
    let cartProducts=cartDetails[0].arrProducts.map(obj=>{
     let intTotalPrice
     if(obj.offer){
      intTotalPrice=obj.intQuantity*obj.offerPrice
     }else{
      intTotalPrice=obj.intQuantity*obj.intPrice
     }
     

      return {...obj._doc,intTotalPrice:intTotalPrice,pkCartId:cartDetails[0].pkCartId}
    })
    let subTotal=await cartTotalWithoutDiscount(cartDetails[0]._id)
    let totalDiscount=await findCartDiscountTotal(cartDetails[0]._id)
    let subTotalPrice = subTotal && subTotal[0] ? subTotal[0].total_price : 0;
    let totalDiscountValue = totalDiscount && totalDiscount[0] ? totalDiscount[0].total_discount : 0;
  
     res.render("user/cartPage",{layout:"user_layout",success:true,cartDetails,cartProducts,pkUserId, wishListCount, subTotal: subTotalPrice,
      totalDiscount:totalDiscountValue,message:"successfully loaded cart page",user:true,cartCount})
   } else {
    res.render("user/cartPage",{layout:"user_layout",success:true,user:true,pkUserId,cartCount, wishListCount,message:"Cart is empty"})
   }
   } catch (error) {
    res.json({success:false,message:error.message})
   }
  }
  
 
  
  const changeQuantity=async(req,res)=>{
    try {
  
      let pkProductId=new ObjectId(req.body.pkProductId)
       let pkUserId=new ObjectId(req.session.user.pkUserId)
     
      let quantity=parseInt(req.body.quantity)
      let productInCartFind=await Cart.find({pkUserId,"arrProducts.pkProductId":pkProductId,strStatus:"Active"})
         let productInCart=productInCartFind.map((product)=>{
         return {...product._doc}
         })
      if(productInCart.length){
        const update = {
          $inc: { "arrProducts.$.intQuantity": quantity},
       
        };
        const result = await Cart.updateOne({pkUserId,"arrProducts.pkProductId":pkProductId,strStatus:"Active"}, update);
    
        if(result.modifiedCount>0){
               
          let totalPriceResult = await findTotalCartPrice(pkUserId)
              
          if (totalPriceResult.length > 0 && totalPriceResult[0].total_cart_price !== undefined) {
            // Update total_cart_price for the cart
            let updatedTotalPriceResult = await Cart.updateOne(
                { pkUserId, strStatus: "Active" },
                { $set: { total_cart_price: totalPriceResult[0].total_cart_price } }
            );
          
            console.log("Update result:", updatedTotalPriceResult);
        } else {
            console.log("No active products found or total_cart_price is undefined.");
        }
          
          
     
          let InCart=productInCart[0].arrProducts.map(obj=>{
            let intTotalPrice=obj.intQuantity*obj.intPrice
            return {...obj,intTotalPrice:intTotalPrice}
          })
    
    let totalDiscount=await findCartDiscountTotal(pkUserId)
    let subTotalCart=parseFloat(totalPriceResult[0].total_cart_price+totalDiscount[0].total_discount)
          res.json({success:true,message:"cart updated-1",quantity,totalPriceResult:totalPriceResult[0].total_cart_price,pkUserId,totalDiscount:totalDiscount[0].total_discount,subTotalCart})
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

