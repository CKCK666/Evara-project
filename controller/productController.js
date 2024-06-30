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
const {getCartCount,findTotalCartPrice}=require("../utils/cart")
const {getWishListCount}=require("../utils/wishlist")
const Wishlist = require("../models/wishListModel")

//product list page
const getProductList=async(req,res)=>{
    try {
     let count=await Product.countDocuments()
     const page = parseInt(req.query.page) || 1;
     const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const totalPages = Math.ceil((count ? count : 0) / limit);
     if(count>0){
       let result =await Product.find({strStatus:{$ne:"Deleted"}}).populate({
        path: 'offer',
        match: { status: true }
    }) .skip(skip)
    .limit(limit);

       let products= result.map((product,index)=>{
         const isoDate = product.createdDate;
         const date = new Date(isoDate);
         const formattedDate = date.toString().substring(0, 15)
         
         return {
           ...product._doc,
           index:skip + index + 1,
           createdDate: formattedDate,
           offerPercentage:product.offer?product.offer.percentage:"",
           offerName:product.offer?product.offer.name:""

          }
         
         })
         const today = new Date();
         today.setHours(0, 0, 0, 0);
         const availableOffers = await Offer.aggregate([{$match:{ status : true, expiryDate : { $gte : today }}}])
         
       
         res.render("admin/listProducts",{layout:"admin_layout",products,admin:true,availableOffers,currentPage: page, totalPages:totalPages})
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

      //  files.map((file)=>{
      //   if (file.fieldname === 'Main-Image') {
      //     mainProductUrl = file.filename;
      // } else if (file.fieldname === 'Image-1') {
      //     arrayOtherImages.push({ imageUrl1: file.filename });
      // } else if (file.fieldname === 'Image-2') {
      //     arrayOtherImages.push({ imageUrl2: file.filename });
      // }
      //  })
       files.map((file)=>{
       arrayOtherImages.push(file.filename)
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
      let categories = await Category.aggregate([
        {
          $match: {
            strStatus: { $ne: "Deleted" }
          }
        }
      ]);
      
       if(req.query.pkProductId){
        
         const pkProductId = new ObjectId(req.query.pkProductId);
        
         const productObj = await Product.find({
          pkProductId: pkProductId,
          strStatus: { $ne: "Deleted" }
      }).populate('fkcategoryId');
      let product=productObj.map((pro)=>{
       return{
       ... pro._doc
       }
      })
       
         if (product && product[0].arrayOtherImages && product[0].arrayOtherImages.length > 0) {
          let proImgArray=product[0].arrayOtherImages.map((pro,index)=>{
            return{
              pro,
              pkProductId
            }
          })
          let catToArray = categories.map(category => {
           
            if (category._id.toString()===product[0].fkcategoryId._id.toString()) {
              
              return {
                ...category,
                defaultSelect: true
                
              };
            } else {
              
              return {
                ...category,
              
              }
            }
          });
      
           res.render("admin/editProduct",{layout:"admin_layout",product,categories:catToArray,admin:true,proImgArray})
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
let productOffer= await Product.find({pkProductId,strStatus:"Active"}).populate("offer")
       let dataToAdd={
       
         strProductName:req.body.strProductName,
         strDescription:req.body.strDescription,
         fkcategoryId:new ObjectId(req.body.pkCategoryId),
         intPrice:parseFloat(req.body.intPrice),
         intStock:stock,
         updatedDate:new Date()
       }
       if(productOffer.length>0 && productOffer[0].offer){
         let discount=parseFloat(req.body.intPrice)*parseFloat(productOffer[0].offer.percentage)/100
         let offerPrice=parseFloat(req.body.intPrice)-discount
         dataToAdd={...dataToAdd,offerPrice:offerPrice}
       }
     let result = await Product.updateOne({pkProductId},{$set:dataToAdd})
      
      if(result.modifiedCount>0){
      
        let productObj=await Product.findOne({pkProductId}).populate({  path: 'offer',
        match: { status: true }})
      console.log(productObj)
        const wishlists = await Wishlist.find({ "arrProducts.pkProductId": pkProductId, "strStatus": "Active" });
        

        if(wishlists.length>0){
          for (const wishlist of wishlists) {
            // Find the product in the arrProducts array
            const productIndex = wishlist.arrProducts.findIndex(product =>product.pkProductId.toString()==pkProductId.toString() );
            
            if (productIndex !== -1) {
              // Update the product properties
              let updatedProduct = {
                pkProductId:productObj.pkProductId,
                strProductName: productObj.strProductName,
                strDescription: productObj.strDescription,
                fkcategoryId: productObj.fkcategoryId,
                intPrice: productObj.intPrice,
                intStock: productObj.intStock,
                intQuantity: productObj.intQuantity,
                arrayOtherImages:productObj.arrayOtherImages
              };
              
              // Check if there is an offer and add the offerPrice property
              if (productObj.offer) {
                console.log("product offer")
                let discount=parseFloat(req.body.intPrice)*parseFloat(productObj.offer.percentage)/100
                let offerPrice=parseFloat(req.body.intPrice)-discount
                console.log(offerPrice)
                updatedProduct={
                  ...updatedProduct,
                  offerPrice,
                  offer:new ObjectId(productObj.offer._id)
                }
              }
             
          
              // Update the product in the wishlist's arrProducts array
              wishlist.arrProducts[productIndex] = updatedProduct;
          
              // Update the wishlist in the database
              await Wishlist.updateOne(
                { _id: wishlist._id, "arrProducts.pkProductId": pkProductId,strStatus:"Active" },
                { $set: { "arrProducts.$": wishlist.arrProducts[productIndex] } }
              );
            }
            else{
              console.log("errrorrrrrr")
            }
          }



        }

       
        


        //update cart 
        await Cart.updateMany({ "arrProducts.pkProductId": pkProductId,strStatus:"Active", "arrProducts.intQuantity": { $gt: stock } },
        { $set: { "arrProducts.$.intQuantity": stock } },)

      // Calculate total_cart_price for each document
      const carts = await Cart.aggregate([
        {
          $match: { "arrProducts.pkProductId": pkProductId,strStatus:"Active" } // Filter to match documents containing the specified product
        },
      
      ]);
     

if (carts.length === 0) {
  console.log("No documents found in Cart collection.");
  return   res.json({success:true,message:"Successfully edited product"})
}

// Update documents with the calculated total_cart_price and updated intStock
const updatePromises = carts.map(async cart => {
  const updatedProducts = cart.arrProducts.map(product => {
    if (product.pkProductId.equals(pkProductId)) {
      product.intStock = stock,
      product.strProductName= productObj.strProductName,
      product.strDescription= productObj.strDescription,
      product.fkcategoryId =productObj.fkcategoryId,
      product.intPrice=productObj.intPrice
      if(product.offer){
        let discount=parseFloat(req.body.intPrice)*parseFloat(productOffer[0].offer.percentage)/100
        let offerPrice=parseFloat(req.body.intPrice)-discount
        product.offerPrice=offerPrice
      }
    
     
     }
    return product;
  });

  await Cart.updateOne(
    { _id: cart._id },
    {
      $set: {
        arrProducts: updatedProducts,
       
      }
    }
  );
  let totalPriceResult = await findTotalCartPrice(cart._id)


  await Cart.updateOne(
    { _id: cart._id },
    {
      $set: {
        
        total_cart_price:  totalPriceResult[0].total_cart_price
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
      if(!req.files.length){
        return  res.json({success:false,message:"Please select a new image"})
      }
       let file=req.files[0]
        

       if(req.body.pkProductId){
         let pkProductId= new ObjectId(req.body.pkProductId);
         const product = await Product.findOne({ pkProductId,strStatus:"Active" });
         const index = product.arrayOtherImages.indexOf(file.fieldname);
        
         if (index !== -1) {
       
          await Product.findOneAndUpdate(
            { pkProductId,strStatus:"Active"},
            { $pull: { arrayOtherImages: file.fieldname } }
          );
      
        
          await Product.findOneAndUpdate(
            { pkProductId,strStatus:"Active"},
            { $push: { arrayOtherImages: { $each: [file.filename], $position: index } } },
            { new: true }
          );
      
          res.json({success:true,message:"successfully edited product"})
          
        } else {
          res.json({success:false,message:"fail to  edit product"})
        }

     }
     else{
       res.json({success:false,message:"Product id not found"})
     }
     } catch (error) {
      console.log(error.message);
       res.json({success:false,message:"Server Error!!!"})
     }
     
      
    }
 
       //add more product
   const addMoreProductImages = async (req, res) => {
     try {
       if (!req.files.length) {
         return res.json({ success: false, message: 'Please select images' });
       }
       let file = req.files;
       let productImg = file.map((pro) => pro.filename);
       console.log(productImg);

       if (req.body.pkProductId) {
         let pkProductId = new ObjectId(req.body.pkProductId);
         const product = await Product.findOne({
           pkProductId,
           strStatus: 'Active',
         });

      let result=   await Product.updateOne(
           { pkProductId, strStatus: 'Active' },
           { $push: { arrayOtherImages: { $each: productImg } } }
         );
         if (result.modifiedCount>0) {
          res.json({ success: true, message: 'successfully edited product' });
         } else {
          res.json({ success: false, message: 'fail to  edit product' });
         }
      
       } else {
         res.json({ success: false, message: 'Product id not found' });
       }
     } catch (error) {
       console.log(error.message);
       res.json({ success: false, message: 'Server Error!!!' });
     }
   };
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
        let productFind =await Product.find({pkProductId:pkProductId,strStatus:"Active"}).populate({
          path:"offer",match:{status:true }   })
        let product=productFind.map((pro)=>{
           return{...pro._doc}
        })
        let categories=await Category.aggregate([{$match:{strStatus:"Active"}}])
          if(product.length){
          
          res.render("user/productSingle",{layout:"user_layout",user:true,product,pkUserId,cartCount,categories,wishListCount})
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
     
      const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 6;
      const skip = (page - 1) * limit;
      let sort
      let sortDisplay
      const queryCheck = req.query.sort && (req.query.sort === 'asc' || req.query.sort === 'desc') ? req.query.sort : null;
      const minPrice = parseFloat(req.query.minPrice) || 0;
       const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE;
     let search={strStatus: 'Active',intStock:{$ne:0}}
      
if (req.query.sort === 'desc') {
  sort = -1;
  sortDisplay = "Price: High to Low";
} else if (req.query.sort === 'asc') {
  sort = 1;
  sortDisplay = "Price: Low to High";
} else {
  sort = { createdDate: -1 }; 
  sortDisplay = "Newest:Arrivals";
}
 
    if(req.query.productName){
      
        let productName=req.query.productName
        search={
          ...search,
          strProductName: { $regex:productName, $options: 'i' },
        
        }
       }
    if(req.query.categoryIds && req.query.categoryIds.length){
      const categoryIdsArray = req.query.categoryIds.split(',').map(id=>new ObjectId(id))
      search={
        ...search,
        fkcategoryId: { $in: categoryIdsArray }
      }

    }

    




      const result = await Product.aggregate([
        // Match the products based on the search criteria
        { $match: search },
        // Lookup the offer collection
        {
          $lookup: {
            from: "offers",
            localField: "offer",
            foreignField: "_id",
            as: "offer",
          }
        },
        // Filter offers based on status
        {
          $unwind: {
            path: "$offer",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            $or: [
              { "offer.status": true },
              { "offer": { $exists: false } }
            ]
          }
        },
        // Add a field for sorting
        {
          $addFields: {
            effectivePrice: {
              $ifNull: ["$offerPrice", "$intPrice"]
            }
          }
        },
        // Sort based on the effective price or createdDate
        ...(queryCheck ? [{
          $sort: {
            effectivePrice: sort
          }
        }] : [{
          $sort: sort
        }]),
        {
          $match: {
            effectivePrice: {
              $gte: minPrice,
              $lte: maxPrice
            }
          }
        },
        { $skip: skip },
        { $limit: limit }
      ]);
      // Get total count for pagination
const totalCount = await Product.aggregate([
  { $match: search },
  {
      $lookup: {
          from: "offers",
          localField: "offer",
          foreignField: "_id",
          as: "offer",
      }
  },
  {
      $unwind: {
          path: "$offer",
          preserveNullAndEmptyArrays: true
      }
  },
  {
      $match: {
          $or: [
              { "offer.status": true },
              { "offer": { $exists: false } }
          ]
      }
  },
  {
      $addFields: {
          effectivePrice: {
              $ifNull: ["$offerPrice", "$intPrice"]
          }
      }
  },
  {
      $match: {
          effectivePrice: {
              $gte: minPrice,
              $lte: maxPrice
          }
      }
  },
  { $count: "totalCount" }
]);

const totalPages = Math.ceil((totalCount[0] ? totalCount[0].totalCount : 0) / limit);
 
      
      let categories=await Category.aggregate([{$match:{strStatus:"Active"}}])
      let cartCount= await getCartCount(pkUserId)
        
      let wishListCount=await getWishListCount(pkUserId)
      res.render("user/filterProducts",{layout:"user_layout",user:true,result,categories,cartCount,wishListCount,sortDisplay, currentPage: page,pkUserId,
        totalPages: totalPages,queries:req.query})
    } catch (error) {
      console.log(error)
      res.json({success:true,message:error.message})
    }
   }
const getProductImageEditPage=async(req,res)=>{
  try {
    if(req.query.pkProductId || req.query.imgName){
      let match={
        $match:{
          pkProductId:new ObjectId(req.query.pkProductId),
          strStatus:"Active",
          arrayOtherImages: { $in: [req.query.imgName] }
        }
      }
      let project={
        $project:{
          pkProductId:1,

         
        }
      }
      let findProduct=await Product.aggregate([match,project])
      if(findProduct.length>0){
     
      
      res.render("admin/editProductImage",{layout:"admin_layout",admin:true,pkProductId:req.query.pkProductId,imgName:req.query.imgName }) 
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

    const carts = await Cart.aggregate([
      {
        $match: { "arrProducts.pkProductId": product.pkProductId,strStatus:"Active" } // Filter to match documents containing the specified product
      },
    
    ]);
  
    const updatePromises = carts.map(async cart => {
      const updatedProducts = cart.arrProducts.map(pro => {
        if (pro.pkProductId.equals(product.pkProductId)) {
          pro.offer= offerId,
          pro.offerPrice= discountedPrice
         }
        return pro;
      });
    
      await Cart.updateOne(
        { _id: cart._id },
        {
          $set: {
            arrProducts: updatedProducts,
           
          }
        }
      );
      let totalPriceResult = await findTotalCartPrice(cart._id)
    
    
      await Cart.updateOne(
        { _id: cart._id },
        {
          $set: {
            
            total_cart_price:  totalPriceResult[0].total_cart_price
          }
        }
      );
    
    
    
    });
    
    // Execute all update operations
    await Promise.all(updatePromises);

    const wishlists = await Wishlist.aggregate([
      {
        $match: { "arrProducts.pkProductId": product.pkProductId,strStatus:"Active" } // Filter to match documents containing the specified product
      },
    
    ]);
    const updateWishlist = wishlists.map(async wishlist => {
      const updatedProducts = wishlist.arrProducts.map(pro => {
        if (pro.pkProductId.equals(product.pkProductId)) {
          pro.offer= offerId,
          pro.offerPrice= discountedPrice
         }
        return pro;
      });
    
      await Wishlist.updateOne(
        { _id: wishlist._id },
        {
          $set: {
            arrProducts: updatedProducts,
           
          }
        }
      );
    
    });

  // Execute all update operations
  await Promise.all(updateWishlist);

  
    res.json({ success: true, data: updatedProduct });
  } catch (error) {

   next(error)
  }
};


     //edit product
     const deleteProductImages=async(req,res)=>{
   
      try {
       
 
        if(req.body.pkProductId && req.body.productName){
          let pkProductId= new ObjectId(req.body.pkProductId);
          const product = await Product.findOne({ pkProductId,strStatus:"Active" });
          console.log(product)
          if(product.arrayOtherImages.length<=1){
          return   res.json({ success: false, message: "Product must have at least one image." });
          }
         
         
        
          let result = await Product.updateOne(
            { pkProductId, strStatus: "Active" },
            { $pull: { arrayOtherImages:  req.body.productName } }
        );
        
      
        
        if (result.modifiedCount > 0) {
          return     res.json({ success: true, message: "Successfully edited product" });
        } else {
          return   res.json({ success: false, message: "Failed to edit product" });
        }
        
 
      }
      else{
        return  res.json({success:false,message:"Product id not found"})
      }
      } catch (error) {
       console.log(error.message);
       return   res.json({success:false,message:"Server Error!!!"})
      }
      
       
     }

     const removeProductOffer = async (req, res,next) => {
      try {
        const { productId } = req.body;
    
        const remove = await Product.updateOne(
          { pkProductId: productId },
          {
            $unset: {
              offer: '',
              offerPrice: '',
            },
          }
        );
        const product = await Product.findOne({ pkProductId: new ObjectId(productId) }).populate('offer');

        const carts = await Cart.aggregate([
          {
            $match: { "arrProducts.pkProductId": product.pkProductId,strStatus:"Active" } // Filter to match documents containing the specified product
          },
        
        ]);
      
        const updatePromises = carts.map(async cart => {
          const updatedProducts = cart.arrProducts.map(pro => {
            if (pro.pkProductId.equals(product.pkProductId)) {
              delete pro.offer;
              delete pro.offerPrice;
             }
            return pro;
          });
        
          await Cart.updateOne(
            { _id: cart._id },
            {
              $set: {
                arrProducts: updatedProducts,
               
              }
            }
          );
          let totalPriceResult = await findTotalCartPrice(cart._id)
        
        
          await Cart.updateOne(
            { _id: cart._id },
            {
              $set: {
                
                total_cart_price:  totalPriceResult[0].total_cart_price
              }
            }
          );
        
        
        
        });
        
        // Execute all update operations
        await Promise.all(updatePromises);
    
        const wishlists = await Wishlist.aggregate([
          {
            $match: { "arrProducts.pkProductId": product.pkProductId,strStatus:"Active" } // Filter to match documents containing the specified product
          },
        
        ]);
        const updateWishlist = wishlists.map(async wishlist => {
          const updatedProducts = wishlist.arrProducts.map(pro => {
            if (pro.pkProductId.equals(product.pkProductId)) {
              delete pro.offer;
              delete pro.offerPrice;
             }
            return pro;
          });
        
          await Wishlist.updateOne(
            { _id: wishlist._id },
            {
              $set: {
                arrProducts: updatedProducts,
               
              }
            }
          );
        
        });
    
      // Execute all update operations
      await Promise.all(updateWishlist);
    
        res.json({ success: true ,data:remove });
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
    applyProductOffer,
    deleteProductImages,
    addMoreProductImages,
    removeProductOffer
  
  }

 