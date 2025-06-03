const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  transactionId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  subtotal: { type: Number, required: true },
  orderCart: { type: Array, required: true },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;