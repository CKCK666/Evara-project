const express = require('express');
const { getAdminHome, adminLogin, logout, deleteUser, getUserList, blockUser, addCategory, getCategoryPage, deleteCategory, blockCategory, getEditCategory, editCategory } = require('../controller/adminController');

const { isAdmin } = require('../middlewares/verification');
const router =express.Router()

//get home page
router.get("/",getAdminHome)

//post login
router.post("/login",adminLogin)


//post logout
router.post('/logout',logout)

//delete user
router.patch("/deleteUser",deleteUser)
    
//unblock/block user   
router.patch("/blockUser",blockUser)

//get user list  page
router.get("/listUsers",getUserList)

//add category

router.post("/addCategory",addCategory)

//get category page

router.get("/getCategoryPage",getCategoryPage)

//delete category
router.patch("/deleteCategory",deleteCategory)

//block category
router.patch("/blockCategory",blockCategory)

//get edit category page
router.get("/getCategoryEdit",getEditCategory)

//update category

router.patch("/editCategory",editCategory)


module.exports=router