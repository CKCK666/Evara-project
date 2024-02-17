const db = require('../config/connection');
const bcrypt = require('bcrypt');
const {USER_COLLECTION, PRODUCTS_COLLECTION} =require("../config/collections")
const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
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
   return  res.render('user/homePage', {layout:"user_layout",user:true});
  }
  
 const objectIdToFind = new ObjectId(req.session.user.pkUserId);
  let userExist = await db
    .get()
    .collection(USER_COLLECTION)
    .find({pkUserId: objectIdToFind ,strStatus:"Active"})
    .toArray();

  if (userExist && userExist.length > 0) {
    res.render('user/homePage', {layout:"user_layout",user:true});
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

//logout
const logout = (req, res) => {
  res.clearCookie('ckCookie', { domain: 'localhost', path: '/' })
req.session.destroy();
  res.redirect('/');
};

module.exports = { getSignUp, signUp, getHome, login, logout };
