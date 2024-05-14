const db=require("../config/connection")
const mongoose=require("mongoose")
const Admin =require("../models/adminModel")
const Product =require("../models/productModel")
const Category =require("../models/categoryModel")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const { ObjectId, ReturnDocument} = require('mongodb');
const { log, logger } = require("handlebars");
const User = require("../models/userModel")
const Cart = require("../models/cartModel")
const Offer= require("../models/offerModel")
const {getCartCount}=require("../utils/cart")
const {getWishListCount}=require("../utils/wishlist")
const Wishlist = require("../models/wishListModel")

//product list page
const getProductList=async(req,res)=>{
    try {
     let count=await Product.countDocuments()
     if(count>0){
       let result =await Product.find({strStatus:{$ne:"Deleted"}}).populate({
        path: 'offer',
        match: { status: true }
    });
       let products= result.map((product,index)=>{
         const isoDate = product.createdDate;
         const date = new Date(isoDate);
         const formattedDate = date.toString().substring(0, 15)
         return {
           ...product._doc,
           index:index+1,
           createdDate: formattedDate,
           offerPercentage:product.offer?product.offer.percentage:"",
           offerName:product.offer?product.offer.name:""

          }
         
         })
         const availableOffers = await Offer.aggregate([{$match:{ status : true, expiryDate : { $gte : new Date() }}}])
        console.log(products);
     
         res.render("admin/listProducts",{layout:"admin_layout",products,admin:true,availableOffers})
       }
     else{
       res.render("admin/listProducts",{layout:"admin_layout",admin:true}) 
     }
   
     
    } catch (error) {
     res.json({success:false,message:error.message})
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
  console.log("add to product router");
     try {
       let files=req.files
       console.log(files);
       if(!files.length || files.length!=3){
        return   res.json({success:false,message:"Crop Images properly"})
       }
     

       let mainProductUrl
       let arrayOtherImages=[]

       files.map((file)=>{
        if (file.fieldname === 'Main-Image') {
          mainProductUrl = file.filename;
      } else if (file.fieldname === 'Image-1') {
          arrayOtherImages.push({ imageUrl1: file.filename });
      } else if (file.fieldname === 'Image-2') {
          arrayOtherImages.push({ imageUrl2: file.filename });
      }
       })
   
      
        
        
      
     
   
      
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
       
     return    res.json({success:true,message:"successfully added product"})
      }
      else{
     return   res.json({success:false,message:"fail to  add product"})
      }
    
     } catch (error) {
      return res.json({success:false,message: error.message})
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
      let stock= parseInt(req.body.intStock)
    
    
        const existingProduct= await Product.find({strProductName:req.body.strProductName,strStatus:{$ne:"Deleted"},pkProductId:{$ne:pkProductId}})
     
       if(existingProduct.length){
         return res.json({success:false,message:"Product name already exist"})
       }
         
       let dataToAdd={
       
         strProductName:req.body.strProductName,
         strDescription:req.body.strDescription,
         fkcategoryId:req.body.pkCategoryId,
         intPrice:parseFloat(req.body.intPrice),
         intStock:stock,
         updatedDate:new Date()
       }
     let result = await Product.updateOne({pkProductId},{$set:dataToAdd})
      
      if(result.modifiedCount>0){
      
        let productObj=await Product.findOne({pkProductId})
        
      //     {
      //         $match: {
      //             "arrProducts.pkProductId": pkProductId,
      //             "strStatus": "Active"
      //         }
      //     },
      //     {
      //         $addFields: {
      //             arrProducts: {
      //                 $filter: {
      //                     input: "$arrProducts",
      //                     as: "product",
      //                     cond: { $ne: ["$$product.pkProductId",pkProductId] }
      //                 }
      //             }
      //         }
      //     },
      //     {
      //         $push: {
      //             arrProducts: {
      //               $each: productArray
      //             }
      //         }
      //     }
      // ]);


// Find all wishlists that contain the product to be updated
const wishlists = await Wishlist.find({ "arrProducts.pkProductId": pkProductId, "strStatus": "Active" });

// Loop through each wishlist and update it individually
for (const wishlist of wishlists) {
    // Pull the existing product from arrProducts
    await Wishlist.updateOne(
        { _id: wishlist._id },
        { $pull: { "arrProducts": { "pkProductId": pkProductId } } }
    );

    // Push the new product into arrProducts
    wishlist.arrProducts.push({
      pkProductId: productObj.pkProductId,
        strProductName: productObj.strProductName,
        strDescription: productObj.strDescription,
        fkcategoryId: productObj.fkcategoryId,
        intPrice: productObj.intPrice,
        intStock: productObj.intStock,
        mainProductUrl: productObj.mainProductUrl,
        arrayOtherImages: productObj.arrayOtherImages,
        intQuantity: productObj.intQuantity





    });

    // Save the updated wishlist
    await wishlist.save();
}



        //update cart 
        await Cart.updateMany({ "arrProducts.pkProductId": pkProductId, "arrProducts.intQuantity": { $gt: stock } },
        { $set: { "arrProducts.$.intQuantity": stock } },)

      // Calculate total_cart_price for each document
const carts = await Cart.aggregate([
  {
    $match: { "arrProducts.pkProductId": pkProductId } // Filter to match documents containing the specified product
  },
  {
    $set: {
      total_cart_price: {
        $sum: {
          $map: {
            input: "$arrProducts",
            as: "product",
            in: { $multiply: ["$$product.intQuantity", "$$product.intPrice"] }
          }
        }
      }
    }
  }
])
console.log(carts)
// If no documents found, handle the scenario
if (carts.length === 0) {
  console.log("No documents found in Cart collection.");
  return   res.json({success:true,message:"Successfully edited product"})
}

// Update documents with the calculated total_cart_price and updated intStock
const updatePromises = carts.map(async cart => {
  const updatedProducts = cart.arrProducts.map(product => {
    if (product.pkProductId.equals(pkProductId)) {
      product.intStock = stock;
    }
    return product;
  });

  await Cart.updateOne(
    { _id: cart._id },
    {
      $set: {
        arrProducts: updatedProducts,
        total_cart_price: cart.total_cart_price
      }
    }
  );
});

// Execute all update operations
await Promise.all(updatePromises);




      




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
       let file=req.files[0]

       if(req.body.pkProductId){
         let pkProductId= new ObjectId(req.body.pkProductId);
         let dataToUpdate={}
    
     
      if(file.fieldname=='Main-Image'){
       
       dataToUpdate={
      
       mainProductUrl:file.filename
       }
 
     }
     
        if (file.fieldname=='Image-1') {
          dataToUpdate={
           
           "arrayOtherImages.0.imageUrl1":file.filename
          }
 
          } 
          if (file.fieldname=='Image-2') {
           dataToUpdate={
         
           "arrayOtherImages.1.imageUrl2": file.filename
           }
       }
        
        
   
       let dataToAdd={
        ...dataToUpdate,
       
         updatedDate:new Date()
       }
    
     
   
     let result = await Product.updateOne({pkProductId,strStatus: "Active"},{$set:dataToAdd})
   
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
 
   //block product
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
        
         let pkUserId=req.session.user.pkUserId
        
         let cartCount=  await getCartCount(pkUserId)
      
           let wishListCount=await getWishListCount(pkUserId)
        let productFind =await Product.find({pkProductId:pkProductId,strStatus:"Active"})
        let product=productFind.map((pro)=>{
           return{...pro._doc}
        })
        let categories=await Category.aggregate([{$match:{strStatus:"Active"}}])
          if(product.length){
            
          res.render("user/productSingle",{layout:"user_layout",user:true,product,imageUrl1:product[0].arrayOtherImages[0].imageUrl1,imageUrl2:product[0].arrayOtherImages[1].imageUrl2,pkUserId,cartCount,categories,wishListCount})
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
  const sortProducts=async(req,res)=>{
    let pkUserId=req.session.user.pkUserId
    try {
      
      let sort={createdDate:-1}
       let search={strStatus: 'Active'}
      if(req.query.lowToHigh){
        sort={
         
          intPrice:1
        }
      }
      if(req.query.highToLow){
        sort={
         
          intPrice:-1
        }
      }
      if(req.query.productName){
        let productName=req.query.productName
      search={
        $and: [
          { strProductName: { $regex:productName, $options: 'i' } }, 
          { ...search },
          {intStock:{$ne:0}}
      ] 
      }
  
      }
      if(req.query.pkCategoryId && req.query.productName && req.query.pkCategoryId!="All Categories"){
        let productName=req.query.productName
        let fkcategoryId=new ObjectId(req.query.pkCategoryId)
        search={
          $and: [
            { strProductName: { $regex:productName, $options: 'i' } }, 
            {fkcategoryId},
            { ...search },
            {intStock:{$ne:0}}
        ] 
        }
    

      }
      let findResult=await Product.find(search).sort(sort)
      let result=findResult.map((product)=>{
        return {
          ...product._doc
        }
      })
      let categories=await Category.aggregate([{$match:{strStatus:"Active"}}])
      let cartCount= await getCartCount(pkUserId)
        
      let wishListCount=await getWishListCount(pkUserId)
      res.render("user/filterProducts",{layout:"user_layout",user:true,result,categories,cartCount,wishListCount})
    } catch (error) {
      res.json({success:true,message:error.message})
    }
   }
const getProductImageEditPage=async(req,res)=>{
  try {
    if(req.query.pkProductId || req.query.imgName){
      let match={
        $match:{
          pkProductId:new ObjectId(req.query.pkProductId),
          strStatus:"Active"
        }
      }
      let project={
        $project:{
          pkProductId:1,
          mainProductUrl:1,
          arrayOtherImages:1
        }
      }
      let findProduct=await Product.aggregate([match,project])
      if(findProduct.length){
      let productImage
      if(req.query.imgName=='Main-Image'){
        productImage=findProduct[0].mainProductUrl
      }
      if(req.query.imgName=='Image-1'){
        productImage=findProduct[0].arrayOtherImages[0].imageUrl1
      }
      if(req.query.imgName=='Image-2'){
        productImage=findProduct[0].arrayOtherImages[1].imageUrl2
      }
      res.render("admin/editProductImage",{layout:"admin_layout",admin:true,productImage,pkProductId:req.query.pkProductId,imgName:req.query.imgName }) 
    }
      else{
        res.json({success:false,message:"Product not found"})
      }
    }else{
      res.json({success:false,message:"Product if not found"})
    }
   
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}


const applyProductOffer = async (req, res,next) => {
  try {
    const productId = req.body.productId;
    const offerId = req.body.offerId;

    // Assuming you have an Offer model with fields: discountPercentage
    const offer = await Offer.findOne({ _id: offerId });

    if (!offer) {
      return res.json({ success: false, message: 'Offer not found' });
    }

    const product = await Product.findOne({ _id: productId })
    // .populate('category')

    if (!product) {
      return res.json({ success: false, message: 'Product not found' });
    }

    // Get the category discount, if available
    const categoryDiscount = product.category && product.category.offer
      ? await Offer.findOne({ _id: product.category.offer })
      : 0;


    // Calculate real price and discounted price for the product
    const discountPercentage = offer.percentage;
    const originalPrice = parseFloat(product.intPrice);
    const discountedPrice = originalPrice - (originalPrice * discountPercentage) / 100;


    // Check if category offer is available and its discount is greater than product offer
    if (categoryDiscount && categoryDiscount.percentage > discountPercentage) {
    
      // You can handle this case as needed, e.g., not applying the product offer
      return res.json({ success: false, message: 'Category offer has greater discount' });
    }

    // Update product with offer details
    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          offer: offerId,
          offerPrice: discountedPrice,
         
        },
      }
    );

    const updatedProduct = await Product.findOne({ _id: productId }).populate('offer');
  
    res.json({ success: true, data: updatedProduct });
  } catch (error) {

   next(error)
  }
};











   module.exports={getProductList,
    sortProducts,
    getProductAdd,
    addProduct,editProduct,deleteProduct,
    blockProduct,
    getProductEdit,
    editProductImages,
    getSingleProductPage,
    getProductImageEditPage,
    applyProductOffer
  
  }

 