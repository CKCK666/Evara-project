const express = require('express');
const router =express.Router()
const dotenv=require("dotenv")
const {verifyLogin}=require("../middlewares/verifications")

dotenv.config()
const { getAdminHome, adminLogin, logout,} = require('../controller/adminController');
const { addCategory, getCategoryPage, deleteCategory, blockCategory, getEditCategory, editCategory, applyCategoryOffer, removeCategoryOffer }=require('../controller/categoryController');
const { getProductList, getProductAdd, addProduct, editProduct, deleteProduct, blockProduct, getProductEdit,editProductImages, getProductImageEditPage, applyProductOffer, deleteProductImages, addMoreProductImages, removeProductOffer} = require('../controller/productController');
const { deleteUser, getUserList, blockUser,}=require("../controller/userController")
const {getOrderDetailsPageAdmin,getOrderListAdmin,changeOrderStatus}=require("../controller/orderController")
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

  // cloudinary.config({
  //   cloud_name:process.env.CLOUDINARY_NAME,
  //   api_key:process.env.CLOUDINARY_API_KEY,
  //   api_secret:process.env.CLOUDINARY_API_SECRET
  // });
  
  // // Set up Multer storage using Cloudinary
  // const storage = new CloudinaryStorage({
  //   cloudinary: cloudinary,
  //   params: {
  //     folder: 'Evara project', // Optional folder in Cloudinary
  //     allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file formats
  //     // Optionally, you can specify transformations or other parameters here
  //   }
  // });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    // Use the current timestamp as the filename to avoid overwriting existing files
    cb(null, Date.now() + '-' + file.originalname);
  }
});




  const uploads = multer({ storage: storage });
const { isAdmin } = require('../middlewares/verifications');
const { listCoupons, getCreateCoupons,createCoupon, blockCoupon, getEditCoupon, couponEdit } = require('../controller/couponController');
const { generatePDFReport, generateExcelReport } = require('../controller/reportController');
const { getCreateOffer, createOffer, listOffer, getEditOffer, offerEdit, blockOffer } = require('../controller/offerController');
const {monthlyChart, dailyChart, yearlyChart, customChart, topProducts, topCategories}=require("../controller/chartController")


//get home page
router.get("/",isAdmin,getAdminHome)

//post login
router.post("/login",adminLogin)


//post logout
router.get('/logout',logout)

//delete user
router.patch("/deleteUser",isAdmin,deleteUser)
    
//unblock/block user   
router.patch("/blockUser",isAdmin,blockUser)

//get user list  page
router.get("/listUsers",isAdmin,getUserList)

//add category

router.post("/addCategory",isAdmin,addCategory)

//get category page

router.get("/getCategoryPage",isAdmin,getCategoryPage)

//delete category
router.patch("/deleteCategory",isAdmin,deleteCategory)

//block category
router.patch("/blockCategory",isAdmin,blockCategory)

//get edit category page
router.get("/getCategoryEdit",isAdmin,getEditCategory)

//update category

router.patch("/editCategory",isAdmin,editCategory)

//get product list page
router.get("/listProducts",isAdmin,getProductList)

//get product create page
router.get("/getAddProduct",isAdmin,getProductAdd)

//create add product

router.post("/addProduct",isAdmin,uploads.any(),addProduct)


//get edit product page
router.get("/getProductEdit",isAdmin,getProductEdit)

//edit product
router.post("/editProduct",isAdmin,uploads.any(),editProduct)

//edit product images
router.post("/editProductImages",isAdmin,uploads.any(),editProductImages)

//delete product image
router.patch("/deleteProductImage",isAdmin,deleteProductImages)

//add more images
router.post("/addMoreImages",isAdmin,uploads.any(), addMoreProductImages)


//delete product
router.patch("/deleteProduct",isAdmin,deleteProduct)

//block product
router.patch("/blockProduct",isAdmin,blockProduct)

//order list page
router.get("/orderList",isAdmin,getOrderListAdmin)

//order details page
router.get("/orderDetailsPage",isAdmin,getOrderDetailsPageAdmin)

//change order status
router.post("/orderStatusChange",isAdmin,changeOrderStatus)

//edit image page
router.get("/getProductImageEdit",isAdmin,getProductImageEditPage)

//get list coupons
router.get("/listCoupons",isAdmin,listCoupons)

//get Create coupon page

router.get("/getCreateCoupon",isAdmin,getCreateCoupons)

//create coupon
router.post("/createCoupon",isAdmin,createCoupon)

//block/active coupon
router.patch("/blockCoupon",isAdmin,blockCoupon)

//get Edit coupon page

router.get("/getCouponEdit",isAdmin,getEditCoupon)

router.post("/couponEdit",isAdmin,couponEdit)

//generate pdf 
router.get('/api/reports/pdf',isAdmin,generatePDFReport);

router.get('/api/reports/excel',isAdmin,generateExcelReport);

//list offer page
router.get("/listOffer",isAdmin,listOffer)

//get create offer page
router.get("/getCreateOffer",isAdmin,getCreateOffer)

//create offer
router.post("/createOffer",isAdmin,createOffer)


//get Edit offer page

router.get("/getofferEdit",isAdmin,getEditOffer)

//edit offer
router.post("/offerEdit",isAdmin,offerEdit)

//block offer
router.patch("/blockOffer",isAdmin,blockOffer)

//monthly chart
router.get("/api/statistics/monthly",isAdmin,monthlyChart)

//last 30 days
router.get("/api/statistics",isAdmin,dailyChart)

// yearly chart
router.get("/api/statistics/yearly",isAdmin,yearlyChart)

//custom chart
router.get("/api/statistics/custom",isAdmin,customChart)

//top products
router.get("/api/topProducts",isAdmin,topProducts)

// top Categories
router.get("/api/topCategories",isAdmin,topCategories)

router.patch("/apply_offer",isAdmin,applyProductOffer)

router.patch("/remove_offer",isAdmin,removeProductOffer)

router.patch("/apply_offer-category",isAdmin,applyCategoryOffer)

router.patch("/remove_offer-category",isAdmin,removeCategoryOffer)

module.exports=router