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
        ref: "Category",
        required: true,
    },
    intPrice: {
        type: Number,
        required: true
    },
    intStock: {
        type: Number,
        required: true
    },
 
    arrayOtherImages:{
        type: Array,
        required: true,
      },
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
    },
    offer:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'offer'
    },
    offerPrice:{
        type:Number,
    
    },
    
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
