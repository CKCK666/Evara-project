const db=require("../config/connection")
const mongoose=require("mongoose")
const Admin =require("../models/adminModel")
const Product =require("../models/productModel")
const Category=require("../models/categoryModel")
const { ObjectId} = require('mongodb');
const { log, logger } = require("handlebars");
const User = require("../models/userModel")
const Coupon= require("../models/couponModel")


const listCoupons=async(req,res)=>{
    try {
        let findResult=await Coupon.aggregate([{$sort:{updatedAt:-1}}])
       let coupons=findResult.map((coupon,index)=>{
        const isoDate = coupon.endDate;
        const date = new Date(isoDate);
        const formattedDate = date.toString().substring(0, 15)
        return {
          ...coupon,
          index:index+1,
          endDate : formattedDate
         }
        
        })
    
        res.render("admin/couponsList",{layout:"admin_layout",admin:true,coupons})
    } catch (error) {
        
    }
}
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
        discount,
        minAmount,
        maxDiscount,
        startDate,
        endDate,
        usageLimit,
        couponType,
        products,
        categories,
        status
    } = req.body;
  
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    try {
      if (!name.trim() || !code.trim() || !discount || !minAmount || !startDate || !endDate || !usageLimit) {
        return res.json({ status: 'error', message: 'Required fields contain only blank spaces',filled:true });
    }
        const coupon = new Coupon({
            name,
            description,
            code,
            discount,
            minAmount,
            maxDiscount,
            startDate,
            endDate: end,
            products: couponType === 'products' ? products : null,
            categories: couponType === 'categories' ? categories : null,
            usageLimit,
            status
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
    let result=await Coupon.updateOne({_id:objectIdToUpdate,status:strStatus},{$set:{status:status,updatedAt:new Date()}})
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
           let findResult=await Coupon.find({_id:new ObjectId(req.query._id)})
           let queryMatch={
            $match:{
                strStatus:"Active"
            }
        }
        let products=await Product.aggregate([queryMatch])
        let categories=await Category.aggregate([queryMatch])
           let coupon=findResult.map((item)=>{
  
             return{
                ...item._doc,
             
             }
           })
           console.log(coupon);
           res.render("admin/editCoupon",{layout:"admin_layout",admin:true,coupon,products,categories})
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
      discount,
      minAmount,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      couponType,
      products,
      categories,
  
  } = req.body;
  const end =  new Date(endDate)
  end.setHours(23, 59, 59, 999);
  try {
  
    if (!name.trim() || !code.trim() || !discount || !minAmount || !startDate || !endDate || !usageLimit) {
      return res.json({ status: 'error', message: 'Required fields contain only blank spaces',filled:true });
  }
  console.log(req.body);
    await Coupon.findByIdAndUpdate(coupnId,{
      name,
      description,
      code,
      discount,
      minAmount,
      maxDiscount,
      startDate,
      endDate:end,
      products: couponType === 'products' ? products : null,
      categories: couponType === 'categories' ? categories : null,
      usageLimit,
      updatedAt: Date.now()
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