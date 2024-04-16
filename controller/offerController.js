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
        let findResult=await Offer.aggregate([{$match:{status:true}},{$sort:{updatedAt:-1}}])
       let offers=findResult.map((offer,index)=>{
        const isoDate = offer.endDate;
        const date = new Date(isoDate);
        const formattedDate = date.toString().substring(0, 15)
        return {
          ...offer,
          index:index+1,
          endDate : formattedDate
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
        description,
        discount,
        minAmount,
        maxDiscount,
        startDate,
        endDate,
        offerType,
        products,
        categories,
        status
    } = req.body;
  
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    try {
      if (!name.trim()  || !discount || !minAmount || !startDate || !endDate ) {
        return res.json({ status: 'error', message: 'Required fields contain only blank spaces',filled:true });
    }
    
        const offer = new Offer({
            name,
            description,
            discount,
            minAmount,
            maxDiscount,
            startDate,
            endDate: end,
            products: offerType === 'products' ? products : null,
            categories: offerType === 'categories' ? categories : null,
            status
        });
        
        await offer.save();

        if (offerType === 'products') {
          let product=await Product.aggregate([{$match:{pkProductId:new ObjectId(products)}}])
          discount=parseInt(discount)
          minAmount=parseInt(minAmount)
          maxDiscount=parseInt(maxDiscount)
          let intPrice=parseInt(product[0].intPrice)

          let discountAmount = (discount*intPrice) / 100;
          

     
        if(discountAmount>maxDiscount){
          discountAmount = maxDiscount 
        }
        if (discountAmount <minAmount) {
            discountAmount = minAmount;
        }

   let offerAmt = discountAmount;
    let   offerPrice =intPrice - discountAmount
    const productId = new ObjectId(products);

   
    const updateProduct = await Product.updateOne(
      { pkProductId: productId }, // Filter to match the document
      { $set: { offer: offerAmt,  offerPrice:offerPrice} } // Update to apply
  );
  
    if(updateProduct.modifiedCount>0){
      res.status(200).json({ status: 'success', message: 'offer created successfully', success:true });
    }else{
      res.status(200).json({ status: 'error', message: 'fail to create offer ', success:false });
    }
    
      

    }
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

  //edit offer page
  const getEditOffer=async(req,res)=>{
      try {
      
        if(req.query._id){
           let findResult=await Offer.find({_id:new ObjectId(req.query._id)})

           let queryMatch={
            $match:{
                strStatus:"Active"
            }
        }
        let products=await Product.aggregate([queryMatch])
        let categories=await Category.aggregate([queryMatch])
        let offer=findResult.map((item)=>{
  
          return{
             ...item._doc,
          
          }
        })
       
           res.render("admin/editOffer",{layout:"admin_layout",admin:true,offer,products,categories})
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
      description,
      discount,
      minAmount,
      maxDiscount,
      startDate,
      endDate,
      offerType,
      products,
      categories,
  
  } = req.body;
  const end =  new Date(endDate)
  end.setHours(23, 59, 59, 999);
  try {
  
    if (!name.trim()  || !discount || !minAmount || !startDate || !endDate ) {
      return res.json({ status: 'error', message: 'Required fields contain only blank spaces',filled:true });
  }
  console.log(req.body);
    await Offer.findByIdAndUpdate(offerId,{
      name,
      description,
      discount,
      minAmount,
      maxDiscount,
      startDate,
      endDate:end,
      products: offerType === 'products' ? products : null,
      categories: offerType === 'categories' ? categories : null,
      updatedAt: Date.now()
    },{
      runValidators: true,
      new: true,
    })

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
    blockCoupon,
    getEditOffer,
    offerEdit
}