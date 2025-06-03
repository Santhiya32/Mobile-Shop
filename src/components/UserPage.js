import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Slider from "@mui/material/Slider";
import SlickSlider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";

const UserPage = ({ cart, setCart }) => {
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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const banners = [
    "https://darlingretail.com/cdn/shop/files/Artboard_1_442b59ef-8d50-45d8-9beb-956862506e0e_1800x.jpg?v=1705660066",
    "https://darlingretail.com/cdn/shop/files/41AD9C5F-2C7B-47B1-83BA-144861575808_1800x.jpg?v=1736002801",
    "https://img-prd-pim.poorvika.com/pageimg/Iphone-16-series-holi-sale-67d3feb94688d.webp",
  ];

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
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
          <h3 style={styles.profileDropdownTitle}>User Details</h3>
          {userDetails && (
            <div style={styles.profileDetails}>
              <p>Name: {userDetails.name}</p>
              <p>Email: {userDetails.email}</p>
            </div>
          )}
          <h4 style={styles.profileDropdownSubtitle}>Order History</h4>
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
                <p>Items: {order.orderCart.map((item) => item.name).join(", ")}</p>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Total: ₹{order.subtotal}</p>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      <div style={{ paddingTop: "80px" }}>
        <motion.div
          style={styles.sliderContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SlickSlider {...sliderSettings}>
            {banners.map((banner, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={banner}
                  alt={`Banner ${index + 1}`}
                  style={styles.sliderImage}
                />
              </motion.div>
            ))}
          </SlickSlider>
        </motion.div>

        <motion.div
          style={styles.content}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
                      <h2 style={styles.productName}>{product.brand} {product.name}</h2>
                      <div style={styles.priceContainer}>
                        <div style={styles.priceRow}>
                          <span style={styles.priceValue}>
                            ₹{finalPrice.toFixed(2)}{" "}
                            {product.price > finalPrice && (
                              <span style={styles.originalPrice}>₹{product.price.toFixed(2)}</span>
                            )}
                          </span>
                          {product.discountPercentage > 0 && (
                            <span style={styles.discountBadge}>
                              Save {product.discountPercentage}%
                            </span>
                          )}
                        </div>
                      </div>
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
    flexShrink: 0,
  },
  navCenter: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "center",
    margin: "0 1rem",
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
    flexShrink: 0,
  },
  navSearch: {
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    border: "1px solid #3282B8",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#BBE1FA",
    width: "100%",
    maxWidth: "800px",
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
    top: "4.5rem",
    backgroundColor: "#16213E",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
    width: "400px",
    maxHeight: "500px",
    overflowY: "auto",
    zIndex: 1000,
    color: "#BBE1FA",
  },
  profileDropdownTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    borderBottom: "1px solid rgba(50, 130, 184, 0.5)",
    paddingBottom: "0.5rem",
  },
  profileDetails: {
    marginBottom: "1.5rem",
    fontSize: "1.1rem",
  },
  profileDropdownSubtitle: {
    fontSize: "1.3rem",
    marginBottom: "1rem",
    borderBottom: "1px solid rgba(50, 130, 184, 0.5)",
    paddingBottom: "0.5rem",
  },
  orderItem: {
    padding: "1.2rem",
    margin: "0.8rem 0",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "8px",
    border: "1px solid rgba(50, 130, 184, 0.2)",
    fontSize: "1rem",
  },
  container: {
    textAlign: "center",
    padding: "50px",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    position: "relative",
    background: "linear-gradient(145deg, #1B262C 0%, #0F4C75 100%)",
    color: "#BBE1FA",
    minHeight: "100vh",
  },
  sliderContainer: {
    marginBottom: "40px",
  },
  sliderImage: {
    width: "100%",
    height: "400px",
    objectFit: "cover",
    borderRadius: "10px",
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
  },
  productItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "10px 0",
    padding: "15px",
    border: "1px solid rgba(50, 130, 184, 0.4)",
    borderRadius: "8px",
    boxShadow: "0 3px 15px rgba(0, 0, 0, 0.15)",
    background: "linear-gradient(145deg, rgba(15, 76, 117, 0.9) 0%, rgba(27, 38, 44, 0.8) 100%)",
    cursor: "pointer",
    textAlign: "center",
  },
  image: {
    width: "150px",
    height: "200px",
    objectFit: "contain",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #3282B8",
    backgroundColor: "rgba(27, 38, 44, 0.8)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  productDetails: {
    textAlign: "center",
    flex: 1,
  },
  productName: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#BBE1FA",
    marginBottom: "5px",
    overflow: "visible",
    textOverflow: "clip",
    whiteSpace: "normal",
    maxWidth: "100%",
    lineHeight: "1.2",
  },
  priceContainer: {
    marginBottom: "10px",
  },
  priceRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  priceValue: {
    fontSize: "16px",
    color: "#BBE1FA",
  },
  originalPrice: {
    fontSize: "14px",
    color: "#BBE1FA",
    textDecoration: "line-through",
    opacity: 0.7,
  },
  discountBadge: {
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
};

export default UserPage;