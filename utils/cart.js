const Cart=require("../models/cartModel")
const { ObjectId } = require('mongodb');

const  getCartCount= async(userId) =>{
    try {
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
       
          return cartCount
        
    } catch (error) {
        console.log(error.message)
    }

 }
  
  module.exports={
    getCartCount
  }