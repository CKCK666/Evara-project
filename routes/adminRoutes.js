const express = require('express');
const router =express.Router()
const dotenv=require("dotenv")
const {verifyLogin}=require("../middlewares/verifications")

dotenv.config()
const { getAdminHome, adminLogin, logout, getOrderList, getOrderDetailsPage} = require('../controller/adminController');
const { addCategory, getCategoryPage, deleteCategory, blockCategory, getEditCategory, editCategory }=require('../controller/categoryController');
const { getProductList, getProductAdd, addProduct, editProduct, deleteProduct, blockProduct, getProductEdit,editProductImages} = require('../controller/productController');
const { deleteUser, getUserList, blockUser,}=require("../controller/userController")
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

  cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
  });
  
  // Set up Multer storage using Cloudinary
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'Evara project', // Optional folder in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file formats
      // Optionally, you can specify transformations or other parameters here
    }
  });
  const uploads = multer({ storage: storage });
const { isAdmin } = require('../middlewares/verifications');


//get home page
router.get("/",isAdmin,getAdminHome)

//post login
router.post("/login",adminLogin)


//post logout
router.get('/logout',logout)

//delete user
router.patch("/deleteUser",deleteUser)
    
//unblock/block user   
router.patch("/blockUser",blockUser)

//get user list  page
router.get("/listUsers",isAdmin,getUserList)

//add category

router.post("/addCategory",addCategory)

//get category page

router.get("/getCategoryPage",isAdmin,getCategoryPage)

//delete category
router.patch("/deleteCategory",deleteCategory)

//block category
router.patch("/blockCategory",blockCategory)

//get edit category page
router.get("/getCategoryEdit",isAdmin,getEditCategory)

//update category

router.patch("/editCategory",editCategory)

//get product list page
router.get("/listProducts",isAdmin,getProductList)

//get product create page
router.get("/getAddProduct",isAdmin,getProductAdd)

//create add product

router.post("/addProduct",uploads.any(),addProduct)


//get edit product page
router.get("/getProductEdit",isAdmin,getProductEdit)

//edit product
router.post("/editProduct",uploads.any(),editProduct)

//edit product images
router.post("/editProductImages",uploads.any(),editProductImages)

//delete product
router.patch("/deleteProduct",deleteProduct)

//block product
router.patch("/blockProduct",blockProduct)

//order list page
router.get("/orderList",isAdmin,getOrderList)

//order details page
router.get("/orderDetailsPage",isAdmin,getOrderDetailsPage)

module.exports=router