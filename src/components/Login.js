import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.data && response.data.token) {
        localStorage.clear();

        const { token, role, name } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        if (name) localStorage.setItem("userName", name);

        setTimeout(() => {
          switch (role) {
            case "user":
              window.location.href = "/user";
              break;
            case "admin":
              window.location.href = "/admin";
              break;
            case "staff":
              window.location.href = "/staff";
              break;
            default:
              window.location.href = "/";
              break;
          }
        }, 100);
      } else {
        setError("Invalid response from server");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.msg ||
          "Login failed. Please check your credentials and try again."
      );
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={styles.container}
    >
      <motion.h2
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={styles.title}
      >
        Login
      </motion.h2>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.error}
        >
          {error}
        </motion.p>
      )}

      <motion.form
        onSubmit={handleLogin}
        style={styles.form}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <motion.input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
          autoComplete="on"
          whileFocus={{
            scale: 1.02,
            borderColor: "rgba(187, 225, 250, 0.5)",
            boxShadow: "0 0 8px rgba(187, 225, 250, 0.2)",
          }}
          transition={{ duration: 0.2 }}
        />

        <motion.input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="off"
          style={styles.input}
          whileFocus={{
            scale: 1.02,
            borderColor: "rgba(187, 225, 250, 0.5)",
            boxShadow: "0 0 8px rgba(187, 225, 250, 0.2)",
          }}
          transition={{ duration: 0.2 }}
        />

        <motion.button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          whileHover={{
            scale: loading ? 1 : 1.05,
            boxShadow: loading
              ? "0 4px 8px rgba(0, 0, 0, 0.2)"
              : "0 6px 12px rgba(0, 0, 0, 0.3)",
            background: loading
              ? undefined
              : "linear-gradient(135deg, #1a88ff 0%, #1a4478 100%)",
          }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        <motion.div
          style={styles.forgotPasswordContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/forgot-password" style={styles.forgotPassword}>
            Forgot Password?
          </Link>
        </motion.div>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        style={styles.link}
      >
        If you don't have an account,{" "}
        <Link
          to="/register"
          style={{ color: "#4dabf7", textDecoration: "none" }}
        >
          Register
        </Link>
      </motion.p>
    </motion.div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "0",
    paddingTop: "50px",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    color: "#BBE1FA",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)", // Original background restored
    margin: "0",
    boxSizing: "border-box",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "320px",
    margin: "auto",
    background: "rgba(22, 33, 62, 0.85)",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
    border: "1px solid rgba(187, 225, 250, 0.15)",
    backdropFilter: "blur(8px)",
  },
  input: {
    marginBottom: "20px",
    padding: "14px 18px",
    fontSize: "16px",
    backgroundColor: "rgba(15, 52, 96, 0.6)",
    color: "#BBE1FA",
    border: "1px solid rgba(187, 225, 250, 0.25)",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
  },
  button: {
    padding: "14px 24px",
    fontSize: "16px",
    background: "linear-gradient(135deg, #007bff 0%, #0F3460 100%)",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "14px",
    marginTop: "5px",
    marginBottom: "15px",
    fontWeight: "500",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    background: "rgba(255, 107, 107, 0.1)",
    padding: "8px 12px",
    borderRadius: "6px",
    maxWidth: "300px",
    margin: "0 auto 15px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "600",
    color: "#E2E2E2",
    marginBottom: "30px",
    textShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
  },
  link: {
    marginTop: "25px",
    color: "#BBE1FA",
    fontSize: "14px",
  },
  forgotPasswordContainer: {
    marginTop: "15px",
    textAlign: "right",
    width: "100%",
  },
  forgotPassword: {
    color: "#4dabf7",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.3s ease",
    "&:hover": {
      color: "#BBE1FA",
    },
  },
};

export default Login;
