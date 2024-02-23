const db=require("../config/connection")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const { ObjectId} = require('mongodb');
const {USER_COLLECTION,ADMIN_COLLECTION, CATEGORY_COLLECTION, PRODUCTS_COLLECTION}=require("../config/collections");
const { log, logger } = require("handlebars");
//post login
const adminLogin=async(req,res)=>{
   
  try {
    let {email,password} =req.body
    
    
    let user= await db.get().collection(ADMIN_COLLECTION).findOne({strEmail:email})
   
    if(user){
     
      let result= await bcrypt.compare(password,user.strPassword)
      
      if(result){
        req.session.loggedIn = true;
        req.session.user = user;
      
        res.json({success:true,message: 'Form submitted successfully!'})
       
      }
      else{
        res.json({success:false,message: 'Invaild email or password!'})
      }
    }
    else{
      res.json({success:false,message: 'Invaild email or password!'})
    }
  } catch (error) {
    console.log(error.message);
    res.json({success:false,message: error.message})
  }

  
}

//get admin home page
const getAdminHome=async(req,res)=>{
res.render("admin/homePage",{layout:"admin_layout",admin:true})
}
  
  //get user list
  const getUserList=async(req,res)=>{
  try {
    let count =await db.get().collection("cln_users").count()
    if(count>0){
      let result=await db.get().collection(USER_COLLECTION).find({strStatus:{$nin:["Deleted","Pending"]}}).toArray()
      // let users=await result.map((user,index)=>({...user,index:index+1}))
      let users=await result.map((user,index)=>{
        const isoDate = user.createdDate;
        const date = new Date(isoDate);
        const formattedDate = date.toString().substring(0, 15) + date.getFullYear()
        return {
          ...user,
          index:index+1,
          createdDate: formattedDate
         }
        
        })
      
      res.render("admin/listUsers",{layout:"admin_layout",users,count,admin:true})
    }
    else{
      res.render("admin/listUsers",{layout:"admin_layout",count,admin:true})
    }
 
   
   
  } catch (error) {
    res.json({success:false,message: error.message})
  }
  
   
 }

  //delete
  const deleteUser=async(req,res)=>{
    try {
      let {id}=req.body
      
      const objectIdToUpdate = new ObjectId(id);
  
      console.log();
      let result=await db.get().collection(USER_COLLECTION).updateOne({pkUserId:objectIdToUpdate},{$set:{strStatus:"Deleted",updatedDate:new Date()}})
        console.log(result);
      if (result.modifiedCount>0) {
       
        res.json({success:true,message: 'successfully  deleted!',userDeleted:true})
      }
      else{
        console.log("not user deleted");
        res.json({success:false,message: 'User not deleted!'})
      }
      
     } catch (error) {
      console.log(error.message);
        res.json({success:false,message: error.message})
     }
  }

  //block/unblock
  const blockUser=async(req,res)=>{
    let {id,strStatus}=req.body
     let status=strStatus=="Active"?"Blocked":"Active"
   try {
    const objectIdToUpdate = new ObjectId(id);
    let result=await db.get().collection(USER_COLLECTION).updateOne({pkUserId:objectIdToUpdate,strStatus},{$set:{strStatus:status,updatedDate:new Date()}})
      console.log(result);
    if (result.modifiedCount>0) {
      console.log("blocked/unblock");
      res.json({success:true,message: 'successfully  updated!',userBlocked:true})
    }
    else{
      console.log("not deleted");
      res.json({success:false,message: 'fail to update!'})
    }
    
   } catch (error) {
    console.log(error.message);
      res.json({success:false,message: error.message})
   }
  }


 //add categories page
  const addCategory=async(req,res)=>{
    
    try {
      let dataToAdd={
        pkCategoryId:new ObjectId(),
        strCategoryName:req.body.category,
        strDescription:req.body.description,
        strStatus:"Active",
        createdDate:new Date(),
        updatedDate:null
      }
      
       const existingCategory= await db.get().collection(CATEGORY_COLLECTION).findOne({strCategoryName:req.body.category,strStatus:{$ne:"Deleted"}})
      if(existingCategory){
        return res.json({success:false,message:"category already exist"})
      }
    let result = await db.get().collection(CATEGORY_COLLECTION).insertOne(dataToAdd)
    console.log(result);
     if(result.insertedId){
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
      let count=await db.get().collection(CATEGORY_COLLECTION).countDocuments()
      if(count>0){
        let result=await db.get().collection(CATEGORY_COLLECTION).find({strStatus:{$ne:"Deleted"}}).toArray()
        let categories=await result.map((category,index)=>({...category,index:index+1}))
        res.render("admin/categoryPage",{layout:"admin_layout",count,categories,admin:true})
      }
      else{

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
      let result=await db.get().collection(CATEGORY_COLLECTION).updateOne({pkCategoryId:objectIdToUpdate},{$set:{strStatus:"Deleted",updatedDate:new Date()}})
        console.log(result);
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
    let result=await db.get().collection(CATEGORY_COLLECTION).updateOne({pkCategoryId:objectIdToUpdate,strStatus},{$set:{strStatus:status,updatedDate:new Date()}})
      console.log(result);
    if (result.modifiedCount>0) {
      console.log("blocked/unblock");
      res.json({success:true,message: 'successfully  updated!',categoryBlocked:true})
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

  //edit category page
  const getEditCategory=async(req,res)=>{
    try {
      let pkCategoryId=req.query.pkCategoryId
      const objectIdToUpdate = new ObjectId(pkCategoryId);
        let category=await db.get().collection(CATEGORY_COLLECTION).find({pkCategoryId:objectIdToUpdate,strStatus:{$ne:"Deleted"}}).toArray()
         if(category.length>0){
        
          res.render("admin/categoryPage",{layout:"admin_layout",category,admin:true})
         }
        else{
          res.status(200).json({success:false,message: error.message})
        }
    
    } catch (error) {
      res.status(500).json({success:false,message: error.message})
    }
   
     
   }

   //edit category
  const editCategory=async(req,res)=>{
  
   try {
    console.log(req.body);
    const objectIdToUpdate = new ObjectId(req.body.category_id);
  
    let dateToUpdate={
      updatedDate:new Date()
    }
    if (req.body.category){
      const strCategoryName=req.body.category
     
     let findCate=await db.get().collection(CATEGORY_COLLECTION).find({strCategoryName,pkCategoryId:{$ne:objectIdToUpdate}}).toArray()
     console.log(findCate);
      if(findCate.length==0){
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
    
   
    
    let result=await db.get().collection(CATEGORY_COLLECTION).updateOne({pkCategoryId:objectIdToUpdate},{$set:dateToUpdate})
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

//product list page
const getProductList=async(req,res)=>{
   try {
    let count=await db.get().collection(PRODUCTS_COLLECTION).countDocuments()
    if(count>0){
      let result =await db.get().collection(PRODUCTS_COLLECTION).find({strStatus:{$ne:"Deleted"}}).toArray()
      let products=await result.map((product,index)=>{
        const isoDate = product.createdDate;
        const date = new Date(isoDate);
        const formattedDate = date.toString().substring(0, 15) + date.getFullYear()
        return {
          ...product,
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
    let categories=await db.get().collection(CATEGORY_COLLECTION).find({strStatus:{$ne:"Deleted"}}).toArray()
    if(req.query.pkProductId){
     
      const pkProductId = new ObjectId(req.query.pkProductId);
     
      let product=await db.get().collection(PRODUCTS_COLLECTION).find({pkProductId:pkProductId,strStatus:{$ne:"Deleted"}}).toArray()
    
      if (product.length) {
        
        res.render("admin/addProduct",{layout:"admin_layout",product,categories,admin:true})
      } else {
        res.render("admin/addProduct",{layout:"admin_layout",admin:true})
      }
     }
    else{
       res.render("admin/addProduct",{layout:"admin_layout",categories,admin:true})
    }
   
  } catch (error) {
    console.log(error);
    res.status(200).json({success:false,message: error.message})
  }
  
  
  
  }

  //create product
  const addProduct=async(req,res)=>{
  console.log(req.body);
    try {
      let files=req.files
       console.log(req.files);
     
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
     arrayOtherImages= otherProductImgs.map((item)=>{
        return {
         imageUrl:item.path

        }
      })
      
     }
  
    
               
  
      let dataToAdd={
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
      }
      
       const existingProduct= await db.get().collection(PRODUCTS_COLLECTION).find({strProductName:req.body.strProductName,strStatus:{$ne:"Deleted"}}).toArray()
      if(existingProduct.length){
        return res.json({success:false,message:"Product name already exist"})
      }
    let result = await db.get().collection(PRODUCTS_COLLECTION).insertOne(dataToAdd)
   
     if(result.insertedId){
      
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
      let categories=await db.get().collection(CATEGORY_COLLECTION).find({strStatus:{$ne:"Deleted"}}).toArray()
      if(req.query.pkProductId){
       
        const pkProductId = new ObjectId(req.query.pkProductId);
       
        let product=await db.get().collection(PRODUCTS_COLLECTION).find({pkProductId:pkProductId,strStatus:{$ne:"Deleted"}}).toArray()
      
        if (product.length) {
          
          res.render("admin/editProduct",{layout:"admin_layout",product,categories,admin:true})
        } else {
          res.redirect("/admin/listProduct",{layout:"admin_layout",admin:true})
        }
       }
      else{
         res.red("/admin/listProduct",{layout:"admin_layout",admin:true})
      }
     
    } catch (error) {
      console.log(error);
      res.status(200).json({success:false,message: error.message})
    }
    
    
    
    }
  



    //edit product
  const editProduct=async(req,res)=>{
    console.log("edit product router");
    try {
      console.log(req.body.pkProductId);
      if(req.body.pkProductId){
        let pkProductId= new ObjectId(req.body.pkProductId);
      let dataToUpdate={}
      if(req.files){
      
      
       let  mainProductImg=files.filter(item=>
          item.fieldname==='mainProductImg'
     )
    
    
     if(mainProductImg.length){
      dataToUpdate={
      ...dataToUpdate,
      mainProductUrl:mainProductImg[0].path
      }

    }
     
     let otherProductImgs=files.filter((item)=>{
       if (item.fieldname==='otherProductImg1' || item.fieldname=== 'otherProductImg2') {
         return item.path
       }
       
      } )
 
      if(otherProductImgs.length){
      arrayOtherImages= otherProductImgs.map((item)=>{
         return {
          imageUrl:item.path
 
         }
       })
       
       dataToUpdate={
        ...dataToUpdate,
        arrayOtherImages
       }
      
      }
          
     
    }


  
      let dataToAdd={
        ...dataToUpdate,
        pkProductId:new ObjectId(), 
        strProductName:req.body.strProductName,
        strDescription:req.body.strDescription,
        fkcategoryId:req.body.pkCategoryId,
        intPrice:parseFloat(req.body.intPrice),
        intStock:parseInt(req.body.intStock),
        updatedDate:new Date()
      }
   
       const existingProduct= await db.get().collection(PRODUCTS_COLLECTION).find({strProductName:req.body.strProductName,strStatus:{$ne:"Deleted"},pkProductId:{$ne:pkProductId}}).toArray()
      if(existingProduct.length){
        return res.json({success:false,message:"Product name already exist"})
      }
      console.log("hereeeeeeeeeeeeeeeeeee");
    let result = await db.get().collection(PRODUCTS_COLLECTION).updateOne({pkProductId},{$set:dataToAdd})
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
      let result=await db.get().collection(PRODUCTS_COLLECTION).updateOne({pkProductId:objectIdToUpdate},{$set:{strStatus:"Deleted",updatedDate:new Date()}})
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
    let result=await db.get().collection(PRODUCTS_COLLECTION).updateOne({pkProductId:objectIdToUpdate,strStatus},{$set:{strStatus:status,updatedDate:new Date()}})
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

  //logout 
const logout=(req,res)=>{
    req.session.destroy();
     res.redirect('/admin');
   }
   
  module.exports={adminLogin,
    getAdminHome,logout,
    deleteUser,getUserList,
    blockUser,addCategory,
    getCategoryPage,deleteCategory,
    blockCategory,getEditCategory,
    editCategory,getProductList,
    getProductAdd,
    addProduct,editProduct,deleteProduct,
    blockProduct,
    getProductEdit
  
  }