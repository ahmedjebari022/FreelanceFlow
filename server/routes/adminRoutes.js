const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAuthenticated, hasRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
// Apply admin authentication middleware to all routes
router.use(isAuthenticated, hasRole(["admin"]));

// Dashboard stats
router.get("/stats", adminController.getDashboardStats);

// User management routes
router.get("/users", adminController.getAllUsers);
router.get("/users/:userId", adminController.getUserById);
router.put("/users/:userId", upload.single('profileImage'), adminController.updateUser);
router.delete("/users/:userId", adminController.deleteUser);

// Service management routes
router.get("/services", adminController.getAllServices);
router.get("/services/:serviceId", adminController.getServiceById);
router.put("/services/:serviceId", adminController.updateService);
router.patch("/services/:serviceId/status", adminController.updateServiceStatus);
router.delete("/services/:serviceId", adminController.deleteService);

// Order management routes
router.get("/orders", adminController.getAllOrders);
router.get("/orders/:orderId", adminController.getOrderById);
router.put("/orders/:orderId/status", adminController.updateOrderStatus);

// Payment management routes
router.get("/payments", adminController.getAllPayments);
router.get("/payments/:paymentId", adminController.getPaymentById);

// Analytics routes
router.get("/revenue-stats", adminController.getRevenueStats);

// Admin user management
router.post("/create-admin", adminController.createAdminUser);

module.exports = router;
