const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    pkProductId: Schema.Types.ObjectId,
    strProductName: String,
    strDescription: String,
    fkcategoryId: Schema.Types.ObjectId,
    intPrice: Number,
    intStock: Number,
    strStatus: {
        type: String,
        enum: ['Active','Deleted'],
        default: 'Active'
    },
 
    arrayOtherImages:Array,
    offer:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'offer'
    },
    offerPrice:{
        type:Number,
    
    },
    
    intQuantity: { type:Number, default: 1 }
});

const cartSchema = new Schema({
    pkCartId: Schema.Types.ObjectId,
    pkUserId: Schema.Types.ObjectId,
    arrProducts: [productSchema],
    strStatus: {
        type: String,
        enum: ['Active','Deleted'],
        default: 'Active'
    },
    total_cart_price:Number,
    createdDate: { type: Date, default: Date.now },
    updatedDate:  { type: Date, default: null},
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;