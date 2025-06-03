const Order = require("../model/Order");

// Create a new order (existing function)
const createOrder = async (req, res) => {
  const { orderId, transactionId, customerName, phoneNumber, email, address, subtotal, orderCart } = req.body;

  try {
    const newOrder = new Order({
      orderId,
      transactionId,
      customerName,
      phoneNumber,
      email,
      address,
      subtotal,
      orderCart,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch all orders (new function for viewing orders)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

module.exports = {
  createOrder,
  getOrders,
};