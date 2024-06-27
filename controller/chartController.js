const Order = require('../models/orderModel');
const Product=require("../models/productModel")
const Category =require("../models/categoryModel");
const { ObjectId } = require('mongodb');


const dailyChart = async (req, res) => {
  try {
   
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
       const skip = (page - 1) * limit;
     
    let match={
      strPaymentStatus: 'Success',
      createdDate: { $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) }
    }

    const data = await Order.aggregate([
      {
        $match: {
          ...match
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

    const orders = await Order.aggregate([
      {
        $match: {
          ...match
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
    let count =await Order.countDocuments(match)
    const totalPages = Math.ceil((count?count : 0) / limit);
    
const currentPage=page
    res.json({ success: true, data,orders,totalPages,currentPage,skip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}


const monthlyChart = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
       const skip = (page - 1) * limit;
      const data = await Order.aggregate([
        {
          $match: {
            strPaymentStatus: 'Success'
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
      const currentDate = new Date();
  
      let matchQuery = { strPaymentStatus: "Success" };
      const thirtyDaysAgo = new Date(currentDate);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchQuery.createdDate = { $gte: thirtyDaysAgo, $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1) };
   
      const orders = await Order.aggregate([
        {
          $match: {
            ...matchQuery
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ]);
      let count =await Order.countDocuments(matchQuery)
      const totalPages = Math.ceil((count?count : 0) / limit);
      
  const currentPage=page

      res.json({ success: true, data,orders,totalPages,currentPage,skip});
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  const yearlyChart = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
         const skip = (page - 1) * limit;
      const data = await Order.aggregate([
        {
          $match: {
      strPaymentStatus: 'Success'
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
      const currentDate = new Date();
      let matchQuery = { strPaymentStatus: "Success" };
      matchQuery.createdDate = {
        $gte: new Date(currentDate.getFullYear(), 0, 1),
        $lt: new Date(currentDate.getFullYear() + 1, 0, 1)
    };
    const orders = await Order.aggregate([
      {
        $match: {
          ...matchQuery
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
    let count =await Order.countDocuments(matchQuery)
    const totalPages = Math.ceil((count?count : 0) / limit);
    
const currentPage=page
  
      res.json({ success: true, data,orders,totalPages,currentPage,skip });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }

  const customChart = async (req, res) => {
    try {
     
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
         const skip = (page - 1) * limit;

      const { startDate, endDate } = req.query;
      const parseEndDate = (dateString) => {
        const date = new Date(dateString);
        date.setHours(23, 59, 59, 999); // Set time to the end of the day
        return date;
    };
     
      const matchCriteria = {
        $match: {
            createdDate: {} ,
          strPaymentStatus: 'Success'
        }
      };
  
      
      if (startDate) {
        matchCriteria.$match.createdDate.$gte = new Date(startDate);
      }
  
      if (endDate) {
        matchCriteria.$match.createdDate.$lte = parseEndDate(endDate);
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
                day: "$_id.day",
                month: "$_id.month",
                year: "$_id.year",
                
                
              }
            },
            totalOrders: 1,
            totalAmount: 1,
            totalAmountAfterDiscount: 1
          }
        },
        { $sort: { date: 1 } }
      ]);

      const orders = await Order.aggregate([
       matchCriteria,
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ]);
      let count =await Order.countDocuments(matchCriteria.$match)
      const totalPages = Math.ceil((count?count : 0) / limit);
      
  const currentPage=page
   
  
      res.json({ success: true, data ,orders,totalPages,currentPage,skip});
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
                from: Category.collection.name, // Assuming your category collection is named "categories"
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