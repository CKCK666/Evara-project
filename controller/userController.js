const db = require('../config/connection');
const bcrypt = require('bcrypt');
const {USER_COLLECTION, PRODUCTS_COLLECTION, CATEGORY_COLLECTION, CART_COLLECTION, ORDER_COLLECTION} =require("../config/collections")
const { ObjectId } = require('mongodb');
const router = require('../routes/userRoutes');
const otpGenerator = require('otp-generator');
const twilio = require('twilio');

// Initialize Twilio client with your credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
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
    let { username, email, password ,phno} = req.body;
     console.log("signup+++++",phno);
      let strPhoneNumber="+91"+phno
    let emailExist = await db.get().collection(USER_COLLECTION).findOne({ strEmail:email,strStatus:{$ne:"Deleted"} });

    if (!emailExist) {
      const hashedPassword = await bcrypt.hash(password, 10);
      let userData = {
        pkUserId:new ObjectId(),
        arrAddress:[],
        strUserName:username,
        strEmail:email,
        strPassword: hashedPassword,
        strPhoneNumber:strPhoneNumber,
        strProfileImg:null,
       strStatus:"Pending",
        createdDate: new Date(),
        updatedDate: null,
      };
      let result = await db.get().collection(USER_COLLECTION).insertOne(userData);
      console.log(result);
      if(result.insertedId){
        let _id=result.insertedId
        let findUser=await db.get().collection(USER_COLLECTION).find({_id},{strPassword:-1,strProfileImg:-1}).toArray()
        req.session.user = findUser[0];
        console.log(req.session.user);
        req.session.otpVerified=false

        res.json({ success:true, message: 'Form submitted successfully!' });
      }else{
        res.json({ success: false, message: 'Failed to submitted !' });
      }

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
    let categories =await db.get().collection(CATEGORY_COLLECTION).find({strStatus:"Active"}).toArray()
    let cartCount= await getCartCount(req.session.user.pkUserId)
    res.render('user/homePage', {layout:"user_layout",user:true,products,categories,pkUserId:req.session.user.pkUserId,cartCount});
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
  const phoneNumber=req.session.user.strPhoneNumber
    console.log("phno:",phoneNumber);
  const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets:false });

 
  // Save OTP in memory
  otpStorage.set(phoneNumber,OTP);
console.log(otpStorage);
  // Send OTP via SMS using Twilio
  twilioClient.messages
      .create({
          body: `Your OTP is: ${OTP}`,
          from: '+14455449136',
          to: phoneNumber
      })
      .then(() => {
        req.session.accessOtpPage=true
       res.json({success:true,message:'OTP sent successfully',phoneNumber})
      })
      .catch(error => {
          console.error('Error sending OTP:', error);
          res.status(500).send('Failed to send OTP');
      });
}

const getOtpPage=(req,res)=>{
     if(req.session.accessOtpPage){
      req.session.accessOtpPage=false
      res.render("user/otpPage",{layout:"otp_layout"})
     }else{
      res.redirect("/")
     }
      
  }

const verifyOTP=async(req,res)=>{
 
  const { otp } = req.body;
  let phoneNumber=req.session.user.strPhoneNumber
 
  const storedOTP = otpStorage.get(phoneNumber);
   
  if (!storedOTP || storedOTP !== otp) {
      
      
      res.json({success:false,message:'Invalid OTP'});
      return;
  }
  req.session.otpVerified=true
  req.session.accessOtpPage=false
  // Delete OTP from storage once verified
  otpStorage.delete(phoneNumber);
   
  await db.get().collection(USER_COLLECTION).updateOne({strEmail:req.session.user.strEmail},{$set:{strStatus:"Active"}})
  res.status(200).json({success:true,message:'OTP verified successfully'});
}


const getSingleProductPage=async(req,res)=>{
 
  try {
    if(req.query.pkProductId){
      let pkProductId=new ObjectId(req.query.pkProductId)
     
       let userId=req.session.user.pkUserId
       let cartCount= await getCartCount(userId)
     
      let product =await db.get().collection(PRODUCTS_COLLECTION).find({pkProductId:pkProductId,strStatus:"Active"}).toArray()
      
        if(product.length){
          
        res.render("user/productSingle",{layout:"user_layout",user:true,product,userId,cartCount})
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
//get usersettings page
const getUserSetting=async(req,res)=>{
 
  try {
   
    if(req.query.pkUserId){
    
      let match={
        $match:{
          pkUserId:new ObjectId(req.query.pkUserId),
          strStatus:"Active"
        }
      }
      let project={
        $project:{
          arrAddress:1,
          pkUserId:1,
          strUserName:1,
          strEmail:1
        }
      }
      let arrAddress= await db.get().collection(USER_COLLECTION).aggregate([match,project]).toArray()
      let userCart=await db.get().collection(CART_COLLECTION).find({pkUserId:new ObjectId(req.query.pkUserId)}).toArray()
      let cartCount= await getCartCount(req.query.pkUserId)
      console.log(arrAddress);
      if(arrAddress && arrAddress.length ){
      
        res.render("user/userSettings",{layout:"user_layout",user:true,arrAddress,pkUserId:req.query.pkUserId,cartCount})
      }
     
    }else{
      res.json({success:false,message:"User id not found"})
    }
  } catch (error) {
    res.json({success:false,message:error.message})
  }

}

//get add address page
const getAddressPage=async(req,res)=>{
  try {
   let pkUserId=req.query.pkUserId
    let user=await db.get().collection(USER_COLLECTION).find({pkUserId:new ObjectId(pkUserId)}).toArray()
    let addressCount=false
     if(user[0].arrAddress.length>0){
       addressCount=true
     }

    res.render("user/addAddress",{layout:"user_layout",pkUserId,addressCount})
  } catch (error) {
    res.json({success:false,message:"fail to render add  address page"})
  }
}

//add address
const addNewAddress=async(req,res)=>{
  console.log(req.body);
  try {
     if(req.body.pkUserId){
       let matchQuery={
       
          pkUserId:new ObjectId(req.body.pkUserId),
          strStatus:"Active",
        
        
       } 
        let isDefaultAddress=false
        if(req.body.addressCheckBox){
          isDefaultAddress=true
          let arrAddressExist=await db.get().collection(USER_COLLECTION).find(matchQuery,{arrAddress:1}).toArray()
          console.log(arrAddressExist);
           if(arrAddressExist.length>0){
            let matchQuery2={
              pkUserId:new ObjectId(req.body.pkUserId),
              strStatus:"Active",
              "arrAddress.isDefaultAddress":true
            }
            await db.get().collection(USER_COLLECTION).updateOne(matchQuery2,{ $set: { "arrAddress.$.isDefaultAddress": false }})
           }
         
        }
       let dataToAdd={
        $addToSet:{
          arrAddress:{
            pkUserId:new ObjectId(req.body.pkUserId),
            pkAddressId:new ObjectId(),
           strFullName:req.body.fname,
           strPhoneNo:req.body.phno,
           strArea:req.body.area || null,
           intPinCode:req.body.pinCode,
           strCity:req.body.city,
           strState:req.body.state,
           isDefaultAddress
          }
         }
    }
        let result=await db.get().collection(USER_COLLECTION).updateOne(matchQuery,dataToAdd)
        
        res.json({success:true,message:"successfully add address",pkUserId:req.body.pkUserId})
     }else{
      res.json({success:false,message:"User id not found"})
     }
  } catch (error) {
    res.json({success:false,message:error.message})
  }

}

//delete address
const deleteAddress=async(req,res)=>{
 
  try {
    if(req.body.pkUserId){
      if(req.body.pkAddressId){
        let pkUserId=new ObjectId(req.body.pkUserId)
        let pkAddressId=new ObjectId(req.body.pkAddressId)
        const result = await db.get().collection(USER_COLLECTION).updateOne(
          { pkUserId ,strStatus:"Active"},
          { $pull: { arrAddress: {pkAddressId } } }
        );
       
      if (result.modifiedCount===1) {
       
        res.json({success:true,message: 'successfully  deleted!',pkUserId:req.body.pkUserId})
      }
      else{
        console.log("not user deleted");
        res.json({success:false,message: 'User not deleted!'})
      }
      

      }else{
        res.json({success:false,message:"Address id not found"})
      }
    }else{
      res.json({success:false,message:"User id id not found"})
    }
    
   
 
   } catch (error) {
    console.log(error.message);
      res.json({success:false,message: error.message})
   }
}

const addToCart=async(req,res)=>{
  try {
    console.log();
      if(req.body.pkUserId){
        let pkUserId =new ObjectId(req.body.pkUserId)
      let product=await db.get().collection(PRODUCTS_COLLECTION).find({pkProductId:new ObjectId(req.body.pkProductId),strStatus:"Active"}).toArray()
       if(product && product.length){
         let pkProductId=new ObjectId(product[0].pkProductId)
         let userCart= await db.get().collection(CART_COLLECTION).find({pkUserId}).toArray()
           
         if(userCart && userCart.length){
          let productInCart=await db.get().collection(CART_COLLECTION).find({pkUserId,"arrProducts.pkProductId":pkProductId}).toArray()
          
          if(productInCart.length){
            const update = {
              $inc: { "arrProducts.$.intQuantity": 1 },
           
            };
            const result = await db.get().collection(CART_COLLECTION).updateOne({pkUserId,"arrProducts.pkProductId":pkProductId}, update);
        
            
          let aggregatePipeline = [
              {
                $match: { pkUserId } // Match documents with the specified pkUserId
              },
              {
                $unwind: "$arrProducts" // Deconstruct the arrProducts array
              },
              {
                $group: {
                  _id: null,
                  total_cart_price: {
                    $sum: { $multiply: ["$arrProducts.intQuantity", "$arrProducts.intPrice"] }
                  }
                }
              }
            ];
            
            let totalPriceResult = await db.get().collection(CART_COLLECTION).aggregate(aggregatePipeline).toArray();
            
            // Update total_cart_price for the cart
            let updatedTotalPriceResult = await db.get().collection(CART_COLLECTION).updateOne(
              { pkUserId },
              { $set: { total_cart_price: totalPriceResult[0].total_cart_price } }
            );

          console.log("cart-updated111111111111");
            res.json({success:true,message:"cart updated-1"})







        
          }else{
            let matchQuery = {
              pkUserId: new ObjectId(req.body.pkUserId),
             
            };
           
            let dataToAdd = {
              $addToSet: {
                arrProducts: {
                  
                  ...product[0],
                  intQuantity: 1,
                  
                }
              }
            };
            
            let result = await db.get().collection(CART_COLLECTION).updateOne(matchQuery, dataToAdd);
          
            
            // Calculate total_cart_price using aggregation framework
            let aggregatePipeline = [
              {
                $match: {
                  pkUserId: new ObjectId(req.body.pkUserId), // Match documents with the specified user ID
                
                }
              },
              {
                $unwind: "$arrProducts" // Deconstruct the arrProducts array
              },
              {
                $group: {
                  _id: null,
                  total_cart_price: {
                    $sum: { $multiply: ["$arrProducts.intQuantity", "$arrProducts.intPrice"] }
                  }
                }
              }
            ];
            
            let totalPriceResult = await db.get().collection(CART_COLLECTION).aggregate(aggregatePipeline).toArray();
            
            // Update total_cart_price for the cart
            let updatedTotalPriceResult = await db.get().collection(CART_COLLECTION).updateOne(matchQuery, { $set: { total_cart_price: totalPriceResult[0].total_cart_price } });
            
       
           console.log("cartttt-22222222");
          
        res.json({success:true,message:"cart updated-2"})
            }

         }else{
         
        
          
          product[0].intQuantity=1
          
          let dataToAdd={
            pkCartId:new ObjectId(),
            pkUserId,
            arrProducts:[
              ...product,
              
            ],
            total_cart_price:product[0].intPrice,
            updatedDate:null,
            createDate:new Date()
          }
          let result=await db.get().collection(CART_COLLECTION).insertOne(dataToAdd)
          res.json({success:true,message:"new cart added-3"})
        }
        
       }
       else{
        res.json({success:true,message:"Product not found"})
       }

      }else{
        res.json({success:true,message:"user id not found"})
      }
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

//get cart page
const getCartPage=async(req,res)=>{
 try {
  let pkUserId ="65d30dd06aa1162bcd232981"
  
  let cartCount=0
 let cartDetails=await db.get().collection(CART_COLLECTION).find({pkUserId:new ObjectId(pkUserId)}).toArray()

 if (cartDetails && cartDetails.length) {

  let cartCount= await getCartCount(pkUserId)
  

  let cartProducts=cartDetails[0].arrProducts.map(obj=>{
    let intTotalPrice=obj.intQuantity*obj.intPrice
    return {...obj,intTotalPrice:intTotalPrice}
  })
   res.render("user/cartPage",{layout:"user_layout",success:true,cartDetails,cartProducts,pkUserId,message:"successfully loaded cart page",user:true,cartCount})
 } else {
  res.render("user/cartPage",{layout:"user_layout",success:true,user:true,pkUserId,cartCount})
 }
 } catch (error) {
  res.json({success:false,message:error.message})
 }
}

const getCheckoutPage=async(req,res)=>{
  try {
    let pkUserId =new ObjectId(req.session.user.pkUserId)
    let userAddress=await db.get().collection(USER_COLLECTION).find({pkUserId:pkUserId},{ projection: { "arrAddress": 1, "_id": 0 }}).toArray()
    let cartDetails=await db.get().collection(CART_COLLECTION).find({pkUserId}).toArray()
    let cartCount=0
    if (cartDetails && cartDetails.length) {
      let cartCount= await getCartCount(req.session.user.pkUserId)
      let cartProducts=cartDetails[0].arrProducts.map(obj=>{
        let intTotalPrice=obj.intQuantity*obj.intPrice
        return {...obj,intTotalPrice:intTotalPrice}
         
      })
      
       res.render("user/checkoutPage",{layout:"user_layout",success:true,userAddress,cartProducts,pkUserId,cartDetails,cartCount ,message:"successfully loaded cart page",user:true})
     } else {
      res.render("user/checkoutPage",{layout:"user_layout",success:true,user:true,pkUserId,cartCount})
     }
  } catch (error) {
    res.json({success:false,message:error.message})
  }
   
  
}
  
const checkOut=async (req,res)=>{
  try {
    console.log("hereeeee");
    let pkUserId=req.session.user.pkUserId
    let match1={
      $match:{
        pkUserId:new ObjectId(pkUserId),
        strStatus:"Active",
      }
    }
    let unwind={
      $unwind:"$arrAddress"
    }
    let match2={
      $match:{
        "arrAddress.isDefaultAddress": true
      }
    }
    let userAddress=await db.get().collection(USER_COLLECTION).aggregate([match1,unwind,match2]).toArray()
    console.log(userAddress);
   
    let cartProducts=await db.get().collection(CART_COLLECTION).find({pkUserId:new ObjectId(pkUserId)}).toArray()
    let dataToAdd={
      pkOrderId:new ObjectId(),
      pkUserId:new ObjectId(pkUserId),
      arrProductsDetails:cartProducts[0].arrProducts,
      arrDeliveryAddress:userAddress[0].arrAddress,
      intTotalOrderPrice:cartProducts[0].total_cart_price,
      strPaymentStatus:"Success",
      strPaymentMethod:"COD",
      strOrderStatus:"Pending",
      createdDate:new Date(),
      updatedDate:null
    }
   let result =await db.get().collection(ORDER_COLLECTION).insertOne(dataToAdd)
   if(result.insertedId){
    res.json({success:true,message:"Ordered successfully"})
   }
   else{
    res.json({success:false,message:"Order failed"})
   }

  } catch (error) {
    res.json({success:true,message:error.message})
  }
}

const changeQuantity=async(req,res)=>{
  try {
    console.log(req.body);
    let pkProductId=new ObjectId(req.body.pkProductId)
    let pkUserId=req.session.user.pkUserId
    let quantity=parseInt(req.body.quantity)
    let productInCart=await db.get().collection(CART_COLLECTION).find({pkUserId:new ObjectId(pkUserId),"arrProducts.pkProductId":pkProductId}).toArray()
       console.log(productInCart);   
    if(productInCart.length){
      const update = {
        $inc: { "arrProducts.$.intQuantity": quantity},
     
      };
      const result = await db.get().collection(CART_COLLECTION).updateOne({pkUserId:new ObjectId(pkUserId),"arrProducts.pkProductId":pkProductId}, update);
  
      
    let aggregatePipeline = [
        {
          $match: { pkUserId:new ObjectId(pkUserId) } // Match documents with the specified pkUserId
        },
        {
          $unwind: "$arrProducts" // Deconstruct the arrProducts array
        },
        {
          $group: {
            _id: null,
            total_cart_price: {
              $sum: { $multiply: ["$arrProducts.intQuantity", "$arrProducts.intPrice"] }
            }
          }
        }
      ];
      
      let totalPriceResult = await db.get().collection(CART_COLLECTION).aggregate(aggregatePipeline).toArray();
      
      // Update total_cart_price for the cart
      let updatedTotalPriceResult = await db.get().collection(CART_COLLECTION).updateOne(
        {pkUserId:new ObjectId( pkUserId )},
        { $set: { total_cart_price: totalPriceResult[0].total_cart_price } }
      );
      
      console.log(updatedTotalPriceResult);
      let InCart=productInCart[0].arrProducts.map(obj=>{
        let intTotalPrice=obj.intQuantity*obj.intPrice
        return {...obj,intTotalPrice:intTotalPrice}
      })



      res.json({success:true,message:"cart updated-1",quantity,totalPriceResult:totalPriceResult[0].total_cart_price,pkUserId})







  
    }
    console.log("no product cart");
  } catch (error) {
     res.json({succes:false,message:error.message})
  }

}

//post user edit
const userEdit = async (req, res) => {
  try {
    let {name, email, cpassword ,password,pkUserId} = req.body;
    
    console.log(name,email,cpassword,password,pkUserId);
   

    let emailExist = await db.get().collection(USER_COLLECTION).find({ strEmail:email,strStatus:{$ne:"Deleted"},pkUserId:{$ne:new ObjectId(pkUserId)}}).toArray()
    if(emailExist.length){
      return res.json({succes:true,message:"Email id already exist"})
    }
    if(req.body.password){
      let user=await db.get().collection(USER_COLLECTION).findOne({pkUserId:new ObjectId(pkUserId),strStatus:"Active"})
      let result = await bcrypt.compare(req.body.password, user.strPassword);
      if(!result){
      return  res.json({ success: false, message: 'Invaild password!' });
      }
    }
    const hashedPassword = await bcrypt.hash(cpassword, 10);
    let userData = {
      strUserName:name,
      strEmail:email,
      strPassword: hashedPassword,
      updatedDate: new Date(),
    };
    let result = await db.get().collection(USER_COLLECTION).updateOne({pkUserId:new ObjectId(pkUserId)},{$set:userData});
    if(result.modifiedCount>0){
    return  res.json({success:true,message:"successfully updated",pkUserId})
    }
    else{
   return   res.json({success:false,message:"Fail to updated",pkUserId})
    }   

    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


//logout
const logout = (req, res) => {
  res.clearCookie('ckCookie', { domain: 'localhost', path: '/' })
req.session.destroy();
  res.redirect('/');
};


async function getCartCount(userId) {

  let userCart=await db.get().collection(CART_COLLECTION).find({pkUserId:new ObjectId(userId)}).toArray()
  let cartCount=0
  if(userCart && userCart.length){
    let totalQuantity=await db.get().collection(CART_COLLECTION).aggregate([
     {
       $match:{
         pkUserId:new ObjectId(userId)
       }
     },
     {
       $unwind: "$arrProducts" // Unwind the arrProducts array to deconstruct the array
     },
     {
       $group: {
         _id: null,
         totalItems: { $sum: "$arrProducts.intQuantity" }
       }
     }
   ]).toArray()
   cartCount=totalQuantity[0].totalItems
   return cartCount
  }
  else{
    return cartCount
  }
  
}

module.exports = { getSignUp, signUp, getHome, login, logout ,userEdit,generateOtp,getOtpPage,getSingleProductPage,verifyOTP,addNewAddress,getUserSetting,deleteAddress,getAddressPage,addToCart,getCartPage,getCheckoutPage,checkOut,changeQuantity};
