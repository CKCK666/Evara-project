const db=require("../config/connection")
const mongoose=require("mongoose")
const Admin =require("../models/adminModel")
const Product =require("../models/productModel")
const Category =require("../models/categoryModel")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const { ObjectId} = require('mongodb');
const { log, logger } = require("handlebars");
const User = require("../models/userModel")
const Cart = require("../models/cartModel")



//product list page
const getProductList=async(req,res)=>{
    try {
     let count=await Product.countDocuments()
     if(count>0){
       let result =await Product.find({strStatus:{$ne:"Deleted"}})
       let products= result.map((product,index)=>{
         const isoDate = product.createdDate;
         const date = new Date(isoDate);
         const formattedDate = date.toString().substring(0, 15)
         return {
           ...product._doc,
           index:index+1,
           createdDate: formattedDate
          }
         
         })
     
         res.render("admin/listProducts",{layout:"admin_layout",products,admin:true})
       }
     else{
       res.render("admin/listProducts",{layout:"admin_layout",admin:true}) 
     }
   
     
    } catch (error) {
     res.json({success:true,message:error.message})
    }
  
   
   }
 
   //create product page
 const getProductAdd=async(req,res)=>{
   try {
     let categories=await Category.find({strStatus:{$ne:"Deleted"}})
     let toArray=categories.map((doc)=>({
       ...doc._doc
     }))
     
     if(req.query.pkProductId){
      
       const pkProductId = new ObjectId(req.query.pkProductId);
      
       let product=await Product.find({pkProductId:pkProductId,strStatus:{$ne:"Deleted"}})
     
       if (product.length) {
         
         res.render("admin/addProduct",{layout:"admin_layout",product,categories,admin:true})
       } else {
         res.render("admin/addProduct",{layout:"admin_layout",admin:true})
       }
      }
     else{
        res.render("admin/addProduct",{layout:"admin_layout",categories:toArray,admin:true})
     }
    
   } catch (error) {
     console.log(error);
     res.status(200).json({success:false,message: error.message})
   }
   
   
   
   }
 
   //create product
   const addProduct=async(req,res)=>{
 
     try {
       let files=req.files
       
      
        let mainProductUrl=""
        let arrayOtherImages
      
       let  mainProductImg=files.filter(item=>
          item.fieldname==='mainProductImg'
     )
    
    
     if(mainProductImg){mainProductUrl=mainProductImg[0].path}
     
     let otherProductImgs=files.filter((item)=>{
       if (item.fieldname==='otherProductImg1' || item.fieldname=== 'otherProductImg2') {
         return item.path
       }
       
      } )
 
      if(otherProductImgs.length){
      arrayOtherImages= otherProductImgs.map((item,index)=>{
       if(index===0){
         return {
           imageUrl1:item.path
  
          }
       }else{
         return {
           imageUrl2:item.path
  
          }
       }
         
       })
       
      }
   
      
        const existingProduct= await Product.find({strProductName:{$regex:req.body.strProductName,$options:"i"},strStatus:{$ne:"Deleted"}})
       if(existingProduct.length){
         return res.json({success:false,message:"Product name already exist"})
       }
       let dataToAdd=new Product({
         pkProductId:new ObjectId(),
         strProductName:req.body.strProductName,
         strDescription:req.body.strDescription,
         fkcategoryId:new ObjectId(req.body.pkCategoryId),
         intPrice:parseFloat(req.body.intPrice),
         intStock:parseInt(req.body.intStock),
         mainProductUrl,
         arrayOtherImages,
         strStatus:"Active",
         createdDate:new Date(),
         updatedDate:null
       })
     let result = await dataToAdd.save()
    
      if(result._id){
       
       res.json({success:true,message:"successfully added product"})
      }
      else{
       res.json({success:false,message:"fail to  add product"})
      }
    
     } catch (error) {
       res.json({success:false,message: error.message})
     }
     
      
    }
 
   //edit product page
   const getProductEdit=async(req,res)=>{
     try {
       let categories=await Category.find({strStatus:{$ne:"Deleted"}})
       let catToArray=categories.map((doc)=>({
         ...doc._doc
       }))
       if(req.query.pkProductId){
        
         const pkProductId = new ObjectId(req.query.pkProductId);
        
         let product=await Product.find({pkProductId:pkProductId,strStatus:{$ne:"Deleted"}})
       
         if (product.length) {
           let proToArray= product.map((doc)=>({
             ...doc._doc
           }))
       
           res.render("admin/editProduct",{layout:"admin_layout",product:proToArray,categories:catToArray,admin:true,imageUrl1:proToArray[0].arrayOtherImages[0].imageUrl1,imageUrl2:proToArray[0].arrayOtherImages[1].imageUrl2})
         } else {
           res.redirect("/admin/listProduct",{layout:"admin_layout",admin:true})
         }
        }
       else{
          res.redirect("/admin/listProduct",{layout:"admin_layout",admin:true})
       }
      
     } catch (error) {
       console.log(error);
       res.status(200).json({success:false,message: error.message})
     }
     
     
     
     }
   
     //edit product
   const editProduct=async(req,res)=>{
     
     try {
    
       if(req.body.pkProductId){
 
     let pkProductId=new ObjectId(req.body.pkProductId)
 
 
    
        const existingProduct= await Product.find({strProductName:req.body.strProductName,strStatus:{$ne:"Deleted"},pkProductId:{$ne:pkProductId}})
     
       if(existingProduct.length){
         return res.json({success:false,message:"Product name already exist"})
       }
         
       let dataToAdd={
       
         strProductName:req.body.strProductName,
         strDescription:req.body.strDescription,
         fkcategoryId:req.body.pkCategoryId,
         intPrice:parseFloat(req.body.intPrice),
         intStock:parseInt(req.body.intStock),
         updatedDate:new Date()
       }
     let result = await Product.updateOne({pkProductId},{$set:dataToAdd})
     console.log(result);
      if(result.modifiedCount>0){
       res.json({success:true,message:"Successfully edited product"})
      }
      else{
       res.json({success:false,message:"Fail to  edit product"})
      }
     }
     else{
       res.json({success:false,message:"Product id not found"})
     }
     } catch (error) {
       console.error(error.message)
       res.json({success:false,message: error.message})
     }
     
      
    }
      //edit product
   const editProductImages=async(req,res)=>{
   
     try {
   
       if(req.body.pkProductId){
         let pkProductId= new ObjectId(req.body.pkProductId);
         let dataToUpdate={}
      
       if(req.files){
       let files=req.files
       
        let  mainProductImg=files.filter(item=>
           item.fieldname==='mainProductImg'
      )
     
     
      if(mainProductImg.length){
       dataToUpdate={
       ...dataToUpdate,
       mainProductUrl:mainProductImg[0].path
       }
 
     }
      
      let otherProductImgs=files.filter(async(item)=>{
        if (item.fieldname==='otherProductImg1') {
          dataToUpdate={
           ...dataToUpdate,
           "arrayOtherImages.0.imageUrl1":item.path,
          }
 
          } 
          if (item.fieldname==='otherProductImg2') {
           dataToUpdate={
           ...dataToUpdate,
           "arrayOtherImages.1.imageUrl2": item.path
           }
      
      
      
         }
        
        
       } )
  
     
      
     }
 
 
   
       let dataToAdd={
        ...dataToUpdate,
       
         updatedDate:new Date()
       }
    
     
      console.log(dataToAdd);
     let result = await Product.updateOne({pkProductId},{$set:dataToAdd})
     console.log(result);
      if(result.modifiedCount>0){
       res.json({success:true,message:"successfully edited product"})
      }
      else{
       res.json({success:false,message:"fail to  edit product"})
      }
     }
     else{
       res.json({success:false,message:"Product id not found"})
     }
     } catch (error) {
       res.json({success:false,message: error.message})
     }
     
      
    }
 
    // delete category
    const deleteProduct=async(req,res)=>{
     try {
       let {id}=req.body
       console.log(id);
       const objectIdToUpdate = new ObjectId(id);
       let result=await Product.updateOne({pkProductId:objectIdToUpdate},{$set:{strStatus:"Deleted",updatedDate:new Date()}})
         console.log(result);
       if (result.modifiedCount>0) {
        
         res.json({success:true,message: 'successfully  deleted!',productDeleted:true})
       }
       else{
         console.log("not deleted");
         res.json({success:false,message: 'Product not deleted!'})
       }
       
      } catch (error) {
       console.log(error.message);
         res.json({success:false,message: error.message})
      }
   }
 
   //block category
   const blockProduct=async(req,res)=>{
     let {id,strStatus}=req.body
      let status=strStatus=="Active"?"Blocked":"Active"
    try {
     const objectIdToUpdate = new ObjectId(id);
     let result=await Product.updateOne({pkProductId:objectIdToUpdate,strStatus},{$set:{strStatus:status,updatedDate:new Date()}})
       console.log(result);
     if (result.modifiedCount>0) {
       console.log("blocked/unblock");
       res.json({success:true,message: 'successfully  updated!',productBlocked:true})
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

   const getSingleProductPage=async(req,res)=>{
 
    try {
      if(req.query.pkProductId){
        let pkProductId=new ObjectId(req.query.pkProductId)
        
         let userId=req.session.user.pkUserId
        
         let cartCount=  await getCartCount(userId)
       
        let productFind =await Product.find({pkProductId:pkProductId,strStatus:"Active"})
        let product=productFind.map((pro)=>{
           return{...pro._doc}
        })
        
          if(product.length){
            
          res.render("user/productSingle",{layout:"user_layout",user:true,product,imageUrl1:product[0].arrayOtherImages[0].imageUrl1,imageUrl2:product[0].arrayOtherImages[1].imageUrl2,userId,cartCount})
          }
          else{
            res.json({success:false,message:"product  not found"})
          }
      }
      else{
        res.json({success:false,message:"product id not found"})
      }
    } catch (error) {
      res.json({success:false,message:error.message})
    }
  }

   module.exports={getProductList,
    getProductAdd,
    addProduct,editProduct,deleteProduct,
    blockProduct,
    getProductEdit,
    editProductImages,
    getSingleProductPage
  
  }

  async function getCartCount(userId) {

    let userCart=await Cart.find({pkUserId:new ObjectId(userId),strStatus:"Active"})
    let cartCount=0
    if(userCart && userCart.length){
      let totalQuantity=await Cart.aggregate([
       {
         $match:{
           pkUserId:new ObjectId(userId)
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
    else{
      return cartCount
    }
    
  }