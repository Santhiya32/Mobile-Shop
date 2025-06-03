import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import UserRegister from "./components/UserRegister";
import AdminDashboard from "./components/AdminDashboard";
import StaffDashboard from "./components/StaffDashboard";
import UserPage from "./components/UserPage";
import Products from "./components/Products";
import Cart from "./components/Cart";
import OrderList from "./components/OrderList";
import ProductDetails from "./components/ProductDetails";
import ForgotPassword from "./components/ForgotPassword";
import { useState } from "react";

const App = () => {
  const role = localStorage.getItem("role");
  const [cart, setCart] = useState([]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/admin/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/order-list" element={<OrderList />} />
      <Route
        path="/admin"
        element={
          role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/staff"
        element={
          role === "staff" ? <StaffDashboard /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/user"
        element={
          role === "user" ? (
            <UserPage cart={cart} setCart={setCart} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/products"
        element={
          role === "user" ? (
            <Products cart={cart} setCart={setCart} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/cart"
        element={
          role === "user" ? (
            <Cart cart={cart} setCart={setCart} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/product/:id"
        element={
          role === "user" ? (
            <ProductDetails cart={cart} setCart={setCart} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
};

export default App;
