// routes/authRoutes.js

const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController"); // Import from userController
const { check } = require("express-validator");

const router = express.Router();

// Register Route
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  registerUser
);

// Login Route
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  loginUser
);

// Forgot Password Route
router.post(
  "/forgot-password",
  [check("email", "Please include a valid email").isEmail()],
  forgotPassword
);

// Reset Password Route
router.post(
  "/reset-password",
  [
    check("token", "Token is required").not().isEmpty(),
    check("newPassword", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  resetPassword
);

module.exports = router;
