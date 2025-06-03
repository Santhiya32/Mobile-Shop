const jwt = require("jsonwebtoken");
require('dotenv').config();  // Load environment variables from .env file

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    // Use JWT_SECRET from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded;
    req.user.name = decoded.name; // Include the user's name
    req.user.role = decoded.role; // Include the user's role
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = authMiddleware;
