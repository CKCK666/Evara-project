const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  name: { type: String, required: true,unique:true },
  description: { type: String },
  discount: { type: Number, required: true,min : 1,max : 100 },
  minAmount: { type: Number, required: true,min : 1 },
  maxDiscount: { type: Number,min : 1 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  products: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
  categories: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  status : {
    type : Boolean, 
    default : true
},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Offer= mongoose.model("Offer", offerSchema);

module.exports = Offer