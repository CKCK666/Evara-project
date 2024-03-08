const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    pkProductId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    strProductName: {
        type: String,
        required: true
    },
    strDescription: {
        type: String,
        required: true
    },
    fkcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    intPrice: {
        type: Number,
        required: true
    },
    intStock: {
        type: Number,
        required: true
    },
    mainProductUrl: {
        type: String,
        required: true
    },
    arrayOtherImages: [{
        imageUrl1: String,
        imageUrl2: String
    }],
    strStatus: {
        type: String,
        enum: ['Active', 'Blocked','Deleted'], // Assuming only two possible values
        default: 'Active'
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: null
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
