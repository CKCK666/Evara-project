const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const OrderSchema = new Schema({
    pkOrderId: { type: Schema.Types.ObjectId },
    pkUserId: { type: Schema.Types.ObjectId },
    pkCartId:{ type: Schema.Types.ObjectId },
    arrProductsDetails:Array,
    arrDeliveryAddress: Array,
    intTotalOrderPrice: Number,
    strPaymentStatus: {
        type: String,
        enum: ['Success','Failed',"Pending"],
       
    },
    strPaymentMethod:{
        type: String,
        enum: ["RAZORPAY","COD","WALLET"],
    },
    strOrderStatus: {
        type: String,
        enum: ['Processing','Confirmed','Shipped','Delivered','Cancelled',"Pending","Returned","Return Requested"],
        default: 'Active'
    },
    strStatus: {
        type: String,
        enum: ['Active','Deleted'],
        default: 'Active'
    },
    gst:Number,
    totalAmountAfterDiscount : {type:Number},
  walletCashUsed : {type:Number,default:0},
  couponDiscount : {type:Number,default:0},
  totalDiscount : {type:Number,default:0},
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default:null }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;