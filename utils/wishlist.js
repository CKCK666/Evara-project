const Wishlist=require("../models/wishListModel")
const { ObjectId } = require('mongodb');



const getWishListCount=async(userId)=>{
    try {
        let wishListCount=0
        let pkUserId=new ObjectId(userId)
        let wishlist=  await Wishlist.aggregate([{$match:{pkUserId,strStatus:"Active"}}, {
            $project: {
                _id: 1,
                itemCount: { $size: "$arrProducts" }
            }
        }])
        if(wishlist.length){
          wishListCount=wishlist[0].itemCount
          return wishListCount
        }
         return wishListCount
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    getWishListCount
}