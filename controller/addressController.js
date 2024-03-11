const db = require('../config/connection');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose')
const User =require("../models/userModel")
const {USER_COLLECTION, PRODUCTS_COLLECTION, CATEGORY_COLLECTION, CART_COLLECTION, ORDER_COLLECTION} =require("../config/collections")
const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const Address=require("../models/addressModel");
const { log } = require('handlebars/runtime');
//get add address page
const getAddressPage=async(req,res)=>{
    try {
     let pkUserId=req.query.pkUserId
      let addressCount=await Address.countDocuments({pkUserId:new ObjectId(pkUserId),strStatus:"Active"})
    
       
  
      res.render("user/addAddress",{layout:"user_layout",pkUserId,addressCount,user:true})
    } catch (error) {
      res.json({success:false,message:"fail to render add  address page"})
    }
  }
  
  //add address
  const addNewAddress=async(req,res)=>{
    
    try {
       if(req.body.pkUserId){
         let matchQuery={
         
            pkUserId:new ObjectId(req.body.pkUserId),
            strStatus:"Active",
          
          
         } 
         let isDefaultAddress

         let addressCount=await Address.countDocuments(matchQuery)
         if(!addressCount){
          console.log("not address");
          isDefaultAddress=true
         }
      
          if(req.body.addressCheckBox==="true" || req.body.addressCheckBox===true){
           
            isDefaultAddress=true
            let arrAddressExist=await Address.find(matchQuery)
            
             if(arrAddressExist.length>0){
              let matchQuery2={
                pkUserId:new ObjectId(req.body.pkUserId),
                strStatus:"Active",
                isDefaultAddress:true
              }
              await Address.updateOne(matchQuery2,{ $set: {isDefaultAddress: false }})
             }
           
          }
         let dataToAdd=new Address({
              pkUserId:new ObjectId(req.body.pkUserId),
              pkAddressId:new ObjectId(),
             strFullName:req.body.fname,
             strPhoneNo:req.body.phno,
             strArea:req.body.area || null,
             intPinCode:req.body.pinCode,
             strCity:req.body.city,
             strState:req.body.state,
             isDefaultAddress
            })

          let result=await dataToAdd.save()
          if(result._id){
       
            res.json({success:true,message:"successfully add address",pkUserId:req.body.pkUserId})
           }
           else{
            res.json({success:false,message:"fail to  add address"})
           }
          
         
       }else{
        res.json({success:false,message:"User id not found"})
       }
    } catch (error) {
      res.json({success:false,message:error.message})
    }
  
  }
  //edit address
  const editAddress=async(req,res)=>{
    console.log(req.body);
    try {
      if(req.body.pkUserId){
        if(req.body.pkAddressId){
          let pkUserId=new ObjectId(req.body.pkUserId)
          let pkAddressId=new ObjectId(req.body.pkAddressId)
          const match = {
            pkAddressId,
            strStatus:"Active"
          };
          let isDefaultAddress={}
          if(req.body.addressCheckBox==="true" || req.body.addressCheckBox===true){
            let matchQuery={
              pkUserId:new ObjectId(req.body.pkUserId),
              strStatus:"Active",
              isDefaultAddress:true
            }
           
            
            let arrAddressExist=await Address.find(matchQuery)
            
             if(arrAddressExist.length>0){
            
              await Address.updateMany(matchQuery,{ $set: {isDefaultAddress: false }})
              isDefaultAddress={
                ...isDefaultAddress,
                isDefaultAddress:true
              }
             }
           
          }
          
          // Construct the update operation
          const update = {
            $set: {
              strFullName: req.body.fname,
              strPhoneNo: req.body.phno,
              strArea: req.body.area || "",
              intPinCode:req.body.pinCode,
              strCity: req.body.city,
              strState: req.body.state,
              updatedDate: new Date(),
              ...isDefaultAddress
            }
          };
          
      
          // Perform the update operation
          const result = await Address.updateOne(match, update);
          
          console.log(`${result.modifiedCount} document was modified.`);
  
        if (result.modifiedCount>0) {
         
          res.json({success:true,message: 'successfully updated!',pkUserId:req.body.pkUserId,result})
        }
        else{
          console.log("fail to update address");
          res.json({success:false,message: 'Fail to update address!'})
        }
        
  
        }else{
          res.json({success:false,message:"Address id not found"})
        }
      }else{
        res.json({success:false,message:"User id id not found"})
      }
      
     
   
     } catch (error) {
      console.log(error.message);
        res.json({success:false,message: error.message})
     }
  }
  
  //get edit address page
  const getEditAddressPage=async(req,res)=>{
    try {
     let pkAddressId=req.query.pkAddressId
     let pkUserId=req.query.pkUserId
     if (pkAddressId) {
      
      let matchQuery1={
        $match:{
          pkAddressId:new ObjectId(pkAddressId),
          strStatus:"Active"
        }
      }
    let userAddress=await Address.aggregate([matchQuery1])
    if(userAddress.length){
      let addressCount=false
      if(userAddress[0].length>0){
        addressCount=true
      }
    
     res.render("user/editAddress",{layout:"user_layout",arrAddress:userAddress, addressCount})
    }else{
      res.json({success:false,message:"Failed to fetch address"})
    }
   
    
      
     } else {
      res.json({success:false,message:"address id not found"})
     }
  
    } catch (error) {
      res.json({success:false,message:error.message})
    }
  }
  
  //set as default address
  const setAsDefaultAddress=async(req,res)=>{
     console.log(req.body);
    try {
      if(req.body.pkUserId){
        if(req.body.pkAddressId){
         
         
          const pkUserId = new ObjectId(req.body.pkUserId);
          const pkAddressId = new ObjectId(req.body.pkAddressId);
          
         
          const match1 = {
         
            pkUserId,
            strStatus:"Active",
            isDefaultAddress: true
        
          };
          
          const update1 = {
            $set: {
              isDefaultAddress: false
            }
          };

          const match2 = {
            pkAddressId,
            strStatus:"Active",
           
          
          };
          
          const update2 = {
            $set: {
              isDefaultAddress: true
            }
          };
          
          const result = await Address.updateMany(match1,update1);
           console.log(result);
           if(!result.modifiedCount){return res.json({success:false,message:"Failed change to false"})}
         
          const setToDefault=await Address.updateOne(match2,update2)
          
          if(setToDefault.modifiedCount>0){
            console.log(`${result.modifiedCount} document updated to set isDefaultAddress to true for pkAddressId: ${pkAddressId}.`);
            res.json({success:true,message:"Address set as default address"})
          
          }else{
            res.json({success:false,message:"Failed set as default address"})
          }
          
          
  
        }else{
          res.json({success:false,message:"Address id not found"})
        }
      }else{
        res.json({success:false,message:"User id id not found"})
      }
      
     
   
     } catch (error) {
      console.log(error.message);
        res.json({success:false,message: error})
     }
  }
  
  
  
  //delete address
  const deleteAddress=async(req,res)=>{
   
    try {
      if(req.body.pkUserId){
        if(req.body.pkAddressId){
          let pkUserId=new ObjectId(req.body.pkUserId)
          let pkAddressId=new ObjectId(req.body.pkAddressId)
          const result = await Address.updateOne(
            { pkAddressId,strStatus:"Active"},
            { $set: { strStatus: "Deleted" } }
          );
         
        if (result.modifiedCount===1) {
         
          res.json({success:true,message: 'successfully  deleted!',pkUserId:req.body.pkUserId})
        }
        else{
          console.log("not user deleted");
          res.json({success:false,message: 'User not deleted!'})
        }
        
  
        }else{
          res.json({success:false,message:"Address id not found"})
        }
      }else{
        res.json({success:false,message:"User id id not found"})
      }
      
     
   
     } catch (error) {
      console.log(error.message);
        res.json({success:false,message: error.message})
     }
  }
  
  module.exports = {
    setAsDefaultAddress,
     getEditAddressPage,editAddress,
    addNewAddress,
    deleteAddress,getAddressPage,
   
  };