const express = require('express');
const { getSignUp, signUp, getHome, login,logout } = require('../controller/userController');
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

//post logout
router.get('/logout',logout)

module.exports=router