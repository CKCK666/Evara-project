const db=require("../config/connection")
const mongoose=require("mongoose")
const Admin =require("../models/adminModel")
const Product =require("../models/productModel")
const Category=require("../models/categoryModel")
const { ObjectId} = require('mongodb');
const { log, logger } = require("handlebars");
const User = require("../models/userModel")
const Coupon= require("../models/couponModel")
const Offer= require("../models/offerModel")
const { sortProducts } = require("./productController")

const listOffer=async(req,res)=>{
    try {
        let findResult=await Offer.aggregate([{$sort:{startingDate:1}}])
       let offers=findResult.map((offer,index)=>{
        // const isoDate = offer.endDate;
        // const date = new Date(isoDate);
        // const formattedDate = date.toString().substring(0, 15)
        return {
          ...offer,
          index:index+1,
          // endDate : formattedDate
         }
        
        })
    
        res.render("admin/listOffer",{layout:"admin_layout",admin:true,offers})
    } catch (error) {
        
    }
}
const getCreateOffer=async(req,res)=>{
    try {
        let queryMatch={
            $match:{
                strStatus:"Active"
            }
        }
        let products=await Product.aggregate([queryMatch])
        let categories=await Category.aggregate([queryMatch])
        res.render("admin/addOffer",{layout:"admin_layout",admin:true,products,categories})
    } catch (error) {
        return res.json({ status: 'error', message: error.message });
    }
}


const createOffer = async (req, res) => {

    let {
        name,
        startingDate,
        expiryDate,
        percentage,
        description
    } = req.body;

   let percent=parseFloat(percentage)

    
    
    try {
      const regex = /[a-zA-Z]{3,}/;
      if (!name.trim() || !description.trim() || !percentage.trim() || !startingDate.trim() || !expiryDate.trim()) {
        return res.json({ status: 'error', message: 'Required fields contain only blank spaces', filled: true });
    }
     if(percent<0  || percent>100){
      return res.json({ status: 'error', message: 'Invalid percentage',filled:true });
     }
     const modifiedName = name.toUpperCase().replace(/\s+/g, '');
     if(!regex.test(modifiedName)){
      return res.json({ status: 'error', message: "Name must contain at least three alphabetic characters.",filled:true });
     }
     const existingOffer= await Offer.find({name:modifiedName,status:{$ne:false}})
    
     if (existingOffer.length>0) {
      return res.json({ status: 'error', message: 'Offer with this name already exists.', filled: true });
  }
    
        const offer = new Offer({
          name: modifiedName,
            description,
            percentage:percent,
             startingDate,
             expiryDate
        });
        
        await offer.save();

      res.status(200).json({ status: 'success', message: 'offer created successfully', success:true });

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

   //block offer
   const blockOffer=async(req,res)=>{
    let {id,strStatus}=req.body
    let status=strStatus=="true"?false:true
    console.log("block offer");
    
   try {
    const objectIdToUpdate = new ObjectId(id);
    let result=await Offer.updateOne({_id:objectIdToUpdate},{$set:{status:status}})
     console.log(result);
    if (result.modifiedCount>0) {
      console.log("blocked/unblock");
      res.json({success:true,message: 'successfully  updated!'})
    }
    else{
      
      res.json({success:false,message: 'failed to update!'})
    }
    
   } catch (error) {
    console.log(error.message);
      res.json({success:false,message: error.message})
   }
  }

  //edit offer page
  const getEditOffer=async(req,res)=>{
      try {
      
        if(req.query._id){
           let findResult=await Offer.find({_id:new ObjectId(req.query._id)})

          
    
        let offer=findResult.map((item)=>{
  
          return{
             ...item._doc,
          
          }
        })
       
           res.render("admin/editOffer",{layout:"admin_layout",admin:true,offer})
        }
        else{
            res.json({success:false,message:"offer id not found"})
        }
      
     
      } catch (error) {
        res.json({success:false,message:error.message})
      }
  }

  const offerEdit = async (req,res)=>{
    console.log("edit offer")
    const {
      offerId,
      name,
      startingDate,
      expiryDate,
      percentage,
      description
  
  } = req.body;
  console.log(req.body);
  let percent=parseFloat(percentage)
  let findId=new ObjectId(offerId)
  try {
  
    const regex = /[a-zA-Z]{3,}/;
    if (!name.trim() || !description.trim() || !percentage.trim() || !startingDate.trim() || !expiryDate.trim()) {
      return res.json({ status: 'error', message: 'Required fields contain only blank spaces', filled: true });
  }

  const modifiedName = name.toUpperCase().replace(/\s+/g, '');
  if(!regex.test(modifiedName)){
   return res.json({ status: 'error', message: "Name must contain at least three alphabetic characters.",filled:true });
  }
  const existingOffer= await Offer.find({_id:{$ne:findId},name:modifiedName,status:{$ne:false}})
 
  if (existingOffer.length>0) {
   return res.json({ status: 'error', message: 'Offer with this name already exists.', filled: true });
}

   if(percent<0  || percent>100){
    return res.json({ status: 'error', message: 'Invalid percentage',filled:true });
   }
   if(!regex.test(name)){
    return res.json({ status: 'error', message: "Name must contain at least three alphabetic characters.",filled:true });
   }
  
  console.log(req.body);
    await Offer.findByIdAndUpdate(offerId,{
             name: modifiedName,
            description,
            percentage:percent,
             startingDate,
             expiryDate
    },{
      runValidators: true,
      new: true,
    })

    let products=await Product.find({offer:new ObjectId(offerId)}).populate("offer")
    if(products && products.length){
      for (let product of products){
  
      let discount=parseFloat(product.intPrice)*parseFloat(product.offer.percentage)/100
      let offerPrice=parseFloat(product.intPrice)-discount
       await Product.updateOne({pkProductId:new ObjectId(product.pkProductId)},{$set:{offerPrice}})
     

    await Product.findByIdAndUpdate(product._id,{
    offerPrice
})
} 
}


   return res.status(200).json({ status: 'success', message: 'Offer updated successfully', success:true });
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
   listOffer,
    createOffer,
    getCreateOffer,
    blockOffer,
    getEditOffer,
    offerEdit
}