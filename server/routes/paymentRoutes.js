// server/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { isAuthenticated, hasRole } = require("../middleware/authMiddleware");

// Create payment intent (client only)
router.post(
  "/create-payment-intent",
  isAuthenticated,
  hasRole(["client"]),
  paymentController.createPaymentIntent
);

// Stripe webhook - no auth needed as it comes from Stripe
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

// Get payment for an order
router.get(
  "/order/:orderId",
  isAuthenticated,
  paymentController.getOrderPayment
);

// Release payment to freelancer (admin only)
router.post(
  "/:paymentId/release",
  isAuthenticated,
  hasRole(["admin"]),
  paymentController.releasePayment
);

// Create Connect account
router.post(
  "/create-connect-account",
  isAuthenticated,
  hasRole(["freelancer"]),
  paymentController.createConnectAccount
);

// Check account status
router.get(
  "/account-status",
  isAuthenticated,
  hasRole(["freelancer"]),
  paymentController.getConnectAccountStatus
);

// Handle Connect account webhook events
router.post(
  "/connect-webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleConnectWebhook
);

module.exports = router;
