const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantitySold: { type: Number, required: true },
  staffName: { type: String, required: true },
  staffRole: { type: String, required: true }, // Include the user's role
  action: { type: String, required: true },
  oldProductDetails: {
    name: String,
    price: Number,
    quantity: Number,
  },
  newProductDetails: {
    name: String,
    price: Number,
    quantity: Number,
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TransactionSchema);