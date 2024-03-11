const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

// Address Schema
const addressSchema = new Schema({
    pkUserId: {
        type: ObjectId,
        required: true
    },
    pkAddressId: {
        type: ObjectId,
        required: true
    },
    strFullName: {
        type: String,
        required: true
    },
    strPhoneNo: {
        type: String,
        required: true
    },
    strArea: String,
    intPinCode: {
        type: String,
        required: true
    },
    strCity: {
        type: String,
        required: true
    },
    strState: {
        type: String,
        required: true
    },
    isDefaultAddress: {
        type: Boolean,
        default: false
    },
    strStatus: {
        type: String,
        enum: ['Active','Deleted'],
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

// Address Model
const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
