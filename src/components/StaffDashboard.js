import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const StaffDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
      setSearchResults([]);
      setShowDropdown(false);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setSearchResults(filtered);
      setShowDropdown(true);
    }
  }, [products, searchTerm]);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: localStorage.getItem("token") },
      });
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProductSelect = (product) => {
    setProductId(product._id);
    setSearchTerm(product.name);
    setShowDropdown(false);
  };

  const handleSellProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/products/sell",
        { productId, quantitySold: quantity },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );
      if (response.status === 200) {
        alert("Product sold successfully!");
        setProductId("");
        setQuantity("");
        setSearchTerm("");
        fetchProducts();
      } else {
        alert("Failed to sell product. Please try again.");
      }
    } catch (error) {
      console.error("Error selling product:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <motion.div 
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        Staff Dashboard
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Manage and sell products.
      </motion.p>
      
      <motion.div 
        style={styles.searchContainer} 
        ref={dropdownRef}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={styles.searchInput}
          onFocus={() => searchTerm.trim() !== "" && setShowDropdown(true)}
          whileFocus={{ scale: 1.02, borderColor: "#7AB5E6" }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        
        {showDropdown && searchResults.length > 0 && (
          <motion.div 
            style={styles.dropdown}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {searchResults.map((product) => (
              <motion.div 
                key={product._id} 
                style={styles.dropdownItem}
                onClick={() => handleProductSelect(product)}
                whileHover={{ backgroundColor: "#1E3A5F" }}
                transition={{ duration: 0.2 }}
              >
                {product.name} - ${product.price} - {product.quantity} in stock
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {showDropdown && searchResults.length === 0 && searchTerm.trim() !== "" && (
          <motion.div 
            style={styles.dropdown}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.dropdownItem}>No products found</div>
          </motion.div>
        )}
      </motion.div>
      
      <motion.form 
        onSubmit={handleSellProduct} 
        style={styles.form}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          style={styles.input}
          whileFocus={{ scale: 1.02, borderColor: "#7AB5E6" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <option value="">Select Product</option>
          {filteredProducts.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name} - ${product.price} - {product.quantity} in stock
            </option>
          ))}
        </motion.select>
        <motion.input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          style={styles.input}
          whileFocus={{ scale: 1.02, borderColor: "#7AB5E6" }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <motion.button
          type="submit"
          style={styles.button}
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: "#1E3A5F",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Sell Product
        </motion.button>
      </motion.form>
      
      {filteredProducts.length === 0 && searchTerm.trim() !== "" && (
        <motion.p 
          style={styles.noResults}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          No products found matching your search.
        </motion.p>
      )}
      
      <motion.button
        onClick={handleLogout}
        style={styles.button}
        whileHover={{ 
          scale: 1.05, 
          backgroundColor: "#1E3A5F",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)"
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 300 }}
      >
        Logout
      </motion.button>
    </motion.div>
  );
};

const styles = {
  global: {
    margin: 0,
    padding: 0,
    backgroundColor: "#0A0A14",
    color: "#E0E0E0",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflow: "hidden",
  },
  container: {
    textAlign: "center",
    padding: "50px",
    background: "#0A0A14",
    color: "#E0E0E0",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    position: "relative",
  },
  searchContainer: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto 20px",
    position: "relative",
  },
  searchInput: {
    padding: "12px 16px",
    fontSize: "16px",
    width: "100%",
    backgroundColor: "#0A0F1D",
    color: "#E0E0E0",
    border: "1px solid #1E3A5F",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#0A0F1D",
    border: "1px solid #1E3A5F",
    borderRadius: "0 0 6px 6px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    zIndex: 10,
    maxHeight: "200px",
    overflowY: "auto",
  },
  dropdownItem: {
    padding: "10px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #1E3A5F",
    color: "#E0E0E0",
    textAlign: "left",
    transition: "background-color 0.2s ease",
    hover: {
      backgroundColor: "#1E3A5F",
    }
  },
  noResults: {
    margin: "20px 0",
    color: "#7AB5E6",
    fontStyle: "italic",
  },
  form: {
    margin: "20px 0",
    padding: "25px",
    background: "#0D1326",
    borderRadius: "12px",
    border: "1px solid #1E3A5F",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  input: {
    padding: "12px 16px",
    margin: "12px",
    fontSize: "16px",
    backgroundColor: "#0A0F1D",
    color: "#E0E0E0",
    border: "1px solid #1E3A5F",
    borderRadius: "6px",
    outline: "none",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    width: "calc(100% - 24px)",
    maxWidth: "400px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "18px",
    backgroundColor: "#0A1D35",
    color: "#E0E0E0",
    border: "1px solid #1E3A5F",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
    margin: "10px",
  },
  priceTag: {
    display: "inline-block",
    padding: "8px 16px",
    margin: "15px 0",
    background: "#0B223F",
    color: "#7AB5E6",
    borderRadius: "8px",
    border: "1px solid #1E3A5F",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    fontWeight: "bold",
    letterSpacing: "0.5px",
  },
  sectionTitle: {
    color: "#E0E0E0",
    margin: "20px 0 15px",
    fontSize: "24px",
    fontWeight: "600",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    position: "relative",
    paddingBottom: "10px",
  },
  card: {
    padding: "20px",
    margin: "15px 0",
    background: "#0D1326",
    borderRadius: "10px",
    border: "1px solid #1E3A5F",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    width: "100%",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "20px",
    background: "#0A1D35",
    color: "#7AB5E6",
    border: "1px solid #1E3A5F",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    margin: "0 5px",
  }
};

export default StaffDashboard;