const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  description : {
    type: String,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  user: {
    type: Array,
    ref: 'User',
  },
  startDate: {
    type: Date,
    required: true,
  },
  expireDate: {
    type: Date,
    required: true,
  },
  minimumSpend: {
    type: Number, 
    required: true,
  },
  status: {
    type: String,
    enum: ['Active','Blocked'],
    default: 'Active'
},
});

module.exports = mongoose.model('Coupon', couponSchema);