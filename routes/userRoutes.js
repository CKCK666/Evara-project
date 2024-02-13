const express = require('express');
const { getSignUp, signUp, getHome, login,logout } = require('../controller/userController');
const {verifyLogin,}=require("../middlewares/verification")
const router =express.Router()

//get signup page
router.get("/signUp",getSignUp)

//post signup
router.post("/signUp",signUp)

//get home page
router.get("/",verifyLogin,getHome)

//post login
router.post("/login",login)

//post logout
router.post('/logout',logout)

module.exports=router