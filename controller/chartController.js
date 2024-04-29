const Order = require('../models/orderModel');
const Product=require("../models/productModel")
const Category =require("../models/categoryModel")


const monthlyChart = async (req, res) => {
    try {
      const data = await Order.aggregate([
        {
          $match: {
            strOrderStatus: { $nin: ["Pending", "Cancelled"] }
          }
        },
      {
          $group: {
            _id: {
              year: { $year: "$createdDate" },
              month: { $month: "$createdDate" }
            },
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: "$intTotalOrderPrice" },
            totalAmountAfterDiscount: { $sum: "$totalAmountAfterDiscount"},
  
          }
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            totalOrders: 1,
            totalAmount: 1,
            totalAmountAfterDiscount: 1
          }
        },
        { $sort: { year: 1, month: 1 } }
      ]);


      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  const dailyChart = async (req, res) => {
    try {
      const data = await Order.aggregate([
        {
          $match: {
            strOrderStatus: { $nin: ["Pending", "Cancelled"] },
            createdDate: { $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
      {
          $group: {
            _id: {
              year: { $year: "$createdDate" },
              month: { $month: "$createdDate" },
              day: { $dayOfMonth: "$createdDate" }
            },
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: "$intTotalOrderPrice" },
            totalAmountAfterDiscount: { $sum: "$totalAmountAfterDiscount"},
          }
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day"
              }
            },
            totalOrders: 1,
            totalAmount: 1,
            totalAmountAfterDiscount: 1
          }
        },
        { $sort: { date: 1 } }
      ]);
 
      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  const yearlyChart = async (req, res) => {
    try {
      const data = await Order.aggregate([
        {
          $match: {
            strOrderStatus: { $nin: ["Pending", "Cancelled"] },
          }
        },
       {
          $group: {
            _id: {
              year: { $year: "$createdDate" }
            },
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: "$intTotalOrderPrice" },
            totalAmountAfterDiscount: { $sum: "$totalAmountAfterDiscount"},
  
          }
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            totalOrders: 1,
            totalAmount: 1,
            totalAmountAfterDiscount: 1
  
          }
        },
        { $sort: { year: 1 } }
      ]);
  
      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  const customChart = async (req, res) => {
    try {
     
      const { startDate, endDate } = req.query;
       
      
      const matchCriteria = {
        $match: {
            createdDate: {} ,
          strOrderStatus: { $nin: ["Pending", "Cancelled"] },
        }
      };
  
      
      if (startDate) {
        matchCriteria.$match.createdDate.$gte = new Date(startDate);
      }
  
      if (endDate) {
        matchCriteria.$match.createdDate.$lte = new Date(endDate);
      }
  
      const data = await Order.aggregate([
        matchCriteria,
        {
          $group: {
            _id: {
              year: { $year: "$createdDate" },
              month: { $month: "$createdDate" },
              day: { $dayOfMonth: "$createdDate" }
            },
            totalOrders: { $sum: 1 },
            totalAmount: { $sum: "$intTotalOrderPrice" },
            totalAmountAfterDiscount: { $sum: "$totalAmountAfterDiscount"}
          }
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day"
              }
            },
            totalOrders: 1,
            totalAmount: 1,
            totalAmountAfterDiscount: 1
          }
        },
        { $sort: { date: 1 } }
      ]);
  
      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };

  const topProducts = async (req, res) => {
    try {
       const data= await Order.aggregate([
       {$match: {
            strOrderStatus: { $nin: ["Pending", "Cancelled"] },
          }},
            { $unwind: "$arrProductsDetails" },
            { $group: {
              _id: "$arrProductsDetails.pkProductId",
              totalSold: { $sum: "$arrProductsDetails.intQuantity" },
              productName: { $first: "$arrProductsDetails.strProductName" }
            }},
            { $sort: { totalSold: -1 } },
            { $limit: 10 }, // Limit to the top 10 products
            {
              $project: {
                _id: 0,
                productName: 1,
                totalSold: 1
              }
            }
          ])
   
  
      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  const  topCategories = async (req, res) => {
    try {
      const data= await Order.aggregate([
        {$match: {
            strOrderStatus: { $nin: ["Pending", "Cancelled"] },
          }},
            { $unwind: "$arrProductsDetails" },
            { $group: {
              _id: "$arrProductsDetails.fkcategoryId",
              totalSold: { $sum: "$arrProductsDetails.intQuantity" }
            }},
            { $sort: { totalSold: -1 } },
            { $limit: 10 }, // Limit to the top 10 categories
            {
              $lookup: {
                from: "categories", // Assuming your category collection is named "categories"
                localField: "_id",
                foreignField: "_id",
                as: "category"
              }
            },
            {
              $project: {
                _id: 0,
                categoryName: { $arrayElemAt: ["$category.strCategoryName", 0] },
                totalSold: 1
              }
            }
          ])
          
  
      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" ,error:error});
    }
  }

  
  module.exports={
    monthlyChart,
    dailyChart,
    customChart,
    yearlyChart,
    topProducts,
    topCategories
  }