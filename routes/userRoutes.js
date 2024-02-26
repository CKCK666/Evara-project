const express = require('express');
const { getSignUp, signUp, getHome, login,logout, generateOtp, getOtpPage, getSingleProductPage, verifyOTP, addNewAddress, getUserSetting, deleteAddress, getAddressPage, addToCart, getCartPage, getCheckoutPage, checkOut, changeQuantity, userEdit } = require('../controller/userController');
const {verifyLogin}=require("../middlewares/verifications")
const router =express.Router()
const passport = require('passport');
//get signup page
router.get("/signUp",getSignUp)

//post signup
router.post("/signUp",signUp)

//get home page
router.get("/",verifyLogin,getHome)

// router.get("/",(req,res)=>{
//     console.log("homeeeeee");
//  res.render("user/homePage",{layout:"user_layout"})
// })

//post login
router.post("/login",login)




// Google authentication route

router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

// Google authentication callback
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
    }
);

//generate otp
router.post("/generateOTP",generateOtp)

//get otp page
router.get("/getOTP",getOtpPage)

router.post("/verifyOTP",verifyOTP)

router.get("/getProduct",verifyLogin,getSingleProductPage)

//get user settings page
router.get("/userSettings",getUserSetting)

//get address
router.get("/getAddAddress",getAddressPage)

//add address
router.post("/addAddress",addNewAddress)

//delete address
router.post("/deleteAddress",deleteAddress)

//get edit address page
router.get("/editAddress",(req,res)=>{
  
})

//addToCart

router.post("/addToCart",addToCart)

//get Cart page

router.get("/getCartPage",getCartPage)

//get checkout page

router.get("/getCheckoutPage",getCheckoutPage)

//checkout

router.post("/checkOut",checkOut)

//change quantity

router.post("/changeQuantity",changeQuantity)

//edit user

router.post("/userEdit",userEdit)

//post logout
router.get('/logout',logout)

module.exports=router