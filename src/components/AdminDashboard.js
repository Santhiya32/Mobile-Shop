import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion"; // Import Framer Motion

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    brand: "",
    discountPercentage: 0,
    image: null,
  });
  const [updateProductData, setUpdateProductData] = useState({
    id: "",
    name: "",
    price: "",
    quantity: "",
    description: "",
    brand: "",
    discountPercentage: 0,
    image: null,
  });
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionSearchTerm, setTransactionSearchTerm] = useState("");
  const [updateSearchTerm, setUpdateSearchTerm] = useState("");
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const productsPerPage = 4;
  const transactionsPerPage = 20;

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  const handleOrderList = () => {
    navigate("/order-list");
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products/transactions", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("quantity", newProduct.quantity);
    formData.append("description", newProduct.description);
    formData.append("brand", newProduct.brand);
    formData.append("discountPercentage", newProduct.discountPercentage);
    if (newProduct.image) {
      formData.append("image", newProduct.image);
    }

    try {
      const response = await axios.post("http://localhost:5000/api/products/add", formData, {
        headers: { Authorization: localStorage.getItem("token"), "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message || "Product added successfully");
      fetchProducts();
      fetchTransactions();
      setNewProduct({
        name: "",
        price: "",
        quantity: "",
        description: "",
        brand: "",
        discountPercentage: 0,
        image: null,
      });
    } catch (error) {
      console.error("Error adding product", error);
      alert("Failed to add product. Please try again.");
    }
  };

  const handleSellProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/products/sell",
        { productId: updateProductData.id, quantitySold: updateProductData.quantity },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      if (response.status === 200) {
        alert("Product sold successfully!");
        setUpdateProductData({
          id: "",
          name: "",
          price: "",
          quantity: "",
          description: "",
          brand: "",
          discountPercentage: 0,
          image: null,
        });
        fetchProducts();
        fetchTransactions();
      } else {
        alert("Failed to sell product. Please try again.");
      }
    } catch (error) {
      console.error("Error selling product:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleUpdateProductChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setUpdateProductData({ ...updateProductData, image: files[0] });
    } else {
      setUpdateProductData({ ...updateProductData, [name]: value });
    }
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", updateProductData.name);
    formData.append("price", updateProductData.price);
    formData.append("quantity", updateProductData.quantity);
    formData.append("description", updateProductData.description);
    formData.append("brand", updateProductData.brand);
    formData.append("discountPercentage", updateProductData.discountPercentage);
    if (updateProductData.image) {
      formData.append("image", updateProductData.image);
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/products/update/${updateProductData.id}`,
        formData,
        {
          headers: { Authorization: localStorage.getItem("token"), "Content-Type": "multipart/form-data" },
        }
      );
      alert(response.data.message || "Product updated successfully");
      setShowUpdateForm(false);
      fetchProducts();
      fetchTransactions();
      setUpdateProductData({
        id: "",
        name: "",
        price: "",
        quantity: "",
        description: "",
        brand: "",
        discountPercentage: 0,
        image: null,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.product.name.toLowerCase().includes(transactionSearchTerm.toLowerCase())
  );

  const filteredUpdateProducts = products.filter((product) =>
    product.name.toLowerCase().includes(updateSearchTerm.toLowerCase())
  );

  // Pagination logic for products
  const indexOfLastProduct = currentProductPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginateProducts = (pageNumber) => setCurrentProductPage(pageNumber);

  // Pagination logic for transactions
  const indexOfLastTransaction = currentTransactionPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const paginateTransactions = (pageNumber) => setCurrentTransactionPage(pageNumber);

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button
        onClick={handleOrderList}
        style={styles.orderListButton}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Order List
      </motion.button>
      <motion.button
        onClick={handleLogout}
        style={styles.logoutButton}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Logout
      </motion.button>
      <motion.h1
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Admin Dashboard
      </motion.h1>
      <motion.p
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Manage stock, track transactions, and oversee staff activity.
      </motion.p>

      <motion.div
        style={styles.cardContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div
          style={styles.card}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2>Add Product</h2>
          <form onSubmit={handleAddProduct} style={styles.form}>
            <motion.input
              type="text"
              placeholder="Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
              style={styles.input}
              whileFocus={{ borderColor: "#BBE1FA" }}
            />
            <motion.input
              type="number"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
              style={styles.input}
              whileFocus={{ borderColor: "#BBE1FA" }}
            />
            <motion.input
              type="number"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
              required
              style={styles.input}
              whileFocus={{ borderColor: "#BBE1FA" }}
            />
            <motion.textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              required
              style={styles.input}
              whileFocus={{ borderColor: "#BBE1FA" }}
            />
            <motion.input
              type="text"
              placeholder="Brand"
              value={newProduct.brand}
              onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
              required
              style={styles.input}
              whileFocus={{ borderColor: "#BBE1FA" }}
            />
            <motion.input
              type="number"
              placeholder="Discount Percentage"
              value={newProduct.discountPercentage}
              onChange={(e) => setNewProduct({ ...newProduct, discountPercentage: e.target.value })}
              style={styles.input}
              whileFocus={{ borderColor: "#BBE1FA" }}
            />
            <motion.input
              type="file"
              name="image"
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
              style={styles.input}
            />
            <motion.button
              type="submit"
              style={styles.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Product
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          style={styles.card}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2>Update Product</h2>
          <motion.button
            onClick={() => setShowUpdateForm(true)}
            style={styles.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Update Product
          </motion.button>
          {showUpdateForm && (
            <motion.form
              onSubmit={handleUpdateProductSubmit}
              style={styles.form}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.select
                value={updateProductData.id}
                onChange={(e) => {
                  const selectedProduct = products.find((product) => product._id === e.target.value);
                  setUpdateProductData({
                    id: selectedProduct._id,
                    name: selectedProduct.name,
                    price: selectedProduct.price,
                    quantity: selectedProduct.quantity,
                    description: selectedProduct.description,
                    brand: selectedProduct.brand,
                    discountPercentage: selectedProduct.discountPercentage,
                    image: null,
                  });
                }}
                required
                style={styles.input}
                whileFocus={{ borderColor: "#BBE1FA" }}
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - ${product.price} - {product.quantity} in stock
                  </option>
                ))}
              </motion.select>
              <motion.input
                type="text"
                placeholder="Search Product"
                value={updateSearchTerm}
                onChange={(e) => setUpdateSearchTerm(e.target.value)}
                style={styles.searchInput}
                whileFocus={{ borderColor: "#BBE1FA" }}
              />
              <motion.div style={styles.updateProductList}>
                {filteredUpdateProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    style={styles.updateProductItem}
                    onClick={() =>
                      setUpdateProductData({
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        quantity: product.quantity,
                        description: product.description,
                        brand: product.brand,
                        discountPercentage: product.discountPercentage,
                        image: null,
                      })
                    }
                    whileHover={{ backgroundColor: "rgba(187, 225, 250, 0.1)" }}
                  >
                    {product.name} - ${product.price} - {product.quantity} in stock
                  </motion.div>
                ))}
              </motion.div>
              <motion.input
                type="text"
                name="name"
                placeholder="Product Name"
                value={updateProductData.name}
                onChange={handleUpdateProductChange}
                style={styles.input}
                whileFocus={{ borderColor: "#BBE1FA" }}
              />
              <motion.input
                type="number"
                name="price"
                placeholder="Product Price"
                value={updateProductData.price}
                onChange={handleUpdateProductChange}
                style={styles.input}
                whileFocus={{ borderColor: "#BBE1FA" }}
              />
              <motion.input
                type="number"
                name="quantity"
                placeholder="Product Quantity"
                value={updateProductData.quantity}
                onChange={handleUpdateProductChange}
                style={styles.input}
                whileFocus={{ borderColor: "#BBE1FA" }}
              />
              <motion.textarea
                name="description"
                placeholder="Product Description"
                value={updateProductData.description}
                onChange={handleUpdateProductChange}
                style={styles.input}
                whileFocus={{ borderColor: "#BBE1FA" }}
              />
              <motion.input
                type="text"
                name="brand"
                placeholder="Brand"
                value={updateProductData.brand}
                onChange={handleUpdateProductChange}
                style={styles.input}
                whileFocus={{ borderColor: "#BBE1FA" }}
              />
              <motion.input
                type="number"
                name="discountPercentage"
                placeholder="Discount Percentage"
                value={updateProductData.discountPercentage}
                onChange={handleUpdateProductChange}
                style={styles.input}
                whileFocus={{ borderColor: "#BBE1FA" }}
              />
              <motion.input
                type="file"
                name="image"
                onChange={handleUpdateProductChange}
                style={styles.input}
              />
              <motion.button
                type="submit"
                style={styles.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Update Product
              </motion.button>
            </motion.form>
          )}
        </motion.div>

        <motion.div
          style={styles.card}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2>Sell Product</h2>
          <form onSubmit={handleSellProduct} style={styles.form}>
            <motion.select
              value={updateProductData.id}
              onChange={(e) => setUpdateProductData({ ...updateProductData, id: e.target.value })}
              required
              style={styles.input}
              whileFocus={{ borderColor: "#BBE1FA" }}
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} - ${product.price} - {product.quantity} in stock
                </option>
              ))}
            </motion.select>
            <motion.input
              type="number"
              placeholder="Quantity"
              value={updateProductData.quantity}
              onChange={(e) => setUpdateProductData({ ...updateProductData, quantity: e.target.value })}
              required
              style={styles.input}
              whileFocus={{ borderColor: "#BBE1FA" }}
            />
            <motion.button
              type="submit"
              style={styles.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sell Product
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        Products
      </motion.h2>
      <motion.input
        type="text"
        placeholder="Search Products"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
        whileFocus={{ borderColor: "#BBE1FA" }}
      />
      <motion.div
        style={styles.productGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {currentProducts.map((product) => (
          <motion.div
            key={product._id}
            style={styles.productCard}
            whileHover={{ scale: 1.05, boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {product.image && <img src={product.image} alt={product.name} style={styles.productImage} />}
            <div style={styles.productDetails}>
              <p>{product.name}</p>
              <p>${product.price}</p>
              <p>{product.quantity} in stock</p>
              <p>{product.description}</p>
              <p>Brand: {product.brand}</p>
              <p>Discount: {product.discountPercentage}%</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        style={styles.pagination}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, i) => (
          <motion.button
            key={i + 1}
            onClick={() => paginateProducts(i + 1)}
            style={styles.pageButton}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {i + 1}
          </motion.button>
        ))}
      </motion.div>

      <motion.h2
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        Transactions
      </motion.h2>
      <motion.input
        type="text"
        placeholder="Search Transactions"
        value={transactionSearchTerm}
        onChange={(e) => setTransactionSearchTerm(e.target.value)}
        style={styles.searchInput}
        whileFocus={{ borderColor: "#BBE1FA" }}
      />
      <motion.div
        style={styles.transactionList}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        {currentTransactions.map((transaction) => (
          <motion.div
            key={transaction._id}
            style={styles.transactionCard}
            whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {transaction.product.image && (
              <img src={transaction.product.image} alt={transaction.product.name} style={styles.transactionImage} />
            )}
            <div style={styles.transactionDetails}>
              <p>{transaction.product.name}</p>
              <p>✅ {transaction.action === "add" ? "Added" : transaction.action === "update" ? "Updated" : "Sold"}: {transaction.quantitySold}</p>
              <p>By: {transaction.staffName} ({transaction.staffRole})</p>
              <p>Date: {new Date(transaction.date).toLocaleString()}</p>
              {transaction.action === "update" && (
                <div>
                  <p><strong>Old Details:</strong> {transaction.oldProductDetails.name} - ${transaction.oldProductDetails.price} - {transaction.oldProductDetails.quantity} in stock</p>
                  <p><strong>New Details:</strong> {transaction.newProductDetails.name} - ${transaction.newProductDetails.price} - {transaction.newProductDetails.quantity} in stock</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        style={styles.pagination}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        {Array.from({ length: Math.ceil(filteredTransactions.length / transactionsPerPage) }, (_, i) => (
          <motion.button
            key={i + 1}
            onClick={() => paginateTransactions(i + 1)}
            style={styles.pageButton}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {i + 1}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

const styles = {
  container: { 
    textAlign: "center", 
    padding: "50px", 
    position: "relative", 
    backgroundColor: "#1A1A2E",
    background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
    color: "#BBE1FA",
    minHeight: "100vh",
    margin: 0,
    boxSizing: "border-box"
  },
  orderListButton: { 
    position: "absolute", 
    top: "20px", 
    left: "20px", 
    padding: "10px 20px", 
    fontSize: "18px", 
    backgroundColor: "#28a745", 
    background: "linear-gradient(135deg, #28a745, #1e7e34)",
    color: "white", 
    border: "1px solid rgba(187, 225, 250, 0.2)", 
    cursor: "pointer",
    borderRadius: "6px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease"
  },
  logoutButton: { 
    position: "absolute", 
    top: "20px", 
    right: "20px", 
    padding: "10px 20px", 
    fontSize: "18px", 
    backgroundColor: "#007bff", 
    background: "linear-gradient(135deg, #007bff 0%, #0F3460 100%)",
    color: "white", 
    border: "1px solid rgba(187, 225, 250, 0.2)", 
    cursor: "pointer",
    borderRadius: "6px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease"
  },
  cardContainer: { 
    display: "flex", 
    justifyContent: "space-around", 
    flexWrap: "wrap" 
  },
  card: { 
    border: "1px solid rgba(187, 225, 250, 0.1)", 
    borderRadius: "12px", 
    padding: "25px", 
    margin: "15px", 
    width: "300px", 
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)", 
    background: "rgba(22, 33, 62, 0.7)",
    color: "#BBE1FA"
  },
  form: { 
    display: "flex", 
    flexDirection: "column" 
  },
  input: { 
    marginBottom: "15px", 
    padding: "12px 16px", 
    fontSize: "16px", 
    backgroundColor: "rgba(15, 52, 96, 0.5)",
    color: "#BBE1FA",
    border: "1px solid rgba(187, 225, 250, 0.2)",
    borderRadius: "6px",
    transition: "all 0.3s ease"
  },
  button: { 
    padding: "12px 24px", 
    fontSize: "18px", 
    backgroundColor: "#007bff", 
    background: "linear-gradient(135deg, #007bff 0%, #0F3460 100%)",
    color: "white", 
    border: "1px solid rgba(187, 225, 250, 0.4)", 
    cursor: "pointer",
    borderRadius: "6px",
    margin: "10px 0",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
  },
  searchInput: { 
    marginBottom: "20px", 
    padding: "12px 16px", 
    fontSize: "16px", 
    width: "300px", 
    backgroundColor: "rgba(15, 52, 96, 0.5)",
    color: "#BBE1FA",
    border: "1px solid rgba(187, 225, 250, 0.2)",
    borderRadius: "6px",
    transition: "all 0.3s ease"
  },
  productGrid: { 
    display: "flex", 
    flexWrap: "wrap", 
    justifyContent: "center" 
  },
  productCard: { 
    border: "1px solid rgba(187, 225, 250, 0.1)", 
    borderRadius: "12px", 
    padding: "20px", 
    margin: "15px", 
    width: "200px", 
    textAlign: "center", 
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)", 
    background: "rgba(22, 33, 62, 0.7)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease"
  },
  productImage: { 
    width: "100%", 
    height: "auto", 
    marginBottom: "15px",
    borderRadius: "8px"
  },
  productDetails: { 
    textAlign: "center", 
    color: "#BBE1FA" 
  },
  transactionList: { 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center" 
  },
  transactionCard: { 
    display: "flex", 
    alignItems: "center", 
    border: "1px solid rgba(187, 225, 250, 0.1)", 
    borderRadius: "12px", 
    padding: "15px", 
    margin: "12px", 
    width: "80%", 
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)", 
    background: "rgba(15, 52, 96, 0.5)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease"
  },
  transactionImage: { 
    width: "60px", 
    height: "60px", 
    objectFit: "cover", 
    marginRight: "15px",
    borderRadius: "8px",
    border: "1px solid rgba(187, 225, 250, 0.2)"
  },
  transactionDetails: { 
    display: "flex", 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    width: "100%", 
    color: "#BBE1FA" 
  },
  updateProductList: { 
    maxHeight: "150px", 
    overflowY: "auto", 
    background: "rgba(22, 33, 62, 0.7)", 
    borderRadius: "8px", 
    marginBottom: "15px",
    border: "1px solid rgba(187, 225, 250, 0.1)",
    padding: "5px"
  },
  updateProductItem: { 
    padding: "12px", 
    cursor: "pointer", 
    color: "#BBE1FA",
    borderRadius: "4px",
    transition: "background-color 0.2s ease",
    margin: "2px 0"
  },
  pagination: { 
    display: "flex", 
    justifyContent: "center", 
    marginTop: "30px" 
  },
  pageButton: { 
    padding: "10px 15px", 
    margin: "0 5px", 
    backgroundColor: "#0F3460", 
    color: "white", 
    border: "1px solid rgba(187, 225, 250, 0.2)",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease"
  }
};

export default AdminDashboard;