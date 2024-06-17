const db=require("../config/connection")
const mongoose=require("mongoose")
const Admin =require("../models/adminModel")
const Product =require("../models/productModel")
const Category=require("../models/categoryModel")
const { ObjectId} = require('mongodb');
const { log, logger } = require("handlebars");
const User = require("../models/userModel")
const Coupon= require("../models/couponModel")


const listCoupons = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const skip = (page - 1) * limit;

      // Aggregate query with sorting and pagination
      const coupons = await Coupon.aggregate([
          { $sort: { startDate: -1 } },
          { $skip: skip },
          { $limit: limit }
      ]);

      // Count the total number of coupons
      const totalCoupons = await Coupon.countDocuments();
      const totalPages = Math.ceil(totalCoupons / limit);

      res.render("admin/couponsList", {
          layout: "admin_layout",
          admin: true,
          coupons,
          totalPages,
          currentPage: page
      });
  } catch (error) {
      console.error("Error fetching coupons: ", error);
      res.status(500).json({ success: false, message: error.message });
  }
};

const getCreateCoupons=async(req,res)=>{
    try {
        let queryMatch={
            $match:{
                strStatus:"Active"
            }
        }
        let products=await Product.aggregate([queryMatch])
        let categories=await Category.aggregate([queryMatch])
        res.render("admin/createCoupon",{layout:"admin_layout",admin:true,products,categories})
    } catch (error) {
        
    }
}


const createCoupon = async (req, res) => {
    const {
        name,
        description,
        code,
        discountPercentage,
        startDate ,
        expireDate,
        minimumSpend,
    } = req.body;
  
    let percent=parseFloat(discountPercentage)
    
    try {
      const regex = /[a-zA-Z]{3,}/;
      if (!name.trim() || !code.trim() || !description.trim() || !discountPercentage  || !startDate || ! expireDate || !minimumSpend) {
        return res.json({ status: 'error', message: 'Required fields contain only blank spaces',filled:true });
    }

    if(percent<=0  || percent>100){
      return res.json({ status: 'error', message: 'Invalid percentage',filled:true });
     }
     const modifiedName = name.toUpperCase().replace(/\s+/g, '');
     if(!regex.test(modifiedName)){
      return res.json({ status: 'error', message: "Name must contain at least three alphabetic characters.",filled:true });
     }
     const existingCoupon= await Coupon.find({name:modifiedName,status:{$ne:"Deleted"}})
     if (existingCoupon.length>0) {
      return res.json({ status: 'error', message: 'Offer with this name already exists.', filled: true });
  }
        const coupon = new Coupon({
          name:modifiedName,
          description,
          code,
          discountPercentage:percent,
          startDate ,
          expireDate,
          minimumSpend:parseFloat(minimumSpend),
        });
        
        await coupon.save();
        res.status(200).json({ status: 'success', message: 'Coupon created successfully', success:true });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
          console.log(error);
            // Handle validation errors
            return res.json({ status: 'error', message: 'Validation error', validation:true });
        } 
          else if (error && error.code === 11000) {
          return res.json({ status: "failed", message: "Duplicate entry", duplicate: true });
      } 
       else {
            console.error(error.message,'Error creating coupon:', error);
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
     
    }
  };

   //block coupon
   const blockCoupon=async(req,res)=>{
    let {id,strStatus}=req.body
    console.log(req.body);
     let status=strStatus=="Active"?"Blocked":"Active"
   try {
    const objectIdToUpdate = new ObjectId(id);
    let result=await Coupon.updateOne({_id:objectIdToUpdate,status:strStatus},{$set:{status:status}})
     console.log(result);
    if (result.modifiedCount>0) {
      console.log("blocked/unblock");
      res.json({success:true,message: 'successfully  updated!'})
    }
    else{
      console.log("not deleted");
      res.json({success:false,message: 'failed to update!'})
    }
    
   } catch (error) {
    console.log(error.message);
      res.json({success:false,message: error.message})
   }
  }

  const getEditCoupon=async(req,res)=>{
      try {
        if(req.query._id){
           let coupon=await Coupon.aggregate([{$match:{_id:new ObjectId(req.query._id)}}])
         
         res.render("admin/editCoupon",{layout:"admin_layout",admin:true,coupon})
        }
        else{
            res.json({success:false,message:"coupon id not found"})
        }
      
     
      } catch (error) {
          
      }
  }

  const couponEdit = async (req,res)=>{
    console.log("edit couponsss")
    const {
      coupnId,
      name,
      description,
      code,
      percentage,
      startDate ,
      expireDate,
      minimum,
  
  } = req.body;
 console.log(req.body);
  let percent=parseFloat(percentage)
  try {
    const regex = /[a-zA-Z]{3,}/;
    if (!name.trim() || !code.trim() || !percentage || !startDate || !expireDate || !minimum ||!description.trim()) {
    
      return res.json({ status: 'error', message: 'Required fields contain only blank spaces',filled:true });
  }
  if(percent<=0  || percent>100){
    return res.json({ status: 'error', message: 'Invalid percentage',filled:true });
   }
   if(minimum<=0 ){
    return res.json({ status: 'error', message: 'Invalid minimum spend',filled:true });
   }
   const modifiedName = name.toUpperCase().replace(/\s+/g, '');
   if(!regex.test(modifiedName)){
    return res.json({ status: 'error', message: "Name must contain at least three alphabetic characters.",filled:true });
   }
   
   const existingCoupon= await Coupon.find({_id:{$ne:new ObjectId(coupnId)},name:modifiedName,status:{$ne:"Deleted"}})
   if (existingCoupon.length>0) {
    return res.json({ status: 'error', message: 'Offer with this name already exists.',filled:true});
}

    await Coupon.findByIdAndUpdate(coupnId,{
      name:modifiedName,
      description,
      code,
      discountPercentage:percent,
      startDate ,
      expireDate,
      minimumSpend:minimum,
    },{
      runValidators: true,
      new: true,
    })

   return res.status(200).json({ status: 'success', message: 'Coupon created successfully', success:true });
  } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        console.log(error);
          // Handle validation errors
          return res.json({ status: 'error', message: 'Validation error', validation:true });
      } 
        else if (error && error.code === 11000) {
        return res.json({ status: "failed", message: "Duplicate entry", duplicate: true });
    } 
     else {
          console.error(error.message,'Error creating coupon:', error);
          return res.status(500).json({ status: 'error', message: 'Internal server error' });
      }
   
  }
  }

module.exports={
    listCoupons,
    getCreateCoupons,
    createCoupon,
    blockCoupon,
    getEditCoupon,
    couponEdit
}