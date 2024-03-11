const db = require('../config/connection');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose')
const User =require("../models/userModel")
const Product =require("../models/productModel")
const {USER_COLLECTION, PRODUCTS_COLLECTION, CATEGORY_COLLECTION, CART_COLLECTION, ORDER_COLLECTION} =require("../config/collections")
const Cart =require("../models/cartModel")
const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');

// Initialize Twilio client with your credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const otpStorage = new Map();
// get signup page
const getSignUp =(req, res) => {
 
  if (req.session.user || req.session.passport) {
   
    res.redirect('/');
  } else {
    req.session.destroy();
    res.render('user/signupPage',{layout:"user_layout"});
  }
};

//post signup
const signUp = async (req, res) => {
  try {
    let { username, email, password ,phno} = req.body;
   
      let strPhoneNumber="+91"+phno
    let emailExist = await User.findOne({ strEmail:email,strStatus:{$ne:"Deleted"} });

    if (!emailExist) {
      const hashedPassword = await bcrypt.hash(password, 10);
      let userData =new User ({
        pkUserId:new ObjectId(),
        strUserName:username,
        strEmail:email,
        strPassword: hashedPassword,
        strPhoneNumber:strPhoneNumber,
        strProfileImg:null,
       strStatus:"Pending",
        createdDate: new Date(),
        updatedDate: null,
      })
      let result = await userData.save()
   
      if(result._id){
        let _id=result._id
        let findUser=await User.find({_id},{strPassword:0,strProfileImg:0})
        req.session.user = findUser[0];
         
        req.session.otpVerified=false
       
        res.json({ success:true, message: 'Form submitted successfully!' });
      }else{
        res.json({ success: false, message: 'Failed to submitted !' });
      }

        } else {
      res.json({ success: false, message: 'Email already exists' });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get home page
const getHome = async (req, res) => {
  
  if(req.session.passport){
    console.log(req.session.passport);
    console.log("passporttt");
    let products =await User.find({strStatus:"Active"})
   return  res.render('user/homePage', {layout:"user_layout",user:true,products});
  }
  
 const objectIdToFind = new ObjectId(req.session.user.pkUserId);
  
  let userExist = await User.find({pkUserId: objectIdToFind ,strStatus:"Active"})
    

  if (userExist && userExist.length > 0) {
    let findProducts =await Product.find({strStatus:"Active"})
    let products=findProducts.map((product)=>{
      return{
        ...product._doc
      }
    })
    let categories =await User.find({strStatus:"Active"})
    let cartCount= await getCartCount(req.session.user.pkUserId)
    res.render('user/homePage', {layout:"user_layout",user:true,products,categories,pkUserId:req.session.user.pkUserId,cartCount});
  } else {
     console.log("not userExist");
    req.session.destroy();
    res.clearCookie('passport')
    res.render('user/loginPage',{layout:"user_layout"});
  }
};



//post login
const login = async(req,res) => {
  try {
    let { email, password } = req.body;

    let user = await User.findOne({ strEmail:email ,strStatus:"Active"});
    
    if (user) {
      let result = await bcrypt.compare(password, user.strPassword);
      if (result) {
        req.session.loggedIn = true;
        req.session.user = user;

        res.json({ success: true, message: 'Form submitted successfully!' });
      } else {
        res.json({ success: false, message: 'Invaild email or password!' });
      }
    } else {
      res.json({ success: false, message: 'Invaild email or password!' });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// Route to generate and send OTP
const generateOtp=(req, res) => {
  let phoneNumber
   if(req.session.user){
     phoneNumber=req.session.user.strPhoneNumber
   }
   else if(req.body.strPhoneNumber){
    phoneNumber=req.body.strPhoneNumber
    req.session.strPhoneNumber=req.body.strPhoneNumber
   }
   else{
    phoneNumber=req.session.strPhoneNumber
   }
 
    console.log("phno:",phoneNumber);
  const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets:false });

 console.log(process.env.TWILIO_SID,process.env.TWILIO_TOKEN);
  // Save OTP in memory
  otpStorage.set(phoneNumber,OTP);
console.log(otpStorage);
  // Send OTP via SMS using Twilio
  twilioClient.messages
      .create({
          body: `Your OTP is: ${OTP}`,
          from: '+14455449136',
          to: phoneNumber
      })
      .then(() => {
        req.session.accessOtpPage=true
       res.json({success:true,message:'OTP sent successfully',phoneNumber})
      })
      .catch(error => {
          console.error('Error sending OTP:', error);
          res.status(500).send('Failed to send OTP');
      });
}

const getOtpPage=(req,res)=>{
     if(req.session.accessOtpPage){
      req.session.accessOtpPage=false
      res.render("user/otpPage",{layout:"otp_layout"})
     }else{
      res.redirect("/")
     }
      
  }

const verifyOTP=async(req,res)=>{
 
  const { otp } = req.body;
  let phoneNumber
  let redirect
  if(req.session.user){
    redirect="home"
    phoneNumber=req.session.user.strPhoneNumber
  }else{
    redirect="resetPassword"
   phoneNumber=req.session.strPhoneNumber
     req.session.resetPageAccess=true
  }
 
  const storedOTP = otpStorage.get(phoneNumber);
   
  if (!storedOTP || storedOTP !== otp) {
      
      
      res.json({success:false,message:'Invalid OTP'});
      return;
  }
  if(req.session.user){
    req.session.otpVerified=true
  }

  req.session.accessOtpPage=false
  // Delete OTP from storage once verified
  otpStorage.delete(phoneNumber);
   if(req.session.user){
    await User.updateOne({strEmail:req.session.user.strEmail},{$set:{strStatus:"Active"}})
   }
 
  res.status(200).json({success:true,message:'OTP verified successfully',redirect});
}



//get usersettings page
const getUserSetting=async(req,res)=>{
 
  try {
   
    if(req.query.pkUserId){
    
      let match={
        $match:{
          pkUserId:new ObjectId(req.query.pkUserId),
          strStatus:"Active"
        }
      }
      let project={
        $project:{
         
          pkUserId:1,
          strUserName:1,
          strEmail:1
        }
      }
    
    
     let userDetails=await User.aggregate([match,project])
     

    
       if(userDetails.length){
        let addField={
          $addFields: {
            isDefaultAddressInt: { $cond: { if: "$isDefaultAddress", then: 1, else: 0 } }
          }
        }
        let sort= {
          $sort: {
            isDefaultAddressInt: -1 
          }
        }
        let projectAddress={
          $project:{
            isDefaultAddressInt: 0
          }
        }

        let orderSort={
          $sort:{
            updatedDate:-1,
            createdDate:-1
          }
        }

        let orderProject={
          $project:{
             pkOrderId:1,
             pkUserId:1,
             intTotalOrderPrice:1,
             strPaymentStatus:1,
             strPaymentMethod:1,
             strOrderStatus:1,
             createdDate:1
          }
        }
        
      

        let userCart=await Cart.find({pkUserId:new ObjectId(req.query.pkUserId)})
        let cartCount= await getCartCount(req.query.pkUserId)
        let  arrAddress=await Address.aggregate([match,addField,sort,projectAddress])
         let findOrders=await Order.aggregate([match,orderSort,orderProject])
         
         let userOrders= findOrders.map((order,index)=>{
          const isoDate = order.createdDate;
          const date = new Date(isoDate);
          const formattedDate = date.toString().substring(0, 15)
          return {
            ...order,
            index:index+1,
            createdDate: formattedDate
           }
          
          })
      
          res.render("user/userSettings",{layout:"user_layout",user:true,arrAddress,pkUserId:req.query.pkUserId,cartCount,userDetails,userOrders})
       }else{
        return res.json({success:false,message:"Failed to fetch user data"})
       }
      
      
     
    }else{
      res.json({success:false,message:"User id not found"})
    }
  } catch (error) {
    res.json({success:false,message:error.message})
  }

}




//post user edit
const userEdit = async (req, res) => {
  try {
    let {name, email, cpassword ,password,pkUserId} = req.body;
    
    console.log(name,email,cpassword,password,pkUserId);
   

    let emailExist = await User.find({ strEmail:email,strStatus:{$ne:"Deleted"},pkUserId:{$ne:new ObjectId(pkUserId)}})
    if(emailExist.length){
      return res.json({succes:true,message:"Email id already exist"})
    }

    let userData = {
      strUserName:name,
      strEmail:email,
      
      updatedDate: new Date(),
    };

    if(req.body.password){
      let user=await User.aggregate([{$match:{pkUserId:new ObjectId(pkUserId),strStatus:"Active"}}])
       
      let result = await bcrypt.compare(req.body.password, user[0].strPassword);
      if(!result){
      return  res.json({ success: false, message: 'Invaild password!' });
      }
      const hashedPassword = await bcrypt.hash(cpassword, 10);
      userData={
        ...userData,
        strPassword:hashedPassword
      }
    }
    
   
    let result = await User.updateOne({pkUserId:new ObjectId(pkUserId)},{$set:userData});
    if(result.modifiedCount>0){
    return  res.json({success:true,message:"successfully updated",pkUserId})
    }
    else{
   return   res.json({success:false,message:"Fail to updated",pkUserId})
    }   

    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};






   //get user list
   const getUserList=async(req,res)=>{
    try {
      let count =await User.find().countDocuments()
      if(count>0){
        let result=await User.find({strStatus:{$nin:["Deleted","Pending"]}})
       
        let users= result.map((user,index)=>{
          const isoDate = user.createdDate;
          const date = new Date(isoDate);
          const formattedDate = date.toString().substring(0, 15) 
          return {
            ...user._doc,
            index:index+1,
            createdDate: formattedDate
           }
          
          })
        console.log(users);
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
    
    
        let result=await User.updateOne({pkUserId:objectIdToUpdate},{$set:{strStatus:"Deleted",updatedDate:new Date()}})
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
      let result=await User.updateOne({pkUserId:objectIdToUpdate,strStatus},{$set:{strStatus:status,updatedDate:new Date()}})
      
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


//logout
const logout = (req, res) => {
  res.clearCookie('ckCookie', { domain: 'localhost', path: '/' })
req.session.destroy();
  res.redirect('/');
};

//get forgot password page
const forgotPasswordPage=(req,res)=>{
  try {
    if(req.session.user){
      res.redirect('/')
    }else{
      res.render("user/forgotPasswordPage",{layout:"user_layout"})
    }
    
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

const verfiyUser=async(req,res)=>{
  console.log(req.body.strEmail, req.body.strPhoneNumber);
  try {
    if(req.body.strEmail || req.body.strPhoneNumber){
       let strEmail=req.body.strEmail
       let strPhoneNumber=req.body.strPhoneNumber
       let findUser=await User.findOne({strEmail,strPhoneNumber})
       if(findUser){
        req.session.accessOtpPage=true
        req.session.strEmail=req.body.strEmail
        res.json({success:true,message:"UserExist"})
       }
       else{
       return res.json({success:false,message:"User not found"})
       }
    }else{
      res.json({success:false,message:"Email and phone number not found"})
    }
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

const getResetPassword=(req,res)=>{
  try {
    if( req.session.resetPageAccess){
      req.session.resetPageAccess=false
      res.render("user/resetPasswordPage",{layout:"user_layout"})
    }else{
      res.redirect('/')
     
    }
    
  } catch (error) {
    res.json({success:false,message:error.message})
  }
 
  
  }



const resetPassword=async(req,res)=>{
  try {
    if(req.session.strEmail || req.body.password){
      const strEmail=req.session.strEmail
      const strPassword = await bcrypt.hash(req.body.password, 10);
      const updatePassword=await User.updateOne({strEmail,strStatus:"Active"},{$set:{strPassword:strPassword}})
      if(updatePassword.modifiedCount>0){
        res.json({success:true,message:"Successfully updated password"})
      }else{
        res.json({success:false,message:"Fail to update password"})
      }
    }else{
      res.json({success:false,message:"Email and new password not found"})
    }
  } catch (error) {
    res.json({success:false,message:error.message})
  }
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





module.exports = {
  verfiyUser,
  forgotPasswordPage,
   getSignUp, signUp, 
   getHome, login, logout ,
   userEdit,generateOtp,getOtpPage,
   verifyOTP,
   getUserSetting,
  deleteUser,getUserList,
   blockUser,
   resetPassword,
   getResetPassword
   
};
