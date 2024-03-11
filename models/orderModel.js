const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const OrderSchema = new Schema({
    pkOrderId: { type: Schema.Types.ObjectId },
    pkUserId: { type: Schema.Types.ObjectId },
    arrProductsDetails:Array,
    arrDeliveryAddress: Array,
    intTotalOrderPrice: Number,
    strPaymentStatus: String,
    strPaymentMethod: String,
    strOrderStatus: {
        type: String,
        enum: ['Processing','Confirmed','Shipped','Delivered','Cancelled'],
        default: 'Active'
    },
    strStatus: {
        type: String,
        enum: ['Active','Deleted'],
        default: 'Active'
    },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default:null }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;