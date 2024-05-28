const db=require("../config/connection")
const mongoose=require("mongoose")
const Admin =require("../models/adminModel")
const Product =require("../models/productModel")
const Category =require("../models/categoryModel")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const { ObjectId} = require('mongodb');
const {USER_COLLECTION,ADMIN_COLLECTION, CATEGORY_COLLECTION, PRODUCTS_COLLECTION, ORDER_COLLECTION}=require("../config/collections");
const { log, logger } = require("handlebars");
const User = require("../models/userModel")
const Offer= require("../models/offerModel")
 
 
 
 //add categories page
 const addCategory=async(req,res)=>{
    
    try {
    
      
       const existingCategory= await Category.find({strCategoryName:{$regex:req.body.category,$options:"i"},strStatus:{$ne:"Deleted"}})
      if(existingCategory.length){
        return res.json({success:false,message:"category already exist"})
      }
      let dataToAdd=new Category({
        pkCategoryId:new ObjectId(),
        strCategoryName:req.body.category,
        strDescription:req.body.description,
        strStatus:"Active",
        createdDate:new Date(),
        updatedDate:null
      })
    let result = await dataToAdd.save()

     if(result._id){
      res.json({success:true,message:"successfully added category"})
     }
     else{
      res.json({success:false,message:"fail to  add category"})
     }
   
    } catch (error) {
      res.json({success:false,message: error.message})
    }
    
     
   }

   //get category page
   const getCategoryPage=async(req,res)=>{
    try {
      let count=await Category.countDocuments()
      if(count>0){
        let result=await Category.find({strStatus:{$ne:"Deleted"}}).populate({
          path: 'offer',
          match: { status: true }
      });
       
      
        let categories= result.map((category,index)=>({...category._doc,index:index+1}))
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const availableOffers = await Offer.aggregate([{$match:{ status : true, expiryDate : { $gte : today }}}])

         
        res.render("admin/categoryPage",{layout:"admin_layout",count,categories,admin:true,availableOffers})
      }
      else{
        res.render("admin/categoryPage",{layout:"admin_layout",count,admin:true})
      }
    } catch (error) {
      res.status(500).json({success:false,message: error.message})
    }
   
     
   }
// delete category
   const deleteCategory=async(req,res)=>{
    try {
      let {id}=req.body
      const objectIdToUpdate = new ObjectId(id);
      let result=await Category.updateOne({pkCategoryId:objectIdToUpdate},{$set:{strStatus:"Deleted",updatedDate:new Date()}})
       
      if (result.modifiedCount>0) {
       
        res.json({success:true,message: 'successfully  deleted!',categoryDeleted:true})
      }
      else{
        console.log("not deleted");
        res.json({success:false,message: 'Category not deleted!'})
      }
      
     } catch (error) {
      console.log(error.message);
        res.json({success:false,message: error.message})
     }
  }

  //block category
  const blockCategory=async(req,res)=>{
    let {id,strStatus}=req.body
     let status=strStatus=="Active"?"Blocked":"Active"
   try {
    const objectIdToUpdate = new ObjectId(id);
    let result=await Category.updateOne({pkCategoryId:objectIdToUpdate,strStatus},{$set:{strStatus:status,updatedDate:new Date()}})
      console.log(result);
    if (result.modifiedCount>0) {
      console.log("blocked/unblock");
      res.json({success:true,message: 'successfully  updated!',categoryBlocked:true})
    }
    else{
      console.log("not blocked/unblock");
      res.json({success:false,message: 'failed to update!'})
    }
    
   } catch (error) {
    console.log(error.message);
      res.json({success:false,message: error.message})
   }
  }

  //edit category page
  const getEditCategory=async(req,res)=>{
    try {
      let pkCategoryId=req.query.pkCategoryId
      const objectIdToUpdate = new ObjectId(pkCategoryId);
        let category=await Category.find({pkCategoryId:objectIdToUpdate,strStatus:{$ne:"Deleted"}})
         
         if(category.length>0){
          let transformedCategory = category.map(doc => ({
            _id: doc._id,
            pkCategoryId: doc.pkCategoryId,
            strCategoryName: doc.strCategoryName,
            strDescription: doc.strDescription,
            strStatus: doc.strStatus,
            createdDate: doc.createdDate,
            updatedDate: doc.updatedDate,
            __v: doc.__v
        }));
       
       
         
        
          res.render("admin/categoryPage",{layout:"admin_layout",category:transformedCategory,admin:true})
         }
        else{
          res.status(200).json({success:false,message:"fail to fetch edit category page"})
        }
    
    } catch (error) {
      res.status(500).json({success:false,message: error.message})
    }
   
     
   }

   //edit category
  const editCategory=async(req,res)=>{
  
   try {

    const objectIdToUpdate = new ObjectId(req.body.category_id);
  
    let dateToUpdate={
      updatedDate:new Date()
    }
    if (req.body.category){
      const strCategoryName=req.body.category
   
     
     let findCate=await Category.find({pkCategoryId:{$ne:objectIdToUpdate},strStatus:"Active",strCategoryName:{$regex:strCategoryName,$options:"i"}})
     console.log(findCate);
      if(!findCate.length){
        dateToUpdate={
          ...dateToUpdate,
          strCategoryName:req.body.category
        }
      }
      else{
        return  res.json({success:false,message: 'Category already exist'})
      }
    }

if(req.body.description){
  dateToUpdate={
    ...dateToUpdate,
    strDescription:req.body.description
  }
}
    
   
    
    let result=await Category.updateOne({pkCategoryId:objectIdToUpdate},{$set:dateToUpdate})
      console.log(result);
    if (result.modifiedCount>0) {
    
      res.json({success:true,message: 'successfully  updated!',categoryBlocked:true})
    }
    else{
     
      res.json({success:false,message: 'failed to update!'})
    }
    
   } catch (error) {
    console.log(error.message);
      res.json({success:false,message: error.message})
   }
  }

  const applyCategoryOffer = async (req,res,next) => {
    try {
      const { offerId, categoryId } = req.body;
  
      // Get the category discount
      const categoryOffer = await Offer.findOne({ _id: offerId });
  
      if (!categoryOffer) {
        return res.json({ success: false, message: 'Category Offer not found' });
      }
  
      // Update the category with the offer
      await Category.updateOne({ _id: categoryId }, { $set: { offer: offerId } });
  
      // Update discounted prices for all products in the category
      const productsInCategory = await Product.find({ fkcategoryId:new ObjectId(categoryId) });
  
      for (const product of productsInCategory) {
        const productOffer = product.offer ? await Offer.findOne({ _id: product.offer }) : null;
  
        // Check if the product has no offer or the category offer has a greater discount
        if (!product.offer || (productOffer && productOffer.percentage < categoryOffer.percentage)) {
          const originalPrice = parseFloat(product.intPrice);
          const offerPrice = originalPrice - (originalPrice * categoryOffer.percentage) / 100;
  
          // Update the product with the category offer details
          await Product.updateOne(
            { _id: product._id },
            {
              $set: {
                offer: offerId,
                offerPrice: offerPrice,
              },
            }
          );
        }
      }
  
      res.json({ success: true });
    } catch (error) {
      
      next(error)
    }
  };

  
  const removeCategoryOffer = async (req,res,next) => {
    try {
      const { categoryId } = req.body;
  
      // Get the category offer
      const category = await Category.findById(categoryId).populate('offer');
  
      if (!category) {
        return res.json({ success: false, message: 'Category not found' });
      }
  
      // Update category to remove the offer
      await Category.updateOne({ _id: categoryId }, { $unset: { offer: '' } });
  
      // Update all products in the category to remove offer details and reset discounted prices
      const productsInCategory = await Product.find({ fkcategoryId:new ObjectId(categoryId) });
  
      for (const product of productsInCategory) {
        if (product.offer) {
          const productOffer = await Offer.findById(product.offer);
  
          // Check if the product has a greater discount than the category's offer
          if (productOffer && productOffer.percentage > category.offer.percentage) {
            continue; // Skip this product, as it has a greater discount
          }
        }
  
        // Remove the offer and reset discounted prices for the product
        await Product.updateOne(
          { _id: product._id },
          {
            $unset: {
              offer: '',
              offerPrice: '',
            },
          }
        );
      }
  
      res.json({ success: true });
    } catch (error) {
      
      next(error)
    }
  };
  

  module.exports={
    addCategory,
    getCategoryPage,deleteCategory,
    blockCategory,getEditCategory,
    editCategory,applyCategoryOffer,
    removeCategoryOffer

  }