const db = require('../config/connection');
const bcrypt = require('bcrypt');
const {USER_COLLECTION, PRODUCTS_COLLECTION} =require("../config/collections")
const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');

// Initialize Twilio client with your credentials
const accountSid = 'AC88cdced8f7ff9347a07b3bc1df9e6529';
const authToken = '9559064bd51e04028c789dbf61c4f4f3';
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
    let { username, email, password } = req.body;

    let emailExist = await db.get().collection(USER_COLLECTION).findOne({ strEmail:email,strStatus:{$ne:"Deleted"} });

    if (!emailExist) {
      const hashedPassword = await bcrypt.hash(password, 10);
      let userData = {
        pkUserId:new ObjectId(),
        strUserName:username,
        strEmail:email,
        strPassword: hashedPassword,
        strProfileImg:null,
        strStatus:"Active",
        createdDate: new Date(),
        updatedDate: null,
      };
      let result = await db.get().collection(USER_COLLECTION).insertOne(userData);

      req.session.loggedIn = true;
      req.session.user = userData;
     
      res.json({ success: true, message: 'Form submitted successfully!' });
      
     
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
  const { phoneNumber } = req.body;
  console.log(req.body);
  const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets:false });

 console.log({OTP});
  // Save OTP in memory
  otpStorage.set(phoneNumber,OTP);

  // Send OTP via SMS using Twilio
  twilioClient.messages
      .create({
          body: `Your OTP is: ${OTP}`,
          from: '+14455449136',
          to: phoneNumber
      })
      .then(() => {
       res.json({success:true,message:'OTP sent successfully'})
      })
      .catch(error => {
          console.error('Error sending OTP:', error);
          res.status(500).send('Failed to send OTP');
      });
}

const getOtpPage=(req,res)=>{

    res.render("user/otpPage",{layout:"otp_layout"})
 
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

module.exports = { getSignUp, signUp, getHome, login, logout ,generateOtp,getOtpPage,getSingleProductPage};
