const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  brand: {
    type: String,
    required: false, // Make it required
  },
  discountPercentage: {
    type: Number,
    default: 0, // Default discount is 0%
  },
});

module.exports = mongoose.model("Product", productSchema);