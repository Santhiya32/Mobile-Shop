import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/admin");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={styles.container}
    >
      <motion.button
        onClick={handleBackToDashboard}
        style={styles.backButton}
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 6px 15px rgba(0, 123, 255, 0.4)",
          background: "linear-gradient(to right, #1a88ff, #0069d9)"
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        Back to Dashboard
      </motion.button>

      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Order List
      </motion.h1>

      <div style={styles.orderGrid}>
        {orders.map((order, index) => (
          <motion.div
            key={order._id}
            style={styles.orderCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
              borderColor: "rgba(187, 225, 250, 0.25)"
            }}
          >
            <h3>Order ID: {order.orderId}</h3>
            <p>Transaction ID: {order.transactionId}</p>
            <p>Customer: {order.user ? order.user.name : order.customerName}</p>
            <p>Phone: {order.phoneNumber}</p>
            <p>Email: {order.email}</p>
            <p>Address: {order.address}</p>
            <p>Subtotal: ₹{order.subtotal}</p>
            <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
            <div>
              <h4>Products:</h4>
              {order.orderCart.map((product) => (
                <motion.div
                  key={product._id}
                  style={styles.productItem}
                  whileHover={{ 
                    backgroundColor: "rgba(40, 40, 40, 0.8)",
                    borderLeftColor: "rgba(187, 225, 250, 0.7)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    style={styles.productImage}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  <p>{product.name} - ₹{product.price} (Qty: {product.quantity})</p>
                  <p>{product.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "50px",
    background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)", // Matching your previous codes
    color: "#e3e3e3",
    minHeight: "100vh",
  },
  backButton: {
    padding: "10px 20px",
    fontSize: "18px",
    background: "linear-gradient(to right, #007bff, #0056b3)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "20px",
    boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    fontWeight: "500",
  },
  orderGrid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
  },
  orderCard: {
    border: "1px solid rgba(187, 225, 250, 0.15)",
    borderRadius: "12px",
    padding: "25px",
    margin: "10px",
    width: "300px",
    backgroundColor: "rgba(66, 66, 66, 0.7)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  productItem: {
    marginBottom: "16px",
    textAlign: "left",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "rgba(40, 40, 40, 0.6)",
    borderLeft: "3px solid rgba(187, 225, 250, 0.5)",
    transition: "all 0.2s ease",
  },
  productImage: {
    width: "100%",
    height: "auto",
    borderRadius: "10px",
    marginBottom: "15px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.3s ease",
  },
};

export default OrderList;