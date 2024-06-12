const Order=require("../models/cartModel")
const { ObjectId } = require('mongodb');
const { find } = require("../models/couponModel");


const findOrderDiscountTotal = async (id) => {
    try {
      let aggregatePipeline = [
        {
          $match: {
            $or: [
              { pkOrderId: id }, // Match documents with the specified user ID
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
      
      let totalDiscount = await Order.aggregate(aggregatePipeline);
      return totalDiscount;
    } catch (error) {
      console.log(error.message);
    }
  };
  const orderTotalWithoutDiscount = async (id) => {
    try {
      let aggregatePipeline = [
        {
          $match: {
            $or: [
              { pkOrderId: id }, // Match documents with the specified user ID
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
      
      let totalPrice = await Order.aggregate(aggregatePipeline);
      return totalPrice;
    } catch (error) {
      console.log(error.message);
    }
  };
  
  module.exports={
    findOrderDiscountTotal,
    orderTotalWithoutDiscount
  }