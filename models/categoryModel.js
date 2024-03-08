const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    pkCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    strCategoryName: {
        type: String,
        required: true
    },
    strDescription: {
        type:String,
        required:true
    },
    strStatus: {
        type: String,
        enum: ['Active', 'Blocked'],
        default: 'Active'
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default:null
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
