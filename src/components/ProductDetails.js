import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const ProductDetails = ({ cart, setCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasPurchased, setHasPurchased] = useState(false);
  const [error, setError] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const fetchProduct = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: token || "" },
      });
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error.response?.data || error.message);
      setError("Failed to load product details.");
    }
  }, [id]);

  const fetchUserOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setHasPurchased(false);
        return;
      }
      
      const productResponse = await axios.get(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: token }
      });
      const productName = productResponse.data.name.trim().toLowerCase();
  
      const ordersResponse = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: token },
      });
  
      const purchased = ordersResponse.data.some(order => 
        order.orderCart.some(item => 
          item.name.trim().toLowerCase() === productName
        )
      );
  
      console.log("Name Comparison Result:", purchased);
      setHasPurchased(purchased);
    } catch (error) {
      console.error("Error:", error);
      setHasPurchased(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    fetchUserOrders();
  }, [id, fetchProduct, fetchUserOrders]);

  const handleIncrement = () => {
    if (product && selectedQuantity < product.quantity) {
      setSelectedQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.quantity === 0) return;
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: selectedQuantity }];
      }
    });
    setSelectedQuantity(1);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to submit a review.");
        navigate("/login");
        return;
      }
      const response = await axios.post(
        `http://localhost:5000/api/products/review/${id}`,
        { rating, comment },
        { headers: { Authorization: token } }
      );
      alert(response.data.message);
      setRating(0);
      setComment("");
      fetchProduct();
    } catch (error) {
      console.error("Error submitting review:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={i <= rating ? styles.starFilled : styles.starEmpty}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const calculateDiscountAmount = (price, discountPercentage) => {
    return (price * discountPercentage) / 100;
  };

  if (!product && !error) return <div>Loading...</div>;
  if (error) return <div>{error} <button onClick={() => navigate("/login")}>Log In</button></div>;

  const discountAmount = calculateDiscountAmount(product.price, product.discountPercentage);
  const finalPrice = product.price - discountAmount;

  const averageRating =
    product.reviews.length > 0
      ? (
          product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        ).toFixed(1)
      : "No reviews yet";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={styles.container}
    >
      <motion.button
        onClick={() => navigate("/user")}
        style={styles.backButton}
        whileHover={{ scale: 1.05, backgroundColor: "#4dabf7" }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        Back to Home
      </motion.button>

      <motion.div
        style={styles.productContainer}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.img
          src={product.image}
          alt={product.name}
          style={styles.image}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
        <div style={styles.details}>
          <h2 style={styles.productName}>{product.name}</h2>
          <p>Price: ₹{product.price}</p>
          <p>Brand: {product.brand}</p>
          <p>{product.description}</p>
          <p>Discount: {product.discountPercentage}%</p>
          <p>Discounted Price: ₹{finalPrice}</p>
          <p>
            Average Rating: {averageRating} {renderStars(Math.round(averageRating))}
          </p>
          {product.quantity > 0 ? (
            <div>
              <div style={styles.quantityControls}>
                <motion.button
                  onClick={handleDecrement}
                  style={styles.quantityButton}
                  disabled={selectedQuantity === 1}
                  whileHover={{ scale: selectedQuantity === 1 ? 1 : 1.1 }}
                  whileTap={{ scale: selectedQuantity === 1 ? 1 : 0.9 }}
                >
                  −
                </motion.button>
                <span style={styles.quantityDisplay}>{selectedQuantity}</span>
                <motion.button
                  onClick={handleIncrement}
                  style={styles.quantityButton}
                  disabled={selectedQuantity >= product.quantity}
                  whileHover={{ scale: selectedQuantity >= product.quantity ? 1 : 1.1 }}
                  whileTap={{ scale: selectedQuantity >= product.quantity ? 1 : 0.9 }}
                >
                  +
                </motion.button>
              </div>
              <motion.button
                onClick={handleAddToCart}
                style={styles.button}
                whileHover={{ scale: 1.05, background: "linear-gradient(135deg, #4dabf7, #1a4478)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Add to Cart
              </motion.button>
            </div>
          ) : (
            <p style={styles.soldOut}>Sold Out</p>
          )}
        </div>
      </motion.div>

      <motion.div
        style={styles.reviewsContainer}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3>Reviews</h3>
        {product.reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          product.reviews.map((review, index) => (
            <motion.div
              key={index}
              style={styles.review}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <div style={styles.rating}>
                {renderStars(review.rating)}
                <span style={styles.ratingText}>({review.rating}/5)</span>
              </div>
              <p>{review.comment}</p>
              <p>
                By User - {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))
        )}
      </motion.div>

      {hasPurchased ? (
        <motion.div
          style={styles.reviewForm}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3>Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div style={styles.ratingInput}>
              <label>Rating: </label>
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.span
                  key={star}
                  onClick={() => setRating(star)}
                  style={star <= rating ? styles.starFilled : styles.starEmpty}
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  ★
                </motion.span>
              ))}
            </div>
            <motion.textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={styles.textarea}
              required
              whileFocus={{ scale: 1.02, borderColor: "rgba(187, 225, 250, 0.5)" }}
              transition={{ duration: 0.2 }}
            />
            <motion.button
              type="submit"
              style={styles.button}
              whileHover={{ scale: 1.05, background: "linear-gradient(135deg, #4dabf7, #1a4478)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Submit Review
            </motion.button>
          </form>
        </motion.div>
      ) : (
        <motion.p
          style={styles.purchaseMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          You need to purchase this product to leave a review.
        </motion.p>
      )}
    </motion.div>
  );
};

const styles = {
  container: {
    padding: "50px",
    background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)", // Matching previous codes
    color: "#BBE1FA",
    minHeight: "100vh",
  },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#3282B8",
    color: "#BBE1FA",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "20px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  productContainer: {
    display: "flex",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "rgba(15, 76, 117, 0.8)",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
  },
  image: {
    width: "200px",
    height: "300px",
    objectFit: "contain",
    marginRight: "20px",
    borderRadius: "8px",
  },
  details: {
    flex: 1,
    textAlign: "left",
  },
  productName: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    margin: "10px 0",
  },
  quantityButton: {
    padding: "8px 14px",
    fontSize: "16px",
    backgroundColor: "#0F4C75",
    color: "#BBE1FA",
    border: "1px solid #3282B8",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  quantityDisplay: {
    margin: "0 10px",
    fontSize: "16px",
    color: "#BBE1FA",
  },
  button: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #3282B8, #0F4C75)",
    color: "#BBE1FA",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  soldOut: {
    color: "#FF6B6B",
    fontWeight: "bold",
    marginTop: "10px",
  },
  reviewsContainer: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "rgba(27, 38, 44, 0.7)",
    borderRadius: "10px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
  },
  review: {
    borderBottom: "1px solid rgba(50, 130, 184, 0.5)",
    padding: "10px 0",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    marginBottom: "5px",
  },
  starFilled: {
    color: "#FFD700",
    fontSize: "20px",
    cursor: "pointer",
  },
  starEmpty: {
    color: "rgba(187, 225, 250, 0.3)",
    fontSize: "20px",
    cursor: "pointer",
  },
  ratingText: {
    marginLeft: "5px",
    fontSize: "14px",
  },
  reviewForm: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "rgba(27, 38, 44, 0.7)",
    borderRadius: "10px",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
  },
  ratingInput: {
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #3282B8",
    backgroundColor: "rgba(187, 225, 250, 0.1)",
    color: "#BBE1FA",
    marginBottom: "10px",
    transition: "all 0.3s ease",
    outline: "none",
  },
  purchaseMessage: {
    marginTop: "20px",
    color: "#FF6B6B",
    fontStyle: "italic",
  },
};

export default ProductDetails;