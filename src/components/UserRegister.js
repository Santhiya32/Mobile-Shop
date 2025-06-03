import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const UserRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        role: "user",
      });
      setSuccess("Registered successfully! Please login.");
      setError(""); // Clear any existing errors
      // Navigate to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(
        error.response?.data?.msg || "Registration failed. Please try again."
      );
      setSuccess(""); // Clear any existing success message
      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
      >
        Register
      </motion.h1>
      {error && (
        <motion.div
          style={styles.error}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          style={styles.success}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {success}
        </motion.div>
      )}
      <motion.form
        onSubmit={handleRegister}
        style={styles.form}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={styles.input}
          whileFocus={{ scale: 1.02, borderColor: "#BBE1FA" }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <motion.input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
          whileFocus={{ scale: 1.02, borderColor: "#BBE1FA" }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <motion.input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
          whileFocus={{ scale: 1.02, borderColor: "#BBE1FA" }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <motion.button
          type="submit"
          style={styles.button}
          whileHover={{
            scale: 1.05,
            background: "linear-gradient(135deg, #34c759, #28a745)",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Register
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "50px",
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
    color: "#BBE1FA",
    minHeight: "100vh",
    margin: "0",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  error: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    color: "#ff6b6b",
    padding: "10px 20px",
    borderRadius: "5px",
    marginBottom: "20px",
    border: "1px solid rgba(255, 0, 0, 0.2)",
    maxWidth: "400px",
    margin: "0 auto 20px auto",
  },
  success: {
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    color: "#28a745",
    padding: "10px 20px",
    borderRadius: "5px",
    marginBottom: "20px",
    border: "1px solid rgba(40, 167, 69, 0.2)",
    maxWidth: "400px",
    margin: "0 auto 20px auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(22, 33, 62, 0.7)",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(187, 225, 250, 0.1)",
    maxWidth: "400px",
    margin: "0 auto",
    backdropFilter: "blur(4px)",
  },
  input: {
    padding: "12px 16px",
    margin: "10px",
    fontSize: "16px",
    width: "250px",
    backgroundColor: "rgba(15, 52, 96, 0.5)",
    color: "#BBE1FA",
    border: "1px solid rgba(187, 225, 250, 0.2)",
    borderRadius: "6px",
    transition: "all 0.3s ease",
    outline: "none",
  },
  button: {
    padding: "12px 24px",
    fontSize: "18px",
    background: "linear-gradient(135deg, #28a745, #1e7e34)",
    color: "white",
    border: "1px solid rgba(187, 225, 250, 0.2)",
    cursor: "pointer",
    borderRadius: "6px",
    marginTop: "15px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
};

export default UserRegister;
