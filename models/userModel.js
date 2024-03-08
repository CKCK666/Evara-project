const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    pkUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    strUserName: {
        type: String,
        required: true
    },
    strEmail: {
        type: String,
        unique: true,
        required: true
    },
    strPassword: {
        type: String,
        required: true
    },
    strProfileImg: {
        type: String,
        default: null
    },
    strPhoneNumber: {
        type: String,
        required:true
    },
    strStatus: {
        type: String,
        enum: ['Active', 'Blocked', 'Pending','Deleted'],
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

const User = mongoose.model('User', userSchema);

module.exports = User;
