const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    pkProductId: Schema.Types.ObjectId,
    strProductName: String,
    strDescription: String,
    fkcategoryId: Schema.Types.ObjectId,
    intPrice: Number,
    intStock: Number,
    mainProductUrl: String,
    arrayOtherImages: [
        {
            imageUrl1: String,
            imageUrl2: String
        }
    ],
    
    
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