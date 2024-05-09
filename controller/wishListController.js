const db = require('../config/connection');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose')
const User =require("../models/userModel")
const Product =require("../models/productModel")

const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const Wishlist = require('../models/wishListModel');
const Cart = require('../models/cartModel');

const  addToWishList=async(req,res)=>{
    try {
    
        if(req.session.user.pkUserId){
          let pkUserId =new ObjectId(req.session.user.pkUserId)
        let productFind=await Product.find({pkProductId:new ObjectId(req.body.pkProductId),strStatus:"Active"},{createdDate:0,updatedDate:0})
          let product=productFind.map((pro)=>{
            return{...pro._doc}
          })
         if(product && product.length){
          
           let pkProductId=new ObjectId(product[0].pkProductId)
           let userWishList= await Wishlist.find({pkUserId,strStatus:"Active"})
              
           if(userWishList && userWishList.length){
            let productInCart=await Wishlist.find({pkUserId,"arrProducts.pkProductId":pkProductId,strStatus:"Active"})
            
            if(productInCart.length){
             
            res.json({success:false,message:"Product already in wish list"})
               
             }else{
              let matchQuery = {
                pkUserId: new ObjectId(pkUserId),
                strStatus:"Active"
               
              };
             
              let dataToAdd = {
                $addToSet: {
                  arrProducts: {
                    
                    ...product[0],
                  
                    
                  }
                }
              };
              
              let result = await Wishlist.updateOne(matchQuery, dataToAdd);
              if(result.modifiedCount>0){
                res.json({success:true,message:"Wishlist updated"})
              }
              else{
                res.json({success:true,message:"failed Wishlist update"})
              }





             }
  
           }else{
           
          
            
            product[0].intQuantity=1
            
            let dataToAdd=new Wishlist({
              pkWishListId:new ObjectId(),
              pkUserId:new ObjectId(pkUserId),
              arrProducts:[
                ...product,
                
              ],
            
              updatedDate:null,
              createDate:new Date()
            })
            let result=await dataToAdd.save()
             if(result._id){
              res.json({success:true,message:"new wishlist added"})
             }else{
              res.json({success:false,message:"Failed add to wishlist"})
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



 //get wish list page
 const getWishListPage=async(req,res)=>{
    try {
     let pkUserId =req.session.user.pkUserId
     
    
     let wishListCount=0
     let cartCount= await getCartCount(pkUserId)
    let wishListDetailsFind=await Wishlist.find({pkUserId:new ObjectId(pkUserId),strStatus:"Active"})
    let wishListDetails=wishListDetailsFind.map((wish)=>{
        return{...wish._doc}
    })
   
    if (wishListDetails && wishListDetails.length) {
   
      
      let wishlist=  await Wishlist.aggregate([{$match:{pkUserId:new ObjectId(pkUserId),strStatus:"Active"}}, {
       $project: {
           _id: 1,
           itemCount: { $size: "$arrProducts" }
       }
   }])
   if(wishlist.length){
     wishListCount=wishlist[0].itemCount
   }
     
   
     let wishListProducts=wishListDetails[0].arrProducts.map(obj=>{
      
 
       return {...obj._doc,pkWishListId:wishListDetails[0].pkWishListId,pkUserId:wishListDetails[0].pkUserId}
     })

      res.render("user/wishListPage",{layout:"user_layout",success:true,wishListDetails,wishListProducts,pkUserId,message:"successfully loaded cart page",user:true,cartCount,wishListCount})
    } else {
     res.render("user/wishListPage",{layout:"user_layout",success:true,user:true,pkUserId,cartCount,wishListCount})
    }
    } catch (error) {
     res.json({success:false,message:error.message})
    }
   }

   const removeFromWishList=async(req,res)=>{
    try {
      if(req.body.pkWishListId || req.body.pkProductId){ 
        
        let match={pkWishListId:new ObjectId(req.body.pkWishListId),strStatus:"Active"}
        let update = {
          $pull: {
            arrProducts: { pkProductId:new ObjectId(req.body.pkProductId) }
          }
        };
        let removeProduct=await Wishlist.updateOne(match,update)
         
       
        if(removeProduct.modifiedCount>0){
      let arrProductsCount= await Wishlist.find({pkWishListId:new ObjectId(req.body.pkWishListId),strStatus:"Active" ,"arrProducts": { $exists: true, $not: { $size: 0 } } })
           
      if(!arrProductsCount.length){
            let findWishList=await Wishlist.updateOne(match,{$set:{strStatus:"Deleted"}})
            if(findWishList.modifiedCount>0){
              return    res.json({success:true,message:"Successfully deleted wishlist"})
            }
            else{
              return    res.json({success:false,message:"Failed delete wish list"})
            }
            
           }
          return res.json({success:true,message:"Successfully deleted wishlist"})
        }
        else{
          res.json({success:false,message:"Failed to remove from wishlist"})
        }
      }else{
         res.json({success:false,message:"Required Cart id and Product id"})
      }
    } catch (error) {
      res.json({succes:false,message:error.message})
    }
  }







  module.exports = {

    addToWishList,
    getWishListPage,
    removeFromWishList
 
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