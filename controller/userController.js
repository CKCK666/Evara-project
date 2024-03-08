const db = require('../config/connection');
const bcrypt = require('bcrypt');
const mongoose=require('mongoose')
const User =require("../models/userModel")
const Product =require("../models/productModel")
const {USER_COLLECTION, PRODUCTS_COLLECTION, CATEGORY_COLLECTION, CART_COLLECTION, ORDER_COLLECTION} =require("../config/collections")
const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');

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
  console.log(req.session.user.pkUserId);
  let userExist = await User.find({pkUserId: objectIdToFind ,strStatus:"Active"})
    

  if (userExist && userExist.length > 0) {
    let findProducts =await Product.find({strStatus:"Active"})
    let products=findProducts.map((product)=>{
      return{
        ...product._doc
      }
    })
    let categories =await User.find({strStatus:"Active"})
    let cartCount=0
    // await getCartCount(req.session.user.pkUserId)
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
     console.log(user);
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
  const phoneNumber=req.session.user.strPhoneNumber
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
  let phoneNumber=req.session.user.strPhoneNumber
 
  const storedOTP = otpStorage.get(phoneNumber);
   
  if (!storedOTP || storedOTP !== otp) {
      
      
      res.json({success:false,message:'Invalid OTP'});
      return;
  }
  req.session.otpVerified=true
  req.session.accessOtpPage=false
  // Delete OTP from storage once verified
  otpStorage.delete(phoneNumber);
   
  await User.updateOne({strEmail:req.session.user.strEmail},{$set:{strStatus:"Active"}})
  res.status(200).json({success:true,message:'OTP verified successfully'});
}


const getSingleProductPage=async(req,res)=>{
 
  try {
    if(req.query.pkProductId){
      let pkProductId=new ObjectId(req.query.pkProductId)
     
       let userId=req.session.user.pkUserId
       let cartCount= await getCartCount(userId)
     
      let product =await db.get().collection(PRODUCTS_COLLECTION).find({pkProductId:pkProductId,strStatus:"Active"}).toArray()
      
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
          arrAddress:1,
          pkUserId:1,
          strUserName:1,
          strEmail:1
        }
      }
    
      let arrAddress= await db.get().collection(USER_COLLECTION).aggregate([match,project]).toArray()
      arrAddress.forEach(doc => {
        doc.arrAddress.sort((a, b) => {
            if (a.isDefaultAddress && !b.isDefaultAddress) {
                return -1; // a comes before b
            } else if (!a.isDefaultAddress && b.isDefaultAddress) {
                return 1; // b comes before a
            }
            return 0; // maintain original order
        });
    });
     let result=await db.get().collection(ORDER_COLLECTION).find({pkUserId:new ObjectId(req.query.pkUserId)}).toArray()
     let userOrders=await result.map((order,index)=>{
      const isoDate = order.createdDate;
      const date = new Date(isoDate);
      const formattedDate = date.toString().substring(0, 15) 
      return {
        ...order,
        index:index+1,
        createdDate: formattedDate
       }
      
      })
      let userCart=await db.get().collection(CART_COLLECTION).find({pkUserId:new ObjectId(req.query.pkUserId)}).toArray()
      let cartCount= await getCartCount(req.query.pkUserId)
    
      if(arrAddress && arrAddress.length ){
      
        res.render("user/userSettings",{layout:"user_layout",user:true,arrAddress,pkUserId:req.query.pkUserId,cartCount,userOrders})
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
   

    let emailExist = await db.get().collection(USER_COLLECTION).find({ strEmail:email,strStatus:{$ne:"Deleted"},pkUserId:{$ne:new ObjectId(pkUserId)}}).toArray()
    if(emailExist.length){
      return res.json({succes:true,message:"Email id already exist"})
    }
    if(req.body.password){
      let user=await db.get().collection(USER_COLLECTION).findOne({pkUserId:new ObjectId(pkUserId),strStatus:"Active"})
      let result = await bcrypt.compare(req.body.password, user.strPassword);
      if(!result){
      return  res.json({ success: false, message: 'Invaild password!' });
      }
    }
    const hashedPassword = await bcrypt.hash(cpassword, 10);
    let userData = {
      strUserName:name,
      strEmail:email,
      strPassword: hashedPassword,
      updatedDate: new Date(),
    };
    let result = await db.get().collection(USER_COLLECTION).updateOne({pkUserId:new ObjectId(pkUserId)},{$set:userData});
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

  // change order status
  const changeOrderStatus=async(req,res)=>{
   try {
    console.log(req.body);
     if(req.body.pkOrderId || req.body.pkUserId){
      let pkOrderId=new ObjectId(req.body.pkOrderId)
      let pkUserId=new ObjectId(req.body.pkUserId)
      let orderStatus=req.body.orderStatusChange
    let result=await db.get().collection(ORDER_COLLECTION).updateOne({pkUserId,pkOrderId},{$set:{strOrderStatus:orderStatus,updatedDate:new Date()}})
      console.log(result);
    if (result.modifiedCount>0) {
      
      res.json({success:true,message: 'successfully Cancelled the order!',userBlocked:true})
    }
    else{
    
      res.json({success:false,message: 'fail to update!'})
    }
  }else{
    res.json({success:false,message: 'Need both order id and user id'})
  }
   } catch (error) {
    console.log(error.message);
      res.json({success:false,message: error.message})
   }
  }

  const getOrderDetailsPage=async(req,res)=>{
   
    try {
      if(req.query.pkUserId || req.query.pkOrderId){
      let pkUserId =new ObjectId(req.query.pkUserId)
      let pkOrderId =new ObjectId(req.query.pkOrderId)
      let orderDetails=await db.get().collection(ORDER_COLLECTION).find({pkUserId,pkOrderId}).toArray()
      
      let cartCount=0
      if (orderDetails && orderDetails.length) {
        
        let cartCount= await getCartCount(pkUserId)
        let orderProducts= await orderDetails[0].arrProductsDetails.map(obj=>{
          let intTotalPrice=obj.intQuantity*obj.intPrice
          return {...obj,intTotalPrice:intTotalPrice}
           
        })
        
         res.render("user/orderDetails",{layout:"user_layout",success:true,deliveryAddress:orderDetails[0].arrDeliveryAddress,orderProducts,orderDetails,cartCount ,message:"successfully loaded cart page",user:true})
       } else {
        res.render("user/orderDetails",{layout:"user_layout",success:true,user:true,pkUserId,cartCount})
       }
      }else{

      }
    } catch (error) {
      res.json({success:false,message:error.message})
    }
     
    
  }

 const sortProducts=async(req,res)=>{
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
    let result=await db.get().collection(PRODUCTS_COLLECTION).find(search).sort(sort).toArray()
    
    res.render("user/filterProducts",{layout:"user_layout",user:true,result})
  } catch (error) {
    res.json({success:true,message:"Fail to sort"})
  }
 }


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


async function getCartCount(userId) {

  let userCart=await User.find({pkUserId:new ObjectId(userId)})
  let cartCount=0
  if(userCart && userCart.length){
    let totalQuantity=await User.aggregate([
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

module.exports = {sortProducts,
  getOrderDetailsPage,
  changeOrderStatus,
 
   getSignUp, signUp, 
   getHome, login, logout ,
   userEdit,generateOtp,getOtpPage,
   getSingleProductPage,verifyOTP,
   getUserSetting,
  deleteUser,getUserList,
   blockUser,
   
};
