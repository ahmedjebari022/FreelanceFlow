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
import EarningsDashboard from "./components/freelancer/EarningsDashboard"; // Import the new component
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminUsers from "./components/admin/AdminUsers";
import UserDetails from "./components/admin/UserDetails"; // Import UserDetails component
import AdminCategories from "./components/admin/AdminCategories"; // Import AdminCategories component
import AdminServices from "./components/admin/AdminServices";
import AdminServiceDetails from "./components/admin/AdminServiceDetails";
import AdminOrders from "./components/admin/AdminOrders";
import AdminOrderDetail from "./components/admin/AdminOrderDetail";
// Add these imports
import AdminPayments from "./components/admin/AdminPayments";
import AdminPaymentDetail from "./components/admin/AdminPaymentDetail";
import PaymentStats from "./components/admin/PaymentStats";

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
            <Route path="/services" element={<ServiceList />} />{" "}
            {/* This is for all services */}
            <Route
              path="/services-by-category"
              element={<ServicesByCategory />}
            />{" "}
            {/* Add this line */}
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/my-services" element={<MyServices />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders/:orderId/payment" element={<PaymentPage />} />
            {/* Add the new route */}
            <Route path="/payment-setup" element={<PaymentSetup />} />
            <Route path="/earnings" element={<EarningsDashboard />} />{" "}
            {/* New route for earnings */}
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
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:userId" element={<UserDetails />} />{" "}
              {/* New route for user details */}
              <Route path="services" element={<AdminServices />} />
              <Route
                path="services/:serviceId"
                element={<AdminServiceDetails />}
              />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:orderId" element={<AdminOrderDetail />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route
                path="payments/:paymentId"
                element={<AdminPaymentDetail />}
              />
              <Route path="revenue" element={<PaymentStats />} />
              <Route
                path="categories"
                element={<AdminCategories />} // Use the actual component here
              />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
