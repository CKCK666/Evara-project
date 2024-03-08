const db = require('../config/connection');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose')
const User =require("../models/userModel")
const {USER_COLLECTION, PRODUCTS_COLLECTION, CATEGORY_COLLECTION, CART_COLLECTION, ORDER_COLLECTION} =require("../config/collections")
const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');

//get add address page
const getAddressPage=async(req,res)=>{
    try {
     let pkUserId=req.query.pkUserId
      let user=await db.get().collection(USER_COLLECTION).find({pkUserId:new ObjectId(pkUserId)}).toArray()
      let addressCount=false
       if(user[0].arrAddress.length>0){
         addressCount=true
       }
  
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
          let isDefaultAddress=false
          if(req.body.addressCheckBox){
            isDefaultAddress=true
            let arrAddressExist=await db.get().collection(USER_COLLECTION).find(matchQuery,{arrAddress:1}).toArray()
            console.log(arrAddressExist);
             if(arrAddressExist.length>0){
              let matchQuery2={
                pkUserId:new ObjectId(req.body.pkUserId),
                strStatus:"Active",
                "arrAddress.isDefaultAddress":true
              }
              await db.get().collection(USER_COLLECTION).updateOne(matchQuery2,{ $set: { "arrAddress.$.isDefaultAddress": false }})
             }
           
          }
         let dataToAdd={
          $addToSet:{
            arrAddress:{
              pkUserId:new ObjectId(req.body.pkUserId),
              pkAddressId:new ObjectId(),
             strFullName:req.body.fname,
             strPhoneNo:req.body.phno,
             strArea:req.body.area || null,
             intPinCode:req.body.pinCode,
             strCity:req.body.city,
             strState:req.body.state,
             isDefaultAddress
            }
           }
      }
          let result=await db.get().collection(USER_COLLECTION).updateOne(matchQuery,dataToAdd)
          
          res.json({success:true,message:"successfully add address",pkUserId:req.body.pkUserId})
       }else{
        res.json({success:false,message:"User id not found"})
       }
    } catch (error) {
      res.json({success:false,message:error.message})
    }
  
  }
  //edit address
  const editAddress=async(req,res)=>{
  
    try {
      if(req.body.pkUserId){
        if(req.body.pkAddressId){
          let pkUserId=new ObjectId(req.body.pkUserId)
          let pkAddressId=new ObjectId(req.body.pkAddressId)
          const filter = {
            pkUserId,
            "arrAddress.pkAddressId": pkAddressId
          };
          
          // Construct the update operation
          const update = {
            $set: {
              "arrAddress.$[address].strFullName": req.body.fname,
              "arrAddress.$[address].strPhoneNo": req.body.phno,
              "arrAddress.$[address].strArea": req.body.area || "",
              "arrAddress.$[address].strCity": req.body.city,
              "arrAddress.$[address].strState": req.body.state,
              "arrAddress.$[address].updatedDate": new Date()
            }
          };
          
          // Options for array filters
          const options = {
            arrayFilters: [{ "address.pkAddressId": pkAddressId }]
          };
          
          // Perform the update operation
          const result = await db.get().collection(USER_COLLECTION).updateOne(filter, update, options);
          
          console.log(`${result.modifiedCount} document was modified.`);
  
        if (result.modifiedCount) {
         
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
          pkUserId:new ObjectId(pkUserId)
        }
      }
      let unwind={
        $unwind:"$arrAddress"
      }
      let matchQuery2={
        $match:{
          "arrAddress.pkAddressId":new ObjectId(pkAddressId)
        }
      }
    let userAddress=await db.get().collection(USER_COLLECTION).aggregate([matchQuery1,unwind,matchQuery2]).toArray()
   
        let addressCount=false
         if(userAddress[0].length>0){
           addressCount=true
         }
       
        res.render("user/editAddress",{layout:"user_layout",arrAddress:userAddress[0].arrAddress, addressCount})
      
     } else {
      res.json({success:false,message:"address id not found"})
     }
  
    } catch (error) {
      res.json({success:false,message:error.message})
    }
  }
  
  //set as default address
  const setAsDefaultAddress=async(req,res)=>{
   
    try {
      if(req.body.pkUserId){
        if(req.body.pkAddressId){
         
         
          const pkUserId = new ObjectId(req.body.pkUserId);
          const pkAddressId = new ObjectId(req.body.pkAddressId);
          
         
          const filter1 = {
            pkUserId,
            "arrAddress.isDefaultAddress": true
          };
          
          const update1 = {
            $set: {
              "arrAddress.$.isDefaultAddress": false
            }
          };
          
          const result1 = await db.get().collection(USER_COLLECTION).updateMany(filter1, update1);
          
          console.log(`${result1.modifiedCount} document(s) updated to set isDefaultAddress to false.`);
          
         
          const filter2 = {
            pkUserId,
            "arrAddress.pkAddressId": pkAddressId
          };
          
          const update2 = {
            $set: {
              "arrAddress.$.isDefaultAddress": true
            }
          };
          
          const result2 = await db.get().collection(USER_COLLECTION).updateOne(filter2, update2);
          
          console.log(`${result2.modifiedCount} document updated to set isDefaultAddress to true for pkAddressId: ${pkAddressId}.`);
          res.json({success:true,message:"Address set as default address"})
        
  
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
  
  
  
  //delete address
  const deleteAddress=async(req,res)=>{
   
    try {
      if(req.body.pkUserId){
        if(req.body.pkAddressId){
          let pkUserId=new ObjectId(req.body.pkUserId)
          let pkAddressId=new ObjectId(req.body.pkAddressId)
          const result = await db.get().collection(USER_COLLECTION).updateOne(
            { pkUserId ,strStatus:"Active"},
            { $pull: { arrAddress: {pkAddressId } } }
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