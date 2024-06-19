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

 const findTotalCartPrice=async(id)=>{
  try {
    let aggregatePipeline = [
      {
        $match: {
          $or: [
          { pkUserId: id }, // Match documents with the specified user ID
          { _id: id } // or match documents with the specified _id
          ],
          strStatus: "Active" // Match documents with the specified user ID and active status
          } 
        
      },
      {
          $unwind: "$arrProducts" // Deconstruct the arrProducts array
      },
      {
          $match: {
              "arrProducts.strStatus": "Active" // Match only products with strStatus true
          }
      },
      {
          $group: {
              _id: null,
              total_cart_price: {
                  $sum: {
                      $multiply: [
                          "$arrProducts.intQuantity",
                          {
                              $cond: {
                                  if: { $ifNull: ["$arrProducts.offerPrice", false] }, // Check if offerPrice exists
                                  then: "$arrProducts.offerPrice", // Use offerPrice if it exists
                                  else: "$arrProducts.intPrice" // Otherwise, use intPrice
                              }
                          }
                      ]
                  }
              }
          }
      }
  ];
 let totalCartPrice= await Cart.aggregate(aggregatePipeline)
 return totalCartPrice
  } catch (error) {
    console.log(error.message)
  }
 }
 const findCartDiscountTotal = async (id) => {
  try {
    let aggregatePipeline = [
      {
        $match: {
          $or: [
          { pkUserId: id }, // Match documents with the specified user ID
          { _id: id } // or match documents with the specified _id
          ],
          strStatus: "Active" // Match documents with the specified user ID and active status
          } 
        
      },
      {
        $unwind: "$arrProducts" // Deconstruct the arrProducts array
      },
      {
        $match: {
          "arrProducts.strStatus": "Active" // Match only products with strStatus Active
        }
      },
      {
        $group: {
          _id: null,
          total_discount: {
            $sum: {
              $multiply: [
                "$arrProducts.intQuantity",
                {
                  $cond: {
                    if: { $ifNull: ["$arrProducts.offerPrice", false] }, // Check if offerPrice exists
                    then: { $subtract: ["$arrProducts.intPrice", "$arrProducts.offerPrice"] }, // Calculate the discount amount
                    else: 0 // No discount if offerPrice does not exist
                  }
                }
              ]
            }
          }
        }
      }
    ];
    
    let totalDiscount = await Cart.aggregate(aggregatePipeline);
    return totalDiscount;
  } catch (error) {
    console.log(error.message);
  }
};
const cartTotalWithoutDiscount = async (id) => {
  try {
    let aggregatePipeline = [
      {
        $match: {
          $or: [
          { pkUserId: id }, // Match documents with the specified user ID
          { _id: id } // or match documents with the specified _id
          ],
          strStatus: "Active" // Match documents with the specified user ID and active status
          } 
        
      },
      {
        $unwind: "$arrProducts" // Deconstruct the arrProducts array
      },
      {
        $match: {
          "arrProducts.strStatus": "Active" // Match only products with strStatus Active
        }
      },
      {
        $group: {
          _id: null,
          total_price: {
            $sum: {
              $multiply: [
                "$arrProducts.intQuantity",
                "$arrProducts.intPrice" // Use intPrice for the total price calculation
              ]
            }
          }
        }
      }
    ];
    
    let totalPrice = await Cart.aggregate(aggregatePipeline);
    return totalPrice;
  } catch (error) {
    console.log(error.message);
  }
};

  module.exports={
    getCartCount,
    findCartDiscountTotal,
    findTotalCartPrice,
    cartTotalWithoutDiscount
  }