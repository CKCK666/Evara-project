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
    strStatus: String,
    createdDate: { type: Date, default: Date.now },
    updatedDate: Date,
    intQuantity: Number
});

const cartSchema = new Schema({
    pkCartId: Schema.Types.ObjectId,
    pkUserId: Schema.Types.ObjectId,
    arrProducts: [productSchema]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;