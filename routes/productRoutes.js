const express = require("express");
const { addProduct, updateProduct, sellProduct } = require("../controllers/productController");
const { check } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const Product = require("../model/Product");
const Transaction = require("../model/Transaction");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Add Product (Admin only)
router.post(
  "/add",
  authMiddleware,
  upload.single('image'),
  [
    check("name", "Product name is required").not().isEmpty(),
    check("price", "Price must be a number").isNumeric(),
    check("quantity", "Quantity must be a number").isNumeric(),
    check("brand", "Brand is required").not().isEmpty(),
    check("discountPercentage", "Discount percentage must be a number").isNumeric(),
  ],
  addProduct
);

// Get All Products (Accessible by both admin and staff)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});


// Endpoint to get unique product names
router.get("/brands", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({});
    const productNames = [...new Set(products.map(product => product.name))];
    res.json(productNames);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product names', error });
  }
});


// Update Product (Admin only)
router.put(
  "/update/:id",
  authMiddleware,
  upload.single('image'),
  [
    check("price", "Price must be a number").isNumeric().optional(),
    check("quantity", "Quantity must be a number").isNumeric().optional(),
    check("brand", "Brand is required").not().isEmpty().optional(),
    check("discountPercentage", "Discount percentage must be a number").isNumeric().optional(),
  ],
  updateProduct
);

// Delete Product (Admin only)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied" });

  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Sell Product (Staff only)
router.post(
  "/sell",
  authMiddleware,
  [
    check("productId", "Product ID is required").not().isEmpty(),
    check("quantitySold", "Quantity must be a number").isNumeric(),
  ],
  sellProduct
);

// Get All Transactions (Admin only)
router.get("/transactions", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied" });

  try {
    const transactions = await Transaction.find().populate("product");
    res.json(transactions);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});


router.get("/brands", authMiddleware, async (req, res) => {
  try {
    const brands = await Product.distinct("brand"); // Fetch all unique brands
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brands', error });
  }
});


router.get("/brand/:brandName", authMiddleware, async (req, res) => {
  const { brandName } = req.params;
  try {
    const mobiles = await Product.find({ brand: brandName }); // Fetch mobiles by brand
    res.json(mobiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mobiles', error });
  }
});

router.get('/list', (req, res) => {
  res.sendFile('/c:/PROJECTS/PORT/frontend/productList.html');
});

router.put("/:id", authMiddleware, updateProduct);

module.exports = router;