const express = require('express');
const { getSignUp, signUp, getHome, login,logout, generateOtp, getOtpPage, verifyOTP,  getUserSetting,  userEdit, forgotPasswordPage, verfiyUser, resetPassword, getResetPassword } = require('../controller/userController');
const {verifyLogin}=require("../middlewares/verifications")
const { getSingleProductPage,sortProducts}=require("../controller/productController")
const {addToCart, getCartPage, changeQuantity, removeFromCart,}=require("../controller/cartController")
const {addToWishList, getWishListPage, removeFromWishList}=require("../controller/wishListController")
const {editAddress, getEditAddressPage, setAsDefaultAddress,deleteAddress, getAddressPage, addNewAddress}=require("../controller/addressController")
const {changeOrderStatus, getCheckoutPage, checkOut, getOrderDetailsPage, checkOutRazorPay, verifyPayment, orderDismiss}=require("../controller/orderController")
const router =express.Router()
const passport = require('passport');
const { printInvoice } = require('../controller/reportController');
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

router.get("/getForgotPassword",forgotPasswordPage)


// Google authentication route

router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

// Google authentication callback
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        
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
router.get("/userSettings",verifyLogin,getUserSetting)

//get address
router.get("/getAddAddress",verifyLogin,getAddressPage)

//add address
router.post("/addAddress",verifyLogin,addNewAddress)

//delete address
router.post("/deleteAddress",verifyLogin,deleteAddress)

//get edit address page
router.get("/getEditAddress",verifyLogin,getEditAddressPage)
// edit address
router.post("/editAddress",verifyLogin,editAddress)

router.post("/setAsDefault",verifyLogin,setAsDefaultAddress)

//addToCart

router.post("/addToCart",verifyLogin,addToCart)


//get Cart page

router.get("/getCartPage",verifyLogin,getCartPage)

//remove from cart
router.post("/removeFromCart",verifyLogin,removeFromCart)


//addToWishList

router.post("/addToWishList",verifyLogin,addToWishList)



//get  wish list page

router.get("/getWishListPage",verifyLogin,getWishListPage)

//remove from wish list
router.post("/removeFromWishList",verifyLogin,removeFromWishList)




//get checkout page

router.get("/getCheckoutPage",verifyLogin, getCheckoutPage)

//checkout

router.post("/checkOut",verifyLogin,checkOut)

//verify razorpay payment
router.post("/payment/success",verifyLogin,verifyPayment)

router.post("/checkOutRazorPay",verifyLogin,checkOutRazorPay)

//change quantity

router.post("/changeQuantity",verifyLogin,changeQuantity)

//edit user

router.post("/userEdit",verifyLogin,userEdit)

//change order status

router.post("/orderStatusChange",verifyLogin,changeOrderStatus)

//get order details page
router.get("/getOrderDetails",verifyLogin,getOrderDetailsPage)

//search and filter

router.get("/search",verifyLogin,sortProducts)

//router user exist
router.post('/verifyUser',verfiyUser)

//router get password reset page
router.get("/getResetPassword",getResetPassword)


router.post("/resetPassword",resetPassword)
//post logout
router.get('/logout',logout)

//generate invoice
router.get("/api/printInvoice",verifyLogin,printInvoice);

router.delete("/paymentDismiss",verifyLogin,orderDismiss)

module.exports=router