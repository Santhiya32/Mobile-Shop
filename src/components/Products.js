import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Slider from "@mui/material/Slider";
import { motion } from "framer-motion";

const Products = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [userDetails, setUserDetails] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRes = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { Authorization: token },
        });
        setUserDetails(userRes.data);

        const ordersRes = await axios.get("http://localhost:5000/api/orders", {
          headers: { Authorization: token },
        });
        setUserOrders(ordersRes.data);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueBrandsMap = new Map();
      products.forEach((product) => {
        if (product.brand) {
          const normalizedBrand = product.brand.trim().toLowerCase();
          const originalBrand = product.brand.trim();
          if (!uniqueBrandsMap.has(normalizedBrand)) {
            uniqueBrandsMap.set(normalizedBrand, originalBrand);
          }
        }
      });
      const uniqueBrands = Array.from(uniqueBrandsMap.values()).sort((a, b) =>
        a.localeCompare(b)
      );
      setBrands(uniqueBrands);
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      const products = response.data;
      setProducts(products);
      const maxProductPrice = Math.max(
        ...products.map((product) => product.price)
      );
      setMaxPrice(maxProductPrice);
      setPriceRange([0, maxProductPrice]);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const handleAddToCart = (product) => {
    if (product.quantity === 0) return;
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);
      if (!existingProduct || existingProduct.quantity === 0) return prevCart;
      if (existingProduct.quantity === 1) {
        return prevCart.filter((item) => item._id !== product._id);
      } else {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
    });
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prevSelectedBrands) =>
      prevSelectedBrands.includes(brand)
        ? prevSelectedBrands.filter((name) => name !== brand)
        : [...prevSelectedBrands, brand]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
    setMinPrice(newValue[0]);
    setMaxPrice(newValue[1]);
  };

  const handleMinPriceChange = (event) => {
    const value = Number(event.target.value);
    if (value >= 0 && value <= maxPrice) {
      setMinPrice(value);
      setPriceRange([value, priceRange[1]]);
    }
  };

  const handleMaxPriceChange = (event) => {
    const value = Number(event.target.value);
    if (value >= minPrice && value <= Math.max(...products.map((p) => p.price))) {
      setMaxPrice(value);
      setPriceRange([priceRange[0], value]);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1]
  );

  const toggleExpand = () => setIsExpanded(!isExpanded);
  const toggleCart = () => navigate("/cart");

  const calculateDiscountAmount = (price, discountPercentage) => {
    return (price * discountPercentage) / 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={styles.container}
    >
      {/* Navbar */}
      <motion.div
        style={styles.navbar}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div style={styles.navLeft}>
          <Link to="/user" style={styles.navLink}>Home</Link>
          <Link to="/products" style={styles.navLink}>Products</Link>
        </div>
        <div style={styles.navCenter}>
          <motion.input
            type="text"
            placeholder="Search products..."
            style={styles.navSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            whileFocus={{ scale: 1.02, borderColor: "#4dabf7" }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <div style={styles.navRight}>
          <motion.button
            onClick={() => setShowProfile(!showProfile)}
            style={styles.profileButton}
            whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(74, 144, 226, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            Profile
          </motion.button>
          <motion.button
            onClick={toggleCart}
            style={styles.cartButton}
            whileHover={{ scale: 1.05, backgroundColor: "#4dabf7" }}
            whileTap={{ scale: 0.95 }}
          >
            Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
          </motion.button>
          <motion.button
            onClick={handleLogout}
            style={styles.logoutButton}
            whileHover={{ scale: 1.05, backgroundColor: "#1a5ba8" }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Profile Dropdown */}
      {showProfile && (
        <motion.div
          style={styles.profileDropdown}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <h3>User Details</h3>
          {userDetails && (
            <div>
              <p>Name: {userDetails.name}</p>
              <p>Email: {userDetails.email}</p>
              <p>Phone: {userDetails.phone || "N/A"}</p>
            </div>
          )}
          <h4>Order History</h4>
          {userOrders.length === 0 ? (
            <p>No past orders found</p>
          ) : (
            userOrders.map((order, index) => (
              <motion.div
                key={order._id}
                style={styles.orderItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <p>Order ID: {order.orderId}</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Total: ₹{order.subtotal}</p>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      <div style={{ paddingTop: "80px" }}>
        <motion.div
          style={styles.content}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div style={styles.sidebar}>
            <h2>Filter by Brand</h2>
            <div style={styles.checkboxList}>
              {brands.slice(0, isExpanded ? brands.length : 10).map((brand) => (
                <motion.label
                  key={brand}
                  style={styles.checkboxLabel}
                  whileHover={{ scale: 1.02, color: "#4dabf7" }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="checkbox"
                    value={brand}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  {brand}
                </motion.label>
              ))}
              {brands.length > 10 && (
                <motion.button
                  onClick={toggleExpand}
                  style={styles.expandButton}
                  whileHover={{ scale: 1.05, background: "linear-gradient(135deg, #4dabf7, #1a4478)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </motion.button>
              )}
            </div>
            <h2>Filter by Price</h2>
            <div style={styles.priceFilter}>
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={Math.max(...products.map((p) => p.price))}
                step={1000}
              />
              <div style={styles.priceInputs}>
                <motion.input
                  type="number"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  style={styles.priceInput}
                  min={0}
                  max={Math.max(...products.map((p) => p.price))}
                  whileFocus={{ scale: 1.02, borderColor: "#4dabf7" }}
                />
                <span style={styles.priceSeparator}>to</span>
                <motion.input
                  type="number"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  style={styles.priceInput}
                  min={minPrice}
                  max={Math.max(...products.map((p) => p.price))}
                  whileFocus={{ scale: 1.02, borderColor: "#4dabf7" }}
                />
              </div>
            </div>
          </div>
          <div style={styles.productListContainer}>
            <ul style={styles.productList}>
              {filteredProducts.map((product, index) => {
                const discountAmount = calculateDiscountAmount(product.price, product.discountPercentage);
                const finalPrice = product.price - discountAmount;
                const isSoldOut = product.quantity === 0;

                return (
                  <motion.li
                    key={product._id}
                    style={styles.productItem}
                    onClick={() => navigate(`/product/${product._id}`)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)" }}
                  >
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      style={styles.image}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div style={styles.productDetails}>
                      <h2 style={styles.productName}>{product.name}</h2>
                      <div style={styles.priceContainer}>
                        <div style={styles.priceRow}>
                          <span style={styles.priceLabel}>Price:</span>
                          <span style={styles.priceValue}>
                            ₹{finalPrice.toFixed(2)}
                            {product.discountPercentage > 0 && (
                              <span style={styles.discountBadge}>
                                ({product.discountPercentage}% off)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      {isSoldOut ? (
                        <p style={styles.soldOut}>Sold Out</p>
                      ) : (
                        <>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            style={styles.button}
                            whileHover={{ scale: 1.05, background: "linear-gradient(135deg, #4dabf7, #1a4478)" }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Add to Cart
                          </motion.button>
                          <div style={styles.quantityControls}>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromCart(product);
                              }}
                              style={styles.quantityButton}
                              disabled={!cart.find((item) => item._id === product._id)?.quantity}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              -
                            </motion.button>
                            <span>
                              {cart.find((item) => item._id === product._id)?.quantity || 0}
                            </span>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              style={styles.quantityButton}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              +
                            </motion.button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const styles = {
  quantityControls: {
    display: "flex",
    alignItems: "center",
    marginTop: "15px",
  },
  quantityButton: {
    padding: "8px 14px",
    fontSize: "16px",
    backgroundColor: "#0F4C75",
    color: "#BBE1FA",
    border: "1px solid #3282B8",
    borderRadius: "6px",
    cursor: "pointer",
    margin: "0 10px",
    transition: "all 0.3s ease",
  },
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#1A1A2E",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    zIndex: 1000,
  },
  navLeft: {
    display: "flex",
    gap: "2rem",
    flexShrink: 0, // Prevent shrinking to ensure consistent spacing
  },
  navCenter: {
    flexGrow: 1, // Allow the center section to take up available space
    display: "flex",
    justifyContent: "center",
    margin: "0 1rem", // Add some margin to avoid touching the left and right sections
  },
  navLink: {
    color: "#BBE1FA",
    textDecoration: "none",
    fontSize: "1.1rem",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    transition: "all 0.3s ease",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    flexShrink: 0, // Prevent shrinking to ensure consistent spacing
  },
  navSearch: {
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    border: "1px solid #3282B8",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#BBE1FA",
    width: "100%", // Take up all available space in the center section
    maxWidth: "800px", // Set a max-width to prevent it from becoming too wide on large screens
    outline: "none",
  },
  profileButton: {
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #4A90E2, #9013FE)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  profileDropdown: {
    position: "absolute",
    right: "2rem",
    top: "4rem",
    backgroundColor: "#16213E",
    padding: "1.5rem",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    width: "300px",
    zIndex: "1000",
    color: "#BBE1FA",
  },
  orderItem: {
    padding: "1rem",
    margin: "0.5rem 0",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "8px",
    border: "1px solid rgba(50, 130, 184, 0.2)",
  },
  container: {
    textAlign: "center",
    padding: "50px",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    position: "relative",
    background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
    color: "#BBE1FA",
    minHeight: "100vh",
  },
  logoutButton: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#0F4C75",
    color: "#BBE1FA",
    border: "1px solid #3282B8",
    borderRadius: "6px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  cartButton: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#3282B8",
    color: "#BBE1FA",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  content: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "rgba(15, 76, 117, 0.8)",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(50, 130, 184, 0.3)",
  },
  sidebar: {
    width: "25%",
    padding: "25px",
    borderRight: "1px solid rgba(50, 130, 184, 0.5)",
    backgroundColor: "rgba(27, 38, 44, 0.7)",
    borderRadius: "10px 0 0 10px",
  },
  checkboxList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    maxHeight: "300px",
    overflowY: "auto",
    padding: "10px 5px",
  },
  checkboxLabel: {
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    color: "#BBE1FA",
    fontSize: "15px",
  },
  expandButton: {
    marginTop: "15px",
    padding: "8px 16px",
    fontSize: "14px",
    background: "linear-gradient(135deg, #3282B8, #0F4C75)",
    color: "#BBE1FA",
    fontWeight: "600",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  productListContainer: {
    width: "75%",
    padding: "25px",
  },
  productList: {
    listStyleType: "none",
    padding: 0,
  },
  productItem: {
    display: "flex",
    alignItems: "flex-start",
    margin: "20px 0",
    padding: "25px",
    border: "1px solid rgba(50, 130, 184, 0.4)",
    borderRadius: "8px",
    boxShadow: "0 3px 15px rgba(0, 0, 0, 0.15)",
    background: "linear-gradient(145deg, rgba(15, 76, 117, 0.9) 0%, rgba(27, 38, 44, 0.8) 100%)",
    cursor: "pointer",
  },
  image: {
    width: "120px",
    height: "180px",
    objectFit: "contain",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #3282B8",
    backgroundColor: "rgba(27, 38, 44, 0.8)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  productDetails: {
    marginLeft: "25px",
    textAlign: "left",
    flex: 1,
  },
  productName: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#BBE1FA",
    marginBottom: "12px",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  priceContainer: {
    marginTop: "18px",
    marginBottom: "18px",
    padding: "15px",
    borderRadius: "8px",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: "16px",
    fontWeight: "500",
    color: "rgba(187, 225, 250, 0.9)",
  },
  priceValue: {
    fontSize: "16px",
    color: "#BBE1FA",
  },
  discountBadge: {
    marginLeft: "8px",
    padding: "2px 8px",
    backgroundColor: "#FF6B6B",
    color: "#FFFFFF",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  priceFilter: {
    marginTop: "25px",
    backgroundColor: "rgba(15, 76, 117, 0.8)",
    padding: "18px",
    borderRadius: "8px",
    border: "1px solid rgba(50, 130, 184, 0.4)",
  },
  priceInputs: {
    display: "flex",
    alignItems: "center",
    marginTop: "12px",
  },
  priceInput: {
    padding: "10px",
    fontSize: "15px",
    width: "90px",
    borderRadius: "6px",
    border: "1px solid #3282B8",
    backgroundColor: "rgba(187, 225, 250, 0.1)",
    color: "#BBE1FA",
    outline: "none",
  },
  priceSeparator: {
    margin: "0 12px",
    color: "#BBE1FA",
  },
  soldOut: {
    padding: "5px 12px",
    fontSize: "18px",
    color: "#FF6B6B",
    fontWeight: "bold",
    marginTop: "10px",
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: "5px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    background: "linear-gradient(135deg, #3282B8, #0F4C75)",
    color: "#BBE1FA",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "18px",
    fontWeight: "600",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
};

export default Products;