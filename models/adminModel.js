const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    pkUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default:null
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    strEmail: {
        type: String,
        required: true,
        unique: true
    },
    strPassword: {
        type: String,
        required: true
    },
    strProfileImg: {
        type: String,
        default:null
    },
    strStatus: {
        type: String,
        enum: ['Active','Blocked','Pending'],
        default: 'Active'
    },
    strUserName: {
        type: String,
        required: true
    }
});

const Admin = mongoose.model('Admin', userSchema);

module.exports = Admin;

