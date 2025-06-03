import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { motion } from "framer-motion"; // Import Framer Motion

const Cart = ({ cart, setCart }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [orderCart, setOrderCart] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      await axios.get("http://localhost:5000/api/auth/user", {
        headers: { Authorization: localStorage.getItem("token") },
      });
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  const openPaymentModal = () => {
    if (!customerName || !phoneNumber || !address || !email) {
      alert("Please fill in all customer details");
      return;
    }
    
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }
    
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const calculateDiscountedPrice = (price, discountPercentage) => {
    const discountAmount = (price * discountPercentage) / 100;
    return price - discountAmount;
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    
    if (paymentMethod === "UPI" && !upiId) {
      alert("Please enter your UPI ID");
      return;
    }

    setLoading(true);
    try {
      const calculatedSubtotal = calculateSubtotal();
      setSubtotal(calculatedSubtotal);

      setTimeout(async () => {
        const uniqueOrderId = `#TX${Math.floor(Math.random() * 1000000)}`;
        const uniqueTransactionId = `TXN${Math.floor(Math.random() * 1000000000)}`;
        setOrderId(uniqueOrderId);
        setTransactionId(uniqueTransactionId);

        const simplifiedCart = cart.map(product => ({
          _id: product._id,
          name: product.name,
          price: calculateDiscountedPrice(product.price, product.discountPercentage || 0),
          originalPrice: product.price,
          discountPercentage: product.discountPercentage || 0,
          quantity: product.quantity,
          image: product.image || "",
          description: product.description || ""
        }));

        for (const product of cart) {
          await axios.post(
            "http://localhost:5000/api/products/sell",
            { productId: product._id, quantitySold: product.quantity },
            {
              headers: { Authorization: localStorage.getItem("token") },
            }
          );
        }

        await axios.post(
          "http://localhost:5000/api/orders",
          {
            orderId: uniqueOrderId,
            transactionId: uniqueTransactionId,
            customerName,
            phoneNumber,
            email,
            address,
            subtotal: calculatedSubtotal,
            orderCart: simplifiedCart,
          },
          {
            headers: { Authorization: localStorage.getItem("token") },
          }
        );

        setOrderCart(simplifiedCart);
        setLoading(false);
        setShowPaymentModal(false);
        setOrderSuccess(true);
        setCart([]);
      }, 2000);
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${product._id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });
      const fetchedProduct = response.data;

      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item._id === fetchedProduct._id);
        if (existingProduct) {
          return prevCart.map((item) =>
            item._id === fetchedProduct._id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prevCart, { ...fetchedProduct, quantity: 1 }];
        }
      });
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleRemoveFromCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);
      if (existingProduct.quantity === 1) {
        return prevCart.filter((item) => item._id !== product._id);
      } else {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
    });
  };

  const handleDeleteFromCart = (product) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== product._id));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, product) => {
      const discountedPrice = calculateDiscountedPrice(product.price, product.discountPercentage || 0);
      return total + discountedPrice * product.quantity;
    }, 0);
  };

  const pdfStyles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Helvetica',
    },
    header: {
      fontSize: 24,
      marginBottom: 20,
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#1A1A1A',
    },
    shopDetails: {
      fontSize: 10,
      marginBottom: 15,
      textAlign: 'center',
      color: '#555',
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: '#888',
      marginVertical: 10,
    },
    section: {
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#444',
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingVertical: 5,
      alignItems: 'center',
    },
    col1: {
      width: '45%',
    },
    col2: {
      width: '15%',
      textAlign: 'center',
    },
    col3: {
      width: '20%',
      textAlign: 'right',
    },
    col4: {
      width: '20%',
      textAlign: 'right',
    },
    invoiceDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    invoiceColumn: {
      width: '48%',
    },
    label: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#555',
    },
    value: {
      fontSize: 10,
      marginBottom: 5,
    },
    total: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'right',
      marginTop: 10,
      color: '#333',
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 30,
      right: 30,
      textAlign: 'center',
      fontSize: 10,
      color: '#888',
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#888',
      paddingVertical: 5,
      fontWeight: 'bold',
      backgroundColor: '#f5f5f5',
    },
    thankYou: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 14,
      fontWeight: 'bold',
      color: '#555',
    },
  });

  const InvoiceDocument = () => {
    const currentDate = new Date().toLocaleDateString('en-GB');
    
    return (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.header}>TAMIZHA MOBILE SHOP</Text>
          <Text style={pdfStyles.shopDetails}>
            No.2, KG Complex, Muthu Nagar, Sengunthapuram main road, Karur-639002{'\n'}
            Email: mrtamizhamobile@gmail.com | Phone: +91 9876543210
          </Text>
          <View style={pdfStyles.divider} />
          <View style={pdfStyles.invoiceDetails}>
            <View style={pdfStyles.invoiceColumn}>
              <Text style={pdfStyles.sectionTitle}>Invoice Details:</Text>
              <Text style={pdfStyles.label}>Order ID:</Text>
              <Text style={pdfStyles.value}>{orderId}</Text>
              <Text style={pdfStyles.label}>Transaction ID:</Text>
              <Text style={pdfStyles.value}>{transactionId}</Text>
              <Text style={pdfStyles.label}>Date:</Text>
              <Text style={pdfStyles.value}>{currentDate}</Text>
              <Text style={pdfStyles.label}>Payment Method:</Text>
              <Text style={pdfStyles.value}>{paymentMethod || "Not specified"}</Text>
            </View>
            <View style={pdfStyles.invoiceColumn}>
              <Text style={pdfStyles.sectionTitle}>Customer Details:</Text>
              <Text style={pdfStyles.label}>Name:</Text>
              <Text style={pdfStyles.value}>{customerName}</Text>
              <Text style={pdfStyles.label}>Phone:</Text>
              <Text style={pdfStyles.value}>{phoneNumber}</Text>
              <Text style={pdfStyles.label}>Email:</Text>
              <Text style={pdfStyles.value}>{email}</Text>
              <Text style={pdfStyles.label}>Address:</Text>
              <Text style={pdfStyles.value}>{address}</Text>
            </View>
          </View>
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Order Summary:</Text>
            <View style={pdfStyles.tableHeader}>
              <Text style={pdfStyles.col1}>Product</Text>
              <Text style={pdfStyles.col2}>Quantity</Text>
              <Text style={pdfStyles.col3}>Unit Price</Text>
              <Text style={pdfStyles.col4}>Total</Text>
            </View>
            {orderCart.map((product, index) => (
              <View key={index} style={pdfStyles.row}>
                <Text style={pdfStyles.col1}>{product.name}</Text>
                <Text style={pdfStyles.col2}>{product.quantity}</Text>
                <Text style={pdfStyles.col3}>₹{product.price.toFixed(2)}</Text>
                <Text style={pdfStyles.col4}>₹{(product.price * product.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <Text style={pdfStyles.total}>Total Amount: ₹{subtotal.toFixed(2)}</Text>
          </View>
          <Text style={pdfStyles.thankYou}>Thank you for shopping with us!</Text>
          <View style={pdfStyles.footer}>
            <Text>This is a computer-generated invoice and does not require a signature.</Text>
            <Text>For any queries, please contact us at mrtamizhamobile@gmail.com</Text>
            <Text>GST No: 33AABCT1234A1Z5</Text>
          </View>
        </Page>
      </Document>
    );
  };

  const PaymentModal = () => (
    <motion.div
      style={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        style={styles.modalContent}
        initial={{ scale: 0.8, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -50 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h2>Payment Details</h2>
        <div style={styles.modalBody}>
          <h3>Order Total: ₹{calculateSubtotal().toFixed(2)}</h3>
          <div style={styles.paymentOptions}>
            <h3>Payment Options</h3>
            <motion.select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={styles.paymentDropdown}
              whileFocus={{ borderColor: "#BBE1FA" }}
            >
              <option value="">Select Payment Method</option>
              <option value="Google Pay">Google Pay</option>
              <option value="PhonePe">PhonePe</option>
              <option value="UPI">UPI ID</option>
              <option value="Card">Debit/Credit Card</option>
            </motion.select>
            {paymentMethod === "UPI" && (
              <motion.input
                type="text"
                placeholder="Enter UPI ID"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                style={styles.upiInput}
                whileFocus={{ borderColor: "#BBE1FA" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
            {paymentMethod === "Card" && (
              <motion.div
                style={styles.cardDetails}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.input type="text" placeholder="Card Number" style={styles.input} whileFocus={{ borderColor: "#BBE1FA" }} />
                <motion.input type="text" placeholder="Expiry Date (MM/YY)" style={styles.input} whileFocus={{ borderColor: "#BBE1FA" }} />
                <motion.input type="text" placeholder="CVV" style={styles.input} whileFocus={{ borderColor: "#BBE1FA" }} />
                <motion.input type="text" placeholder="Cardholder Name" style={styles.input} whileFocus={{ borderColor: "#BBE1FA" }} />
              </motion.div>
            )}
          </div>
          {loading ? (
            <motion.div
              style={styles.loadingContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                style={styles.spinner}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p>Processing your payment...</p>
            </motion.div>
          ) : (
            <motion.div
              style={styles.modalButtons}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.button
                onClick={handlePayment}
                style={styles.payButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Pay Now
              </motion.button>
              <motion.button
                onClick={closePaymentModal}
                style={styles.cancelButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      style={styles.cartContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Cart
      </motion.h2>
      <motion.ul
        style={styles.cartList}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {cart.map((product, index) => {
          const discountedPrice = calculateDiscountedPrice(product.price, product.discountPercentage || 0);
          return (
            <motion.li
              key={index}
              style={styles.cartItem}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.25)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <img src={product.image} alt={product.name} style={styles.image} />
              <div style={styles.productDetails}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.price}>
                  Price: ₹{product.price} {product.discountPercentage > 0 && (
                    <span>(Discounted: ₹{discountedPrice.toFixed(2)})</span>
                  )}
                </p>
                <div style={styles.quantityControls}>
                  <motion.button
                    onClick={() => handleRemoveFromCart(product)}
                    style={styles.quantityButton}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    -
                  </motion.button>
                  <span>{product.quantity}</span>
                  <motion.button
                    onClick={() => handleAddToCart(product)}
                    style={styles.quantityButton}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.button>
                </div>
                <motion.button
                  onClick={() => handleDeleteFromCart(product)}
                  style={styles.deleteButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Subtotal: ₹{calculateSubtotal().toFixed(2)}
      </motion.h3>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3>Customer Details</h3>
        <motion.input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={styles.input}
          whileFocus={{ borderColor: "#BBE1FA" }}
        />
        <motion.input
          type="number"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={styles.input}
          whileFocus={{ borderColor: "#BBE1FA" }}
        />
        <motion.input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          whileFocus={{ borderColor: "#BBE1FA" }}
        />
        <motion.input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={styles.input}
          whileFocus={{ borderColor: "#BBE1FA" }}
        />
      </motion.div>
      <motion.button
        onClick={openPaymentModal}
        style={styles.checkoutButton}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        Checkout & Pay
      </motion.button>
      <motion.button
        onClick={() => navigate("/user")}
        style={styles.backButton}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        Back to Products
      </motion.button>
      {showPaymentModal && <PaymentModal />}
      {orderSuccess && (
        <motion.div
          style={styles.orderSummary}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3>Order Successful!</h3>
          <p>Order ID: {orderId}</p>
          <p>Transaction ID: {transactionId}</p>
          <p>Name: {customerName}</p>
          <p>Phone Number: {phoneNumber}</p>
          <p>Email: {email}</p>
          <p>Address: {address}</p>
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          {orderCart.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <PDFDownloadLink
                document={<InvoiceDocument />}
                fileName={`tamizha_mobile_invoice_${orderId.replace('#', '')}.pdf`}
                style={styles.downloadButton}
              >
                {({ blob, url, loading, error }) => 
                  loading ? "Generating Invoice..." : "Download Invoice"
                }
              </PDFDownloadLink>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

const styles = {
  colors: {
    darkBase: "#0F1624",
    darkSecondary: "#1F2937",
    mediumBlue: "#3282B8",
    lightBlue: "#BBE1FA",
    textPrimary: "#F3F4F6",
    textSecondary: "#D1D5DB",
    accent: "rgba(187, 225, 250, 0.8)",
    danger: "#E53935",
    success: "#4CAF50",
  },
  cartContainer: { 
    padding: "50px", 
    fontFamily: "'Poppins', Arial, sans-serif",
    background: `linear-gradient(145deg, #0F1624 0%, #1A2332 100%)`,
    color: "#F3F4F6",
    minHeight: "100vh",
    boxShadow: "inset 0 0 30px rgba(50, 130, 184, 0.15)"
  },
  cartList: { listStyleType: "none", padding: 0 },
  cartItem: { 
    display: "flex", 
    alignItems: "center", 
    margin: "20px 0", 
    padding: "15px", 
    background: "rgba(31, 41, 55, 0.7)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(187, 225, 250, 0.2)", 
    borderRadius: "10px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(187, 225, 250, 0.05)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(187, 225, 250, 0.1)",
      borderColor: "rgba(187, 225, 250, 0.3)"
    }
  },
  image: { 
    width: "100px", 
    height: "100px", 
    padding: "10px", 
    borderRadius: "8px",
    background: "rgba(15, 22, 36, 0.7)",
    border: "1px solid rgba(187, 225, 250, 0.2)",
    objectFit: "cover"
  },
  productDetails: { marginLeft: "20px", textAlign: "left", flex: 1 },
  productName: { fontSize: "18px", fontWeight: "600", color: "#F3F4F6", textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)" },
  price: { 
    fontSize: "16px", 
    color: "#BBE1FA",
    fontWeight: "500",
    background: "linear-gradient(90deg, rgba(50, 130, 184, 0.2) 0%, rgba(15, 22, 36, 0) 100%)",
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "20px",
    marginTop: "5px",
    border: "1px solid rgba(50, 130, 184, 0.3)"
  },
  quantityControls: { 
    display: "flex", 
    alignItems: "center", 
    marginTop: "15px",
    background: "rgba(15, 22, 36, 0.5)",
    borderRadius: "8px",
    padding: "5px",
    width: "fit-content"
  },
  quantityButton: { 
    padding: "5px 12px", 
    fontSize: "18px", 
    background: "linear-gradient(135deg, #3282B8 0%, #2A6A98 100%)", 
    color: "white", 
    border: "none", 
    cursor: "pointer", 
    margin: "0 5px",
    borderRadius: "6px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #3795D5 0%, #3282B8 100%)",
      boxShadow: "0 0 10px rgba(187, 225, 250, 0.5)"
    },
    "&:active": {
      transform: "translateY(1px)"
    }
  },
  deleteButton: { 
    padding: "8px 15px", 
    fontSize: "14px", 
    background: "linear-gradient(135deg, #E53935 0%, #C62828 100%)", 
    color: "white", 
    border: "none", 
    cursor: "pointer", 
    marginTop: "15px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    "&:hover": {
      background: "linear-gradient(135deg, #F44336 0%, #E53935 100%)",
      boxShadow: "0 0 10px rgba(229, 57, 53, 0.5)"
    }
  },
  checkoutButton: { 
    padding: "12px 25px", 
    fontSize: "18px", 
    background: "linear-gradient(135deg, #3282B8 0%, #1A5889 100%)", 
    color: "white", 
    border: "none", 
    cursor: "pointer", 
    marginTop: "25px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
    fontWeight: "600",
    letterSpacing: "0.5px",
    "&:hover": {
      background: "linear-gradient(135deg, #3795D5 0%, #3282B8 100%)",
      boxShadow: "0 0 20px rgba(187, 225, 250, 0.4)",
      transform: "translateY(-2px)"
    },
    "&:active": {
      transform: "translateY(1px)"
    }
  },
  backButton: { 
    padding: "12px 25px", 
    fontSize: "18px", 
    background: "linear-gradient(135deg, #4B5563 0%, #374151 100%)", 
    color: "white", 
    border: "none", 
    cursor: "pointer", 
    marginTop: "25px", 
    marginLeft: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
      boxShadow: "0 0 15px rgba(187, 225, 250, 0.2)"
    }
  },
  input: { 
    padding: "12px 15px", 
    fontSize: "16px", 
    width: "250px", 
    marginTop: "15px",
    background: "rgba(15, 22, 36, 0.7)",
    border: "1px solid rgba(187, 225, 250, 0.2)",
    borderRadius: "8px",
    color: "#F3F4F6",
    transition: "all 0.3s ease",
    "&:focus": {
      outline: "none",
      background: "rgba(31, 41, 55, 0.9)",
      borderColor: "rgba(187, 225, 250, 0.5)",
      boxShadow: "0 0 10px rgba(187, 225, 250, 0.3)"
    },
    "&::placeholder": {
      color: "rgba(209, 213, 219, 0.5)"
    }
  },
  orderSummary: { 
    marginTop: "30px", 
    padding: "25px", 
    background: "linear-gradient(145deg, rgba(31, 41, 55, 0.8) 0%, rgba(15, 22, 36, 0.8) 100%)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(187, 225, 250, 0.15)", 
    borderRadius: "12px",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)"
  },
  paymentDropdown: {
    padding: "12px 15px",
    fontSize: "16px",
    width: "250px",
    marginTop: "15px",
    marginBottom: "15px",
    background: "rgba(15, 22, 36, 0.7)",
    border: "1px solid rgba(187, 225, 250, 0.2)",
    borderRadius: "8px",
    color: "#F3F4F6",
    "&:focus": {
      outline: "none",
      borderColor: "rgba(187, 225, 250, 0.5)",
      boxShadow: "0 0 10px rgba(187, 225, 250, 0.3)"
    },
    "& option": {
      background: "#1F2937",
      color: "#F3F4F6"
    }
  },
  cardDetails: {
    marginTop: "15px",
    padding: "15px",
    background: "rgba(15, 22, 36, 0.5)",
    borderRadius: "8px",
    border: "1px solid rgba(187, 225, 250, 0.1)"
  },
  upiInput: { 
    padding: "12px 15px", 
    fontSize: "16px", 
    width: "250px", 
    marginTop: "15px",
    background: "rgba(15, 22, 36, 0.7)",
    border: "1px solid rgba(187, 225, 250, 0.2)",
    borderRadius: "8px",
    color: "#F3F4F6",
    "&:focus": {
      outline: "none",
      background: "rgba(31, 41, 55, 0.9)",
      borderColor: "rgba(187, 225, 250, 0.5)",
      boxShadow: "0 0 10px rgba(187, 225, 250, 0.3)"
    }
  },
  downloadButton: {
    display: "inline-block",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    marginTop: "20px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)",
      boxShadow: "0 0 15px rgba(76, 175, 80, 0.5)",
      transform: "translateY(-2px)"
    }
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 22, 36, 0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "linear-gradient(145deg, #1F2937 0%, #111827 100%)",
    padding: "25px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(187, 225, 250, 0.1)",
    border: "1px solid rgba(187, 225, 250, 0.15)",
    color: "#F3F4F6"
  },
  modalBody: { marginTop: "25px" },
  modalButtons: { display: "flex", justifyContent: "space-between", marginTop: "35px" },
  payButton: {
    padding: "12px 25px",
    fontSize: "16px",
    background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "48%",
    fontWeight: "500",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)",
      boxShadow: "0 0 15px rgba(76, 175, 80, 0.5)",
      transform: "translateY(-2px)"
    }
  },
  cancelButton: {
    padding: "12px 25px",
    fontSize: "16px",
    background: "linear-gradient(135deg, #E53935 0%, #C62828 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "48%",
    fontWeight: "500",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #F44336 0%, #E53935 100%)",
      boxShadow: "0 0 15px rgba(229, 57, 53, 0.5)",
      transform: "translateY(-2px)"
    }
  },
  paymentOptions: {
    marginTop: "25px",
    background: "rgba(15, 22, 36, 0.5)",
    borderRadius: "10px",
    padding: "15px",
    border: "1px solid rgba(187, 225, 250, 0.1)"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "rgba(15, 22, 36, 0.7)",
    borderRadius: "12px",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(187, 225, 250, 0.1)"
  },
  spinner: {
    border: "5px solid rgba(31, 41, 55, 0.3)",
    borderTop: "5px solid #BBE1FA",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
    boxShadow: "0 0 15px rgba(187, 225, 250, 0.3)"
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" }
  },
};

export default Cart;