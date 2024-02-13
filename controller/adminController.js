const db=require("../config/connection")
const bcrypt=require("bcrypt")
const { ObjectId, ReturnDocument } = require('mongodb');
const {USER_COLLECTION,ADMIN_COLLECTION, CATEGORY_COLLECTION}=require("../config/collections")
//post login
const adminLogin=async(req,res)=>{
    
    try {
      let {email,password} =req.body
      
      let user= await db.get().collection("cln_admin").findOne({email})
      if(user){
        let result= await bcrypt.compare(password,user.password)
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
 
      res.render("admin/homePage",{layout:"admin_layout"})
  
  }
  
  
  //get user list
  const getUserList=async(req,res)=>{
  try {
    let count =await db.get().collection("cln_users").count()
    if(count>0){
      let result=await db.get().collection(USER_COLLECTION).find({strStatus:{$ne:"Deleted"}}).toArray()
      let users=await result.map((user,index)=>({...user,index:index+1}))
      res.render("admin/listUsers",{layout:"admin_layout",users,count})
    }
    else{
      res.render("admin/listUsers",{layout:"admin_layout",count})
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
      
      // const existingCategory= await db.get().collection(CATEGORY_COLLECTION).findOne({strCategoryName,$ne:{strStatus:"Deleted"}})
      if(existingCategory=false){
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
        res.render("admin/categoryPage",{layout:"admin_layout",count,categories})
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
        
          res.render("admin/categoryPage",{layout:"admin_layout",category})
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
    let count =await db.get().collection("cln_users").count()
    if(count>0){
      let result=await db.get().collection(USER_COLLECTION).find({strStatus:{$ne:"Deleted"}}).toArray()
      let users=await result.map((user,index)=>({...user,index:index+1}))
      res.render("admin/listUsers",{layout:"admin_layout",users,count})
    }
    else{
      res.render("admin/listUsers",{layout:"admin_layout",count})
    }
 
   
   
  } catch (error) {
    res.json({success:false,message: error.message})
  }
  
   
 }


  //logout 
const logout=(req,res)=>{
    req.session.destroy();
     res.redirect('/admin');
   }
   
  module.exports={adminLogin,getAdminHome,logout,deleteUser,getUserList,blockUser,addCategory,getCategoryPage,deleteCategory,blockCategory,getEditCategory,editCategory}