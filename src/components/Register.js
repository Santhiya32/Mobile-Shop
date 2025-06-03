import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", { name, email, password, role });
      alert("Registered successfully! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration Failed", error);
    }
  };

  return (
    <motion.div 
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        Register
      </motion.h2>
      <motion.form 
        onSubmit={handleRegister} 
        style={styles.form}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
        <motion.select 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          style={styles.input}
          whileFocus={{ scale: 1.02, borderColor: "#BBE1FA" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </motion.select>
        <motion.button
          type="submit"
          style={styles.button}
          whileHover={{ 
            scale: 1.05,
            background: "linear-gradient(135deg, #0F3460 0%, #007bff 100%)",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Register
        </motion.button>
      </motion.form>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        If you have an account, <Link to="/login" style={styles.link}>Login</Link>
      </motion.p>
    </motion.div>
  );
};

const styles = {
  container: { 
    textAlign: "center", 
    marginTop: "0",
    paddingTop: "50px",
    fontFamily: "Arial, sans-serif",
    color: "#BBE1FA",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
    margin: "0",
    boxSizing: "border-box",
    overflow: "hidden"
  },
  form: { 
    display: "flex", 
    flexDirection: "column", 
    width: "300px", 
    margin: "auto",
    background: "rgba(22, 33, 62, 0.7)",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(187, 225, 250, 0.1)",
    backdropFilter: "blur(4px)"
  },
  input: { 
    marginBottom: "15px", 
    padding: "12px 16px", 
    fontSize: "16px",
    backgroundColor: "rgba(15, 52, 96, 0.5)",
    color: "#BBE1FA",
    border: "1px solid rgba(187, 225, 250, 0.2)",
    borderRadius: "6px",
    transition: "all 0.3s ease",
    outline: "none"
  },
  button: { 
    padding: "12px 24px", 
    fontSize: "18px", 
    background: "linear-gradient(135deg, #007bff 0%, #0F3460 100%)",
    color: "white", 
    border: "1px solid rgba(187, 225, 250, 0.4)", 
    cursor: "pointer",
    borderRadius: "6px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
  },
  link: {
    color: "#BBE1FA",
    textDecoration: "none",
    transition: "color 0.3s ease",
    ":hover": {
      color: "#007bff"
    }
  }
};

export default Register;