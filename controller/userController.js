const db = require('../config/connection');
const bcrypt = require('bcrypt');
const {USER_COLLECTION, PRODUCTS_COLLECTION} =require("../config/collections")
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
const getSignUp = (req, res) => {
 
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
     console.log("signup+++++",phno);
      let strPhoneNumber="+91"+phno
    let emailExist = await db.get().collection(USER_COLLECTION).findOne({ strEmail:email,strStatus:{$ne:"Deleted"} });

    if (!emailExist) {
      const hashedPassword = await bcrypt.hash(password, 10);
      let userData = {
        pkUserId:new ObjectId(),
        strUserName:username,
        strEmail:email,
        strPassword: hashedPassword,
        strPhoneNumber:strPhoneNumber,
        strProfileImg:null,
       strStatus:"Pending",
        createdDate: new Date(),
        updatedDate: null,
      };
      let result = await db.get().collection(USER_COLLECTION).insertOne(userData);
      console.log(result);
      if(result.insertedId){
        let _id=result.insertedId
        let findUser=await db.get().collection(USER_COLLECTION).find({_id},{strPassword:-1,strProfileImg:-1}).toArray()
        req.session.user = findUser[0];
        console.log(req.session.user);
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
    let products =await db.get().collection(PRODUCTS_COLLECTION).find({strStatus:"Active"}).toArray()
   return  res.render('user/homePage', {layout:"user_layout",user:true,products});
  }
  
 const objectIdToFind = new ObjectId(req.session.user.pkUserId);
  let userExist = await db
    .get()
    .collection(USER_COLLECTION)
    .find({pkUserId: objectIdToFind ,strStatus:"Active"})
    .toArray();

  if (userExist && userExist.length > 0) {
    let products =await db.get().collection(PRODUCTS_COLLECTION).find({strStatus:"Active"}).toArray()

    res.render('user/homePage', {layout:"user_layout",user:true,products});
  } else {
    req.session.destroy();
    res.clearCookie('passport')
    res.render('user/loginPage',{layout:"user_layout"});
  }
};



//post login
const login = async(req,res) => {
  try {
    let { email, password } = req.body;

    let user = await db.get().collection(USER_COLLECTION).findOne({ strEmail:email ,strStatus:"Active"});
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
   
  await db.get().collection(USER_COLLECTION).updateOne({strEmail:req.session.user.strEmail},{$set:{strStatus:"Active"}})
  res.status(200).json({success:true,message:'OTP verified successfully'});
}


const getSingleProductPage=async(req,res)=>{
  console.log(req.params);
  try {
    if(req.query.pkProductId){
      let pkProductId=new ObjectId(req.query.pkProductId)
     
      let product =await db.get().collection(PRODUCTS_COLLECTION).find({pkProductId:pkProductId,strStatus:"Active"}).toArray()
      console.log(product);
        if(product.length){
          
        res.render("user/productSingle",{layout:"user_layout",user:true,product})
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


//logout
const logout = (req, res) => {
  res.clearCookie('ckCookie', { domain: 'localhost', path: '/' })
req.session.destroy();
  res.redirect('/');
};

module.exports = { getSignUp, signUp, getHome, login, logout ,generateOtp,getOtpPage,getSingleProductPage,verifyOTP};
