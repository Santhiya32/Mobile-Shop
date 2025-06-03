const Product = require("../model/Product");
const Transaction = require("../model/Transaction");
const cloudinary = require("../cloudinaryConfig");

// ...existing code...

const sellProduct = async (req, res) => {
  const { productId, quantitySold } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (product.quantity < quantitySold) return res.status(400).json({ msg: "Not enough stock" });

    product.quantity -= quantitySold;
    await product.save();

    // Log transaction
    const transaction = new Transaction({
      product: product._id,
      quantitySold,
      staffName: req.user.name, // Use the user's name from the request object
      staffRole: req.user.role, // Include the user's role
      action: "sell"
    });
    await transaction.save();

    res.json({ msg: `Product sold successfully by ${req.user.name} (${req.user.role})`, product });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ...existing code...

const addProduct = async (req, res) => {
  try {
    const { name, price, description, quantity, brand, discountPercentage } = req.body;
    let image = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      image = result.secure_url;
    }

    const newProduct = new Product({
      name,
      price,
      description,
      image,
      quantity,
      brand,
      discountPercentage,
    });

    await newProduct.save();

    // Log transaction
    const transaction = new Transaction({
      product: newProduct._id,
      quantitySold: quantity,
      staffName: req.user.name,
      staffRole: req.user.role,
      action: "add",
    });
    await transaction.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Failed to add product. Please try again.' });
  }
};

// ...existing code...

const updateProduct = async (req, res) => {
  const { name, price, quantity, description, brand, discountPercentage } = req.body;
  let image = '';

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path);
    image = result.secure_url;
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    const oldProductDetails = { name: product.name, price: product.price, quantity: product.quantity };

    if (name) product.name = name;
    if (price) product.price = price;
    if (quantity) product.quantity = quantity;
    if (description) product.description = description;
    if (image) product.image = image;
    if (brand) product.brand = brand;
    if (discountPercentage) product.discountPercentage = discountPercentage;

    await product.save();

    const transaction = new Transaction({
      product: product._id,
      quantitySold: 0,
      oldProductDetails,
      newProductDetails: { name: product.name, price: product.price, quantity: product.quantity },
      staffName: req.user.name,
      staffRole: req.user.role,
      action: "update",
    });
    await transaction.save();

    res.json({ msg: "Product updated successfully", product });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { addProduct, updateProduct, sellProduct };