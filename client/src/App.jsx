import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ServiceList from "./components/services/ServiceList";
import ServicesByCategory from "./components/services/ServicesByCategory";
import CategoryGrid from "./components/categories/CategoryGrid";
import ServiceDetail from "./components/services/ServiceDetail";
import MyServices from "./components/services/MyServices";
import MyOrders from "./components/orders/MyOrders";
import OrderDetail from "./components/orders/OrderDetail";
import PaymentPage from "./components/payment/PaymentPage";
import PaymentSetup from "./components/freelancer/PaymentSetup"; // Add this import
import Notifications from "./components/Notifications";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Navbar />
          <Notifications />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/categories" element={<CategoryGrid />} />
            <Route path="/services" element={<ServicesByCategory />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/my-services" element={<MyServices />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders/:orderId/payment" element={<PaymentPage />} />
            {/* Add the new route */}
            <Route path="/payment-setup" element={<PaymentSetup />} />
            {/* Routes for Stripe Connect redirects */}
            <Route
              path="/freelancer/onboarding/complete"
              element={<PaymentSetup />}
            />
            <Route
              path="/freelancer/onboarding/refresh"
              element={<PaymentSetup />}
            />
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
