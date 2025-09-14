const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { isAuthenticated, hasRole } = require("../middleware/authMiddleware");

// Get all orders for current user
router.get("/", isAuthenticated, orderController.getMyOrders);

// Get single order
router.get("/:id", isAuthenticated, orderController.getOrderById);

// Create new order
router.post(
  "/",
  isAuthenticated,
  hasRole(["client"]),
  orderController.createOrder
);

// Update order status
router.put("/:id/status", isAuthenticated, orderController.updateOrderStatus);

// Add message to order
router.post("/:id/messages", isAuthenticated, orderController.addMessage);

// Get messages for an order
router.get("/:id/messages", isAuthenticated, orderController.getOrderMessages);

module.exports = router;
