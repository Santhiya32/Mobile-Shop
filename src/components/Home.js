import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={styles.container}
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        📱 Tamizha Mobile Shop
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Welcome
      </motion.p>

      <motion.div 
        style={styles.buttonContainer}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Link to="/login">
          <motion.button
            style={styles.button}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              backgroundColor: "#1a5ba8"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Login
          </motion.button>
        </Link>

        <Link to="/register">
          <motion.button
            style={{ ...styles.button, backgroundColor: "#28a745" }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              backgroundColor: "#34ce57"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            User Register
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "50px",
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)", // Original background restored
    color: "#BBE1FA",
    borderRadius: "8px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)",
    minHeight: "100vh",
    width: "100%",
    margin: 0,
    boxSizing: "border-box",
  },

  buttonContainer: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  button: {
    padding: "14px 28px",
    fontSize: "16px",
    backgroundColor: "#0F3460",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    margin: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    position: "relative",
    overflow: "hidden",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
};

export default Home;