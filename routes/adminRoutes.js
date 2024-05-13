const express = require('express');
const router =express.Router()
const dotenv=require("dotenv")
const {verifyLogin}=require("../middlewares/verifications")

dotenv.config()
const { getAdminHome, adminLogin, logout,} = require('../controller/adminController');
const { addCategory, getCategoryPage, deleteCategory, blockCategory, getEditCategory, editCategory }=require('../controller/categoryController');
const { getProductList, getProductAdd, addProduct, editProduct, deleteProduct, blockProduct, getProductEdit,editProductImages, getProductImageEditPage} = require('../controller/productController');
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
router.get("/orderList",isAdmin,getOrderListAdmin)

//order details page
router.get("/orderDetailsPage",isAdmin,getOrderDetailsPageAdmin)

//change order status
router.post("/orderStatusChange",changeOrderStatus)

//edit image page
router.get("/getProductImageEdit",getProductImageEditPage)

//get list coupons
router.get("/listCoupons",listCoupons)

//get Create coupon page

router.get("/getCreateCoupon",getCreateCoupons)

//create coupon
router.post("/createCoupon",createCoupon)

//block/active coupon
router.patch("/blockCoupon",blockCoupon)

//get Edit coupon page

router.get("/getCouponEdit",getEditCoupon)

router.post("/couponEdit",couponEdit)

//generate pdf 
router.get('/api/reports/pdf',generatePDFReport);

router.get('/api/reports/excel',generateExcelReport);

//list offer page
router.get("/listOffer",listOffer)

//get create offer page
router.get("/getCreateOffer",getCreateOffer)

//create offer
router.post("/createOffer",createOffer)


//get Edit offer page

router.get("/getofferEdit",getEditOffer)

//edit offer
router.post("/offerEdit",offerEdit)

//block offer
router.patch("/blockOffer",blockOffer)

//monthly chart
router.get("/api/statistics/monthly",monthlyChart)

//last 30 days
router.get("/api/statistics",dailyChart)

// yearly chart
router.get("/api/statistics/yearly",yearlyChart)

//custom chart
router.get("/api/statistics/custom",customChart)

//top products
router.get("/api/topProducts",topProducts)

// top Categories
router.get("/api/topCategories",topCategories)

module.exports=router