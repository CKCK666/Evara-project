const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductDetailsSchema = new Schema({
    pkProductId: { type: Schema.Types.ObjectId },
    strProductName: String,
    strDescription: String,
    fkcategoryId: { type: Schema.Types.ObjectId, default: null },
    intPrice: Number,
    intStock: Number,
    mainProductUrl: String,
    arrayOtherImages: [{
        imageUrl: String,
        imageUrl2:String,
    }],
    strStatus: { type: String },
    createdDate: { type: Date},
    updatedDate: { type: Date },
    intQuantity: Number
});

const DeliveryAddressSchema = new Schema({
    pkUserId: { type: Schema.Types.ObjectId },
    pkAddressId: { type: Schema.Types.ObjectId },
    strFullName: String,
    strPhoneNo: String,
    strArea: String,
    intPinCode: String,
    strCity: String,
    strState: String,
    isDefaultAddress: Boolean
});

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